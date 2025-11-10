/*
 * ARQUIVO: server/controllers/userController.js (Atualizado)
 *
 * O que mudou:
 * 1. `registerUser`: Agora recebe e insere `inscricao_municipal` e `codigo_municipio`.
 * 2. `updateUserProfile`: Agora permite a atualização de `inscricao_municipal` e `codigo_municipio`.
 * 3. `getUserProfile`: Agora retorna os novos campos fiscais.
 */
require('dotenv').config();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fetch = require('node-fetch'); 

const checkCNPJStatus = async (cnpj) => {
    const cnpjClean = cnpj.replace(/[^\d]/g, '');
    console.log(cnpjClean);
    const API_URL = `https://publica.cnpj.ws/cnpj/${cnpjClean}`;

    try {
        const response = await fetch(API_URL);

        if (response.status === 400) {
            return { valid: false, error: 'CNPJ não encontrado ou inválido na base da Receita Federal.' };
        }

        if (!response.ok) {
            throw new Error(`Erro ao consultar CNPJ: Status ${response.status}`);
        }

        const data = await response.json();
        if (data.estabelecimento?.situacao_cadastral !== 'Ativa') {
            return { valid: false, error: 'CNPJ encontrado, mas a situação cadastral não está ATIVA. Apenas CNPJs ativos podem se cadastrar.' };
        }

        return { valid: true, data };

    } catch (error) {
        console.error('Erro de rede ou na API CNPJws:', error);
        return { valid: false, error: 'Falha na comunicação com o serviço de validação de CNPJ. Tente novamente mais tarde.' };
    }
};

exports.registerUser = async (req, res) => {
    console.log('Iniciando processo de cadastro de usuário...');
    const { nome, email, senha, telefone, cnpj, inscricao_municipal, codigo_municipio } = req.body;
    
    if (!nome || !email || !senha || !telefone || !cnpj) {
        console.warn('Tentativa de cadastro com campos obrigatórios faltando.');
        return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }
    
    const cnpjClean = cnpj.replace(/[^\d]/g, '');

    try {
        console.log(`Validando CNPJ: ${cnpjClean}`);
        const cnpjValidation = await checkCNPJStatus(cnpjClean);
        if (!cnpjValidation.valid) {
            return res.status(400).json({ error: cnpjValidation.error });
        }
        
        const [existe] = await db.query('SELECT id FROM usuarios WHERE cnpj = ? OR email = ?', [cnpjClean, email]);
        if (existe.length > 0) {
            return res.status(409).json({ error: 'Já existe um usuário com este CNPJ ou E-mail.' });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);
        
        const [result] = await db.query(
            'INSERT INTO usuarios (nome, email, senha, telefone, cnpj, inscricao_municipal, codigo_municipio) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nome, email, hashedPassword, telefone, cnpjClean, inscricao_municipal || null, codigo_municipio || null]
        );
        
        console.log(`Novo usuário cadastrado: ID ${result.insertId}, CNPJ ${cnpjClean}, E-mail ${email}`);

        await db.query(
            'INSERT INTO configuracoes (usuario_id, notificacoes_estoque, integracao_google_calendar) VALUES (?, TRUE, FALSE)',
            [result.insertId]
        );

        res.status(201).json({ id: result.insertId, nome, email, telefone, cnpj: cnpjClean });
    } catch (err) {
        console.error('Erro ao cadastrar usuário:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Já existe um usuário com este CNPJ ou E-mail.' });
        }
        res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
    }
};

exports.loginUser = async (req, res) => {
    const { identificador, senha } = req.body;
    if (!identificador || !senha) {
        console.warn('Tentativa de login sem identificador ou senha.');
        return res.status(400).json({ error: 'Identificador (CNPJ ou E-mail) e senha são obrigatórios.' });
    }
    try {
        const loginIdentificador = identificador.includes('@') ? identificador : identificador.replace(/[^\d]/g, '');

        const [rows] = await db.query(
            'SELECT * FROM usuarios WHERE cnpj = ? OR email = ?',
            [loginIdentificador, identificador]
        );

        if (rows.length === 0) {
            console.warn(`Tentativa de login com identificador não cadastrado: ${identificador}`);
            return res.status(401).json({ error: 'Usuário não encontrado.' });
        }
        const usuario = rows[0];
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            console.warn(`Senha incorreta para o identificador: ${identificador}`);
            return res.status(401).json({ error: 'Senha incorreta.' });
        }

        const token = jwt.sign(
            { id: usuario.id, email: usuario.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Ajuste o tempo de expiração conforme necessário
        );
        console.log(`Login realizado com sucesso para o usuário ID ${usuario.id}, Identificador ${identificador}`);
        res.json({ token, usuario_id: usuario.id, nome: usuario.nome, email: usuario.email, telefone: usuario.telefone, cnpj: usuario.cnpj });
    } catch (err) {
        console.error('Erro ao fazer login:', err);
        res.status(500).json({ error: 'Erro ao fazer login.' });
    }
};

exports.editUser = async (req, res) => {
    const { id } = req.params;
    const { nome, email, telefone, cnpj, senha, inscricao_municipal, codigo_municipio } = req.body;

    try {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        let campos = [];
        let valores = [];
        if (nome) { campos.push('nome = ?'); valores.push(nome); }
        if (email) { campos.push('email = ?'); valores.push(email); }
        if (telefone) { campos.push('telefone = ?'); valores.push(telefone); }
        if (cnpj) { campos.push('cnpj = ?'); valores.push(cnpj.replace(/[^\d]/g, '')); }
        if (inscricao_municipal) { campos.push('inscricao_municipal = ?'); valores.push(inscricao_municipal); }
        if (codigo_municipio) { campos.push('codigo_municipio = ?'); valores.push(codigo_municipio); }
        if (senha) {
            const hashedPassword = await bcrypt.hash(senha, 10);
            campos.push('senha = ?');
            valores.push(hashedPassword);
        }
        if (campos.length === 0) {
            return res.status(400).json({ error: 'Nenhum campo para atualizar.' });
        }
        valores.push(id);

        await db.query(`UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`, valores);
        res.json({ message: 'Usuário atualizado com sucesso.' });
    } catch (err) {
        console.error('Erro ao editar usuário:', err);
        res.status(500).json({ error: 'Erro ao editar usuário.' });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM usuarios WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        res.json({ message: 'Usuário excluído com sucesso.' });
    } catch (err) {
        console.error('Erro ao excluir usuário:', err);
        res.status(500).json({ error: 'Erro ao excluir usuário.' });
    }
};

exports.getUserProfile = async (req, res) => {
    const userId = req.params.id;
    try {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE id = ?', [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        const usuario = rows[0];
        res.json({
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            telefone: usuario.telefone,
            cnpj: usuario.cnpj,
            inscricao_municipal: usuario.inscricao_municipal,
            codigo_municipio: usuario.codigo_municipio
        });
    } catch (err) {
        console.error('Erro ao buscar perfil do usuário:', err);
        res.status(500).json({ error: 'Erro ao buscar perfil do usuário.' });
    }
};

exports.updateUserProfile = async (req, res) => {
    const { id } = req.params;
    // Assegura que o usuário só pode editar seu próprio perfil (visto que `authMiddleware` adiciona `req.user.id`)
    if (req.user.id !== parseInt(id, 10)) {
         return res.status(403).json({ error: 'Você não tem permissão para editar este usuário.' });
    }
    
    const { nome, email, telefone, cnpj, senha, inscricao_municipal, codigo_municipio } = req.body;

    try {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        const user = rows[0];

        const campos = [];
        const valores = [];

        if (nome) { campos.push('nome = ?'); valores.push(nome); }
        if (email) { campos.push('email = ?'); valores.push(email); }
        if (telefone) { campos.push('telefone = ?'); valores.push(telefone); }
        if (cnpj) { campos.push('cnpj = ?'); valores.push(cnpj.replace(/[^\d]/g, '')); }
        if (inscricao_municipal) { campos.push('inscricao_municipal = ?'); valores.push(inscricao_municipal); }
        if (codigo_municipio) { campos.push('codigo_municipio = ?'); valores.push(codigo_municipio); }
        if (senha) {
            const hashedPassword = await bcrypt.hash(senha, 10);
            campos.push('senha = ?');
            valores.push(hashedPassword);
        }

        if (campos.length === 0) {
            return res.status(400).json({ error: 'Nenhum dado para atualizar.' });
        }

        valores.push(id);

        await db.query(
            `UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`,
            valores
        );

        res.json({ message: 'Dados do usuário atualizados com sucesso.' });
    } catch (err) {
        console.error('Erro ao atualizar dados do usuário:', err);
        res.status(500).json({ error: 'Erro ao atualizar dados do usuário.' });
    }
};

exports.resetPassword = async (req, res) => {
    const { email, token, newPassword } = req.body;
    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const [users] = await db.query(
            'SELECT * FROM usuarios WHERE email = ? AND passwordResetToken = ? AND passwordResetExpires > ?',
            [email, hashedToken, new Date()]
        );

        if (users.length === 0) {
            return res.status(400).json({ error: 'Código de recuperação inválido ou expirado.' });
        }

        const user = users[0];
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.query(
            'UPDATE usuarios SET senha = ?, passwordResetToken = NULL, passwordResetExpires = NULL WHERE id = ?',
            [hashedPassword, user.id]
        );

        res.status(200).json({ message: 'Senha redefinida com sucesso.' });
    } catch (err) {
        console.error('Erro ao redefinir senha:', err);
        res.status(500).json({ error: 'Erro ao redefinir a senha.' });
    }
};