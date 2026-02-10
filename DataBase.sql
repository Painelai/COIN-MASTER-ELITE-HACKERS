
-- ==========================================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS CM ELITE
-- v1.2 - Protocolo Jarvis (MySQL / MariaDB)
-- ==========================================================

CREATE DATABASE IF NOT EXISTS elite_system;
USE elite_system;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    pass VARCHAR(255) NOT NULL,
    balance DECIMAL(10,2) DEFAULT 0.00,
    plan VARCHAR(50) DEFAULT 'FREE',
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO users (email, pass, balance, plan, status) 
VALUES ('admin@admin.com', 'admin123', 5000.00, 'VITALÍCIO ELITE', 'ACTIVE');

INSERT IGNORE INTO users (email, pass, balance, plan, status) 
VALUES ('user', 'user', 1250.00, 'VITALÍCIO ELITE', 'ACTIVE');

CREATE INDEX idx_user_email ON users(email);
