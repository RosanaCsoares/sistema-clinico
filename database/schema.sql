-- Criação do Banco de Dados
CREATE DATABASE IF NOT EXISTS systemmed_db;
USE systemmed_db;

-- Tabela 1: Contas de Acesso (Login)
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela 2: Ficha Clínica do Paciente
CREATE TABLE informacoes_clinicas (
    id_info INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    sobrenome VARCHAR(100) NOT NULL,
    rg VARCHAR(20),
    cpf VARCHAR(14) NOT NULL UNIQUE,
    data_nascimento DATE,
    sexo VARCHAR(10),
    tipo_sanguineo VARCHAR(5),
    alergias TEXT,
    medicamentos TEXT,
    doencas TEXT,
    cirurgias TEXT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- Tabela 3: Contato de Emergência
CREATE TABLE contatos_emergencia (
    id_contato INT AUTO_INCREMENT PRIMARY KEY,
    id_info INT NOT NULL,
    nome_contato VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email_contato VARCHAR(100),
    FOREIGN KEY (id_info) REFERENCES informacoes_clinicas(id_info) ON DELETE CASCADE
);

-- Tabela 4: Senha de Acesso Público (Exigência do Projeto)
CREATE TABLE senhas_publicas (
    id_senha INT AUTO_INCREMENT PRIMARY KEY,
    id_info INT NOT NULL,
    senha_publica VARCHAR(255) NOT NULL,
    data_geracao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_info) REFERENCES informacoes_clinicas(id_info) ON DELETE CASCADE
);

-- Tabela 5: Geração e Armazenamento do Link do QR Code
CREATE TABLE qrcodes (
    id_qrcode INT AUTO_INCREMENT PRIMARY KEY,
    id_info INT NOT NULL,
    link_publico VARCHAR(255) NOT NULL,
    data_geracao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_info) REFERENCES informacoes_clinicas(id_info) ON DELETE CASCADE
);