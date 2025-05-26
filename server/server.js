require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcrypt');
const multer = require('multer');
const upload = multer();

const app = express();
app.use(cors());
app.use(express.json());

// Rota de cadastro de usuário
app.post('/api/cadastro', upload.single('foto_perfil'), async (req, res) => {
    const { nome, email, senha, telefone, cnpj } = req.body;
    const foto_perfil = req.file ? req.file.buffer : null;
    if (!nome || !email || !senha || !telefone || !cnpj) {
        return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }
    try {
        const [existe] = await db.query('SELECT id FROM usuarios WHERE cnpj = ? OR email = ?', [cnpj, email]);
        if (existe.length > 0) {
            return res.status(409).json({ error: 'CNPJ ou e-mail já cadastrado.' });
        }
        const hashedPassword = await bcrypt.hash(senha, 10);
        const [result] = await db.query(
            'INSERT INTO usuarios (nome, email, senha, telefone, cnpj, foto_perfil) VALUES (?, ?, ?, ?, ?, ?)',
            [nome, email, hashedPassword, telefone, cnpj, foto_perfil]
        );
        res.status(201).json({ id: result.insertId, nome, email, telefone, cnpj });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
    }
});

// Rota de login de usuário
app.post('/api/login', async (req, res) => {
    const { cnpj, senha } = req.body;
    if (!cnpj || !senha) {
        return res.status(400).json({ error: 'CNPJ e senha são obrigatórios.' });
    }
    try {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE cnpj = ?', [cnpj]);
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Usuário não encontrado.' });
        }
        const usuario = rows[0];
        if (usuario.senha !== senha) {
            return res.status(401).json({ error: 'Senha incorreta.' });
        }
        res.json({ id: usuario.id, nome: usuario.nome, email: usuario.email, telefone: usuario.telefone, cnpj: usuario.cnpj });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao fazer login.' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});