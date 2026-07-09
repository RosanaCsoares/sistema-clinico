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
// ROTAS DA API
// ==========================================

// 1. Rota para Receber o Cadastro Completo
app.post('/api/cadastro', (req, res) => {
    const { email, senha, nome, sobrenome, rg, cpf, dataNascimento, sexo, tipoSanguineo, alergias, medicamentos, doencas, cirurgias, contatoNome, contatoTelefone, contatoEmail, senhaPublica } = req.body;

    db.run(`INSERT INTO usuarios (email, senha) VALUES (?, ?)`, [email, senha], function(err) {
        if (err) return res.status(500).json({ erro: 'Erro ao criar utilizador. O email ou CPF já existem?' });
        
        const idUsuario = this.lastID;

        db.run(`INSERT INTO informacoes_clinicas (id_usuario, nome, sobrenome, rg, cpf, data_nascimento, sexo, tipo_sanguineo, alergias, medicamentos, doencas, cirurgias) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        [idUsuario, nome, sobrenome, rg, cpf, dataNascimento, sexo, tipoSanguineo, alergias, medicamentos, doencas, cirurgias], function(err) {
            if (err) return res.status(500).json({ erro: 'Erro ao salvar ficha clínica.' });

            const idInfo = this.lastID;

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
        SELECT u.email as email_usuario, ic.*, ce.nome_contato, ce.telefone, ce.email_contato, sp.senha_publica 
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

// 4. Rota para Atualizar Cadastro (Editar Completo)
app.put('/api/perfil/:idUsuario', (req, res) => {
    const idUsuario = req.params.idUsuario;
    const { nome, sobrenome, rg, cpf, dataNascimento, sexo, tipoSanguineo, alergias, medicamentos, doencas, cirurgias, nomeContato, telefoneContato, emailContato, senhaPublica } = req.body;

    db.get(`SELECT id_info FROM informacoes_clinicas WHERE id_usuario = ?`, [idUsuario], (err, row) => {
        if (err || !row) return res.status(500).json({ erro: 'Usuário não encontrado' });
        
        const idInfo = row.id_info;

        // Atualiza a Ficha Clínica inteira com todos os campos novos
        db.run(`UPDATE informacoes_clinicas SET nome = ?, sobrenome = ?, rg = ?, cpf = ?, data_nascimento = ?, sexo = ?, tipo_sanguineo = ?, alergias = ?, medicamentos = ?, doencas = ?, cirurgias = ? WHERE id_usuario = ?`, 
        [nome, sobrenome, rg, cpf, dataNascimento, sexo, tipoSanguineo, alergias, medicamentos, doencas, cirurgias, idUsuario], function(err) {
            if (err) return res.status(500).json({ erro: 'Erro ao atualizar ficha clínica' });

            // Atualiza Contato de Emergência completo
            db.run(`UPDATE contatos_emergencia SET nome_contato = ?, telefone = ?, email_contato = ? WHERE id_info = ?`, 
            [nomeContato, telefoneContato, emailContato, idInfo], function(err) {
                
                // Atualiza Senha Pública
                db.run(`UPDATE senhas_publicas SET senha_publica = ? WHERE id_info = ?`, 
                [senhaPublica, idInfo], function(err) {
                    res.json({ mensagem: 'Cadastro atualizado com sucesso!' });
                });
            });
        });
    });
});

// 5. Rota Pública de Emergência (Validar Senha e Retornar Dados)
app.post('/api/publico/:idInfo', (req, res) => {
    const idInfo = req.params.idInfo;
    const { senhaDigitada } = req.body;

    // Verifica se a senha confere com a do banco de dados
    db.get(`SELECT senha_publica FROM senhas_publicas WHERE id_info = ?`, [idInfo], (err, row) => {
        if (err) return res.status(500).json({ erro: 'Erro no servidor' });
        if (!row) return res.status(404).json({ erro: 'Ficha não encontrada' });
        
        if (row.senha_publica !== senhaDigitada) {
            return res.status(401).json({ erro: 'Senha incorreta' });
        }

        // Se a senha estiver correta, devolvemos apenas os dados vitais para emergência
        const sql = `
            SELECT ic.nome, ic.sobrenome, ic.data_nascimento, ic.sexo, ic.tipo_sanguineo, ic.alergias, ic.medicamentos, ic.doencas, ic.cirurgias,
                   ce.nome_contato, ce.telefone
            FROM informacoes_clinicas ic
            LEFT JOIN contatos_emergencia ce ON ic.id_info = ce.id_info
            WHERE ic.id_info = ?
        `;
        db.get(sql, [idInfo], (err, dados) => {
            if (err) return res.status(500).json({ erro: 'Erro ao buscar ficha clínica' });
            res.json(dados);
        });
    });
});

// 6. Rota para Apagar Cadastro Completo (NOVA)
app.delete('/api/perfil/:idUsuario', (req, res) => {
    const idUsuario = req.params.idUsuario;

    db.run(`DELETE FROM usuarios WHERE id_usuario = ?`, [idUsuario], function(err) {
        if (err) {
            console.error("Erro ao apagar conta:", err.message);
            return res.status(500).json({ erro: 'Erro ao apagar o cadastro no banco de dados.' });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ erro: 'Usuário não encontrado.' });
        }

        res.json({ mensagem: 'Cadastro apagado com sucesso!' });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor a correr em http://localhost:${PORT}`);
});
