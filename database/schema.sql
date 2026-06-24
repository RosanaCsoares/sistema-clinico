-- Tabela 1: Contas de Acesso (Login)
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela 2: Ficha Clínica do Paciente
CREATE TABLE IF NOT EXISTS informacoes_clinicas (
    id_info INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    nome TEXT NOT NULL,
    sobrenome TEXT NOT NULL,
    rg TEXT,
    cpf TEXT NOT NULL UNIQUE,
    data_nascimento DATE,
    sexo TEXT,
    tipo_sanguineo TEXT,
    alergias TEXT,
    medicamentos TEXT,
    doencas TEXT,
    cirurgias TEXT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- Tabela 3: Contacto de Emergência
CREATE TABLE IF NOT EXISTS contatos_emergencia (
    id_contato INTEGER PRIMARY KEY AUTOINCREMENT,
    id_info INTEGER NOT NULL,
    nome_contato TEXT NOT NULL,
    telefone TEXT NOT NULL,
    email_contato TEXT,
    FOREIGN KEY (id_info) REFERENCES informacoes_clinicas(id_info) ON DELETE CASCADE
);

-- Tabela 4: Senha de Acesso Público
CREATE TABLE IF NOT EXISTS senhas_publicas (
    id_senha INTEGER PRIMARY KEY AUTOINCREMENT,
    id_info INTEGER NOT NULL,
    senha_publica TEXT NOT NULL,
    data_geracao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_info) REFERENCES informacoes_clinicas(id_info) ON DELETE CASCADE
);

-- Tabela 5: Geração e Armazenamento do Link do QR Code
CREATE TABLE IF NOT EXISTS qrcodes (
    id_qrcode INTEGER PRIMARY KEY AUTOINCREMENT,
    id_info INTEGER NOT NULL,
    link_publico TEXT NOT NULL,
    data_geracao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_info) REFERENCES informacoes_clinicas(id_info) ON DELETE CASCADE
);