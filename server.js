const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Configurações do Express
app.use(cors());
app.use(express.json()); // Para o servidor entender dados em formato JSON
app.use(express.urlencoded({ extended: true }));

// Servir os ficheiros estáticos do Frontend (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'frontend')));

// ---------------------------------------------------------
// CONFIGURAÇÃO DA BASE DE DADOS (SQLite)
// ---------------------------------------------------------
const dbPath = path.join(__dirname, 'database', 'database.db');
const schemaPath = path.join(__dirname, 'database', 'schema.sql');

// Ligar à base de dados (se o ficheiro não existir, ele cria automaticamente)
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao ligar à base de dados:', err.message);
    } else {
        console.log('Ligação ao SQLite bem-sucedida.');
        
        // Executar o schema.sql para criar as tabelas (se ainda não existirem)
        const schema = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schema, (err) => {
            if (err) {
                console.error('Erro ao criar as tabelas:', err.message);
            } else {
                console.log('Tabelas verificadas/criadas com sucesso.');
            }
        });
    }
});

// ---------------------------------------------------------
// INICIAR O SERVIDOR
// ---------------------------------------------------------
app.listen(PORT, () => {
    console.log(`Servidor a correr em http://localhost:${PORT}`);
    console.log(`Para aceder ao sistema, abra o link acima no seu navegador.`);
});