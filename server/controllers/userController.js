const db = require('../db');
const bcrypt = require('bcrypt');

exports.cadastrarUsuario = async (req, res) => {
    const { nome, email, senha, telefone, cnpj } = req.body;
    const foto_perfil = req.file ? req.file.buffer : null;
    if (!nome || !email || !senha || !telefone || !cnpj) {
        console.warn('Tentativa de cadastro com campos obrigatórios faltando.');
        return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }
    try {
        const [existe] = await db.query('SELECT id FROM usuarios WHERE cnpj = ? OR email = ?', [cnpj, email]);
        if (existe.length > 0) {
            console.warn('Tentativa de cadastro com CNPJ ou e-mail já cadastrado.');
            return res.status(409).json({ error: 'CNPJ ou e-mail já cadastrado.' });
        }
        const hashedPassword = await bcrypt.hash(senha, 10);
        const [result] = await db.query(
            'INSERT INTO usuarios (nome, email, senha, telefone, cnpj, foto_perfil) VALUES (?, ?, ?, ?, ?, ?)',
            [nome, email, hashedPassword, telefone, cnpj, foto_perfil]
        );
        console.log(`Novo usuário cadastrado: ID ${result.insertId}, CNPJ ${cnpj}, E-mail ${email}`);
        res.status(201).json({ id: result.insertId, nome, email, telefone, cnpj });
    } catch (err) {
        console.error('Erro ao cadastrar usuário:', err);
        res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
    }
};

// Login
exports.loginUsuario = async (req, res) => {
    const { cnpj, senha } = req.body;
    if (!cnpj || !senha) {
        console.warn('Tentativa de login sem CNPJ ou senha.');
        return res.status(400).json({ error: 'CNPJ e senha são obrigatórios.' });
    }
    try {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE cnpj = ?', [cnpj]);
        if (rows.length === 0) {
            console.warn(`Tentativa de login com CNPJ não cadastrado: ${cnpj}`);
            return res.status(401).json({ error: 'Usuário não encontrado.' });
        }
        const usuario = rows[0];
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            console.warn(`Senha incorreta para o CNPJ: ${cnpj}`);
            return res.status(401).json({ error: 'Senha incorreta.' }); 
        }
        console.log(`Login realizado com sucesso para o usuário ID ${usuario.id}, CNPJ ${usuario.cnpj}`);
        res.json({ id: usuario.id, nome: usuario.nome, email: usuario.email, telefone: usuario.telefone, cnpj: usuario.cnpj });
    } catch (err) {
        console.error('Erro ao fazer login:', err);
        res.status(500).json({ error: 'Erro ao fazer login.' });
    }
};