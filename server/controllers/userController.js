const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

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


exports.loginUsuario = async (req, res) => {
    const { identificador, senha } = req.body;
    if (!identificador || !senha) {
        console.warn('Tentativa de login sem identificador ou senha.');
        return res.status(400).json({ error: 'Identificador (CNPJ ou E-mail) e senha são obrigatórios.' });
    }
    try {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE cnpj = ? OR email = ?', [identificador, identificador]);
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
            { expiresIn: '1h' }
        );
        console.log(`Login realizado com sucesso para o usuário ID ${usuario.id}, Identificador ${identificador}`);
        res.json({ token, usuario_id: usuario.id, nome: usuario.nome, email: usuario.email, telefone: usuario.telefone, cnpj: usuario.cnpj });
    } catch (err) {
        console.error('Erro ao fazer login:', err);
        res.status(500).json({ error: 'Erro ao fazer login.' });
    }
};

exports.editarUsuario = async (req, res) => {
    const { id } = req.params;
    const { nome, email, telefone, cnpj, senha } = req.body;
    const foto_perfil = req.file ? req.file.buffer : undefined;

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
        if (cnpj) { campos.push('cnpj = ?'); valores.push(cnpj); }
        if (foto_perfil !== undefined) { campos.push('foto_perfil = ?'); valores.push(foto_perfil); }
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

exports.excluirUsuario = async (req, res) => {
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
        const user = rows[0];

        if (user.foto_perfil) {
            user.profile_picture_base64 = Buffer.from(user.foto_perfil).toString('base64');
        }

        res.status(200).json(user);
    } catch (err) {
        console.error('Erro ao buscar perfil:', err);
        res.status(500).json({ error: 'Erro ao buscar perfil.' });
    }
};

exports.updateUserProfile = async (req, res) => {
    const { id } = req.params;
    const { nome, email, telefone, cnpj, senha } = req.body; //

    try {
        let query = 'UPDATE usuarios SET ';
        const params = [];
        const fieldsToUpdate = [];

        if (nome !== undefined) {
            fieldsToUpdate.push('nome = ?');
            params.push(nome);
        }
        if (email !== undefined) {
            fieldsToUpdate.push('email = ?');
            params.push(email);
        }
        if (telefone !== undefined) {
            fieldsToUpdate.push('telefone = ?');
            params.push(telefone);
        }
        if (cnpj !== undefined) {
            const rawCnpj = cnpj.replace(/[^0-9]/g, '');
            fieldsToUpdate.push('cnpj = ?');
            params.push(rawCnpj);
        }
        if (senha !== undefined && senha !== '') {
            const hashedPassword = await bcrypt.hash(senha, 10); // Hash da nova senha
            fieldsToUpdate.push('senha = ?');
            params.push(hashedPassword);
        }

        if (user.foto_perfil) {
            user.profile_picture_base64 = Buffer.from(user.foto_perfil).toString('base64');
        }

        if (fieldsToUpdate.length === 0) {
            return res.status(400).json({ error: 'Nenhum dado para atualizar fornecido.' });
        }

        query += fieldsToUpdate.join(', ') + ' WHERE id = ?';
        params.push(id);

        const [result] = await db.query(query, params); //

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado ou nenhum dado alterado.' });
        }

        res.status(200).json({ message: 'Dados do usuário atualizados com sucesso!' });
    } catch (err) {
        console.error('Erro ao atualizar dados do usuário:', err); //
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