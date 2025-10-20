-- drop database bizmanager;
select * from usuarios;
select * from clientes;
select * from transacoes_financeiras;
select * from servicos_agendados;

create database bizmanager;
use bizmanager;

-- Tabela de users (MEIs) --
create table usuarios (
	id int auto_increment primary key,
    nome varchar(255) not null,
    email varchar(255) not null,
    senha varchar(255) not null, -- senha criptografada
	telefone varchar(20) not null,
    cnpj varchar(18) unique not null,
    passwordResetExpires DATETIME DEFAULT NULL,
    passwordResetToken VARCHAR(255) DEFAULT NULL,
    foto_perfil longblob null,
    data_criacao timestamp default current_timestamp
);

-- Tabela de clientes -- 
CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telefone VARCHAR(20),
    observacoes TEXT,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela de produtos (estoque) --
CREATE TABLE IF NOT EXISTS produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    quantidade INT NOT NULL DEFAULT 0,
    quantidade_minima INT DEFAULT 5,  -- Valor padrão para alertas
    preco_custo DECIMAL(10,2) NOT NULL,
    preco_venda DECIMAL(10,2) NOT NULL,
    fornecedor VARCHAR(100),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela de transações financeiras -- 
CREATE TABLE IF NOT EXISTS transacoes_financeiras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT,
    valor DECIMAL(10,2) NOT NULL,
    data DATE NOT NULL,
    tipo ENUM('Entrada', 'Saída') NOT NULL,
    categoria VARCHAR(50),
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela de notas fiscais -- 
CREATE TABLE IF NOT EXISTS notas_fiscais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    cliente_id INT,
    numero VARCHAR(50) UNIQUE NOT NULL,
    servico_fornecido TEXT NOT NULL,
    cnpj_tomador VARCHAR(18) NOT NULL,
    data_emissao DATE NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    status ENUM('emitida', 'cancelada') DEFAULT 'emitida',
    arquivo_pdf LONGBLOB,
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL
);

-- Tabela de serviços agendados --
CREATE TABLE IF NOT EXISTS servicos_agendados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    cliente_id INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT,
    data DATE NOT NULL,
    horario TIME NOT NULL,
    status ENUM('agendado', 'concluido', 'cancelado') DEFAULT 'agendado',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

-- Tabela de configurações do usuário --
CREATE TABLE IF NOT EXISTS configuracoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNIQUE NOT NULL,
    notificacoes_estoque BOOLEAN DEFAULT TRUE,
    integracao_google_calendar BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

ALTER TABLE configuracoes
ADD COLUMN push_token VARCHAR(255) NULL;