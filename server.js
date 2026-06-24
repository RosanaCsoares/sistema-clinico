const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'frontend')));

// Ligação à Base de Dados SQLite
const dbPath = path.join(__dirname, 'database', 'database.db');
const schemaPath = path.join(__dirname, 'database', 'schema.sql');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Erro ao ligar ao SQLite:', err.message);
    else {
        console.log('Ligação ao SQLite bem-sucedida.');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schema, (err) => {
            if (err) console.error('Erro ao criar tabelas:', err.message);
            else console.log('Tabelas prontas.');
        });
    }
});

// ==========================================
// ROTAS DA API (O "CÉREBRO" DO SISTEMA)
// ==========================================

// 1. Rota para Receber o Cadastro Completo
app.post('/api/cadastro', (req, res) => {
    const { email, senha, nome, sobrenome, rg, cpf, dataNascimento, sexo, tipoSanguineo, alergias, medicamentos, doencas, cirurgias, contatoNome, contatoTelefone, contatoEmail, senhaPublica } = req.body;

    // Inserir na tabela de utilizadores
    db.run(`INSERT INTO usuarios (email, senha) VALUES (?, ?)`, [email, senha], function(err) {
        if (err) return res.status(500).json({ erro: 'Erro ao criar utilizador. O email já existe?' });
        
        const idUsuario = this.lastID; // Pega o ID gerado

        // Inserir na ficha clínica
        db.run(`INSERT INTO informacoes_clinicas (id_usuario, nome, sobrenome, rg, cpf, data_nascimento, sexo, tipo_sanguineo, alergias, medicamentos, doencas, cirurgias) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        [idUsuario, nome, sobrenome, rg, cpf, dataNascimento, sexo, tipoSanguineo, alergias, medicamentos, doencas, cirurgias], function(err) {
            if (err) return res.status(500).json({ erro: 'Erro ao salvar ficha clínica.' });

            const idInfo = this.lastID;

            // Inserir contato de emergência e senha pública
            db.run(`INSERT INTO contatos_emergencia (id_info, nome_contato, telefone, email_contato) VALUES (?, ?, ?, ?)`, [idInfo, contatoNome, contatoTelefone, contatoEmail]);
            db.run(`INSERT INTO senhas_publicas (id_info, senha_publica) VALUES (?, ?)`, [idInfo, senhaPublica]);
            db.run(`INSERT INTO qrcodes (id_info, link_publico) VALUES (?, ?)`, [idInfo, `http://localhost:3000/publico.html?id=${idInfo}`]);

            res.status(201).json({ mensagem: 'Cadastro realizado com sucesso!', idUsuario });
        });
    });
});

// 2. Rota de Login
app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;
    db.get(`SELECT id_usuario FROM usuarios WHERE email = ? AND senha = ?`, [email, senha], (err, row) => {
        if (err) return res.status(500).json({ erro: 'Erro no servidor' });
        if (!row) return res.status(401).json({ erro: 'E-mail ou senha incorretos' });
        
        res.json({ mensagem: 'Login bem-sucedido', idUsuario: row.id_usuario });
    });
});

// 3. Rota para Buscar os Dados do Perfil
app.get('/api/perfil/:idUsuario', (req, res) => {
    const idUsuario = req.params.idUsuario;
    const sql = `
        SELECT u.email, ic.*, ce.nome_contato, ce.telefone, sp.senha_publica 
        FROM usuarios u
        JOIN informacoes_clinicas ic ON u.id_usuario = ic.id_usuario
        LEFT JOIN contatos_emergencia ce ON ic.id_info = ce.id_info
        LEFT JOIN senhas_publicas sp ON ic.id_info = sp.id_info
        WHERE u.id_usuario = ?
    `;
    db.get(sql, [idUsuario], (err, row) => {
        if (err) return res.status(500).json({ erro: 'Erro ao buscar dados' });
        if (!row) return res.status(404).json({ erro: 'Perfil não encontrado' });
        res.json(row);
    });
});

app.listen(PORT, () => {
    console.log(`Servidor a correr em http://localhost:${PORT}`);
});