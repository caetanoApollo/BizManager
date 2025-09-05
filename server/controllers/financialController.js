const db = require('../config/db');

exports.createTransaction = async (req, res) => {
    // Verificação de segurança adicionada
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
    }
    const { titulo, descricao, valor, data, tipo, categoria } = req.body;
    const usuario_id = req.user.id;
    try {
        const [result] = await db.query(
            'INSERT INTO transacoes_financeiras (usuario_id, titulo, descricao, valor, data, tipo, categoria) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [usuario_id, titulo, descricao || null, valor, data, tipo, categoria || null]
        );
        res.status(201).json({ id: result.insertId, usuario_id, ...req.body });
    } catch (err) {
        console.error('Erro ao cadastrar transação financeira:', err);
        res.status(500).json({ error: 'Erro ao cadastrar transação financeira.' });
    }
};

exports.getTransactionsByUserId = async (req, res) => {
    // CORREÇÃO: Adicionada verificação para garantir que req.user exista
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
    }
    const usuario_id = req.user.id;
    try {
        const [rows] = await db.query('SELECT * FROM transacoes_financeiras WHERE usuario_id = ? ORDER BY data DESC', [usuario_id]);
        res.status(200).json(rows);
    } catch (err) {
        console.error('Erro ao buscar transações financeiras:', err);
        res.status(500).json({ error: 'Erro ao buscar transações financeiras.' });
    }
};

exports.getTransactionById = async (req, res) => {
    const { id } = req.params;
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
    }
    const usuario_id = req.user.id; 

    try {
        const [rows] = await db.query('SELECT * FROM transacoes_financeiras WHERE id = ? AND usuario_id = ?', [id, usuario_id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Transação não encontrada ou não pertence a este usuário.' });
        }
        res.status(200).json(rows[0]);
    } catch (err) {
        console.error('Erro ao buscar transação financeira:', err);
        res.status(500).json({ error: 'Erro ao buscar transação financeira.' });
    }
};

exports.updateTransaction = async (req, res) => {
    // Verificação de segurança adicionada
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
    }
    const { id } = req.params;
    const { titulo, descricao, valor, data, tipo, categoria } = req.body;
    const usuario_id = req.user.id;

    try {
        const [result] = await db.query(
            'UPDATE transacoes_financeiras SET titulo = ?, descricao = ?, valor = ?, data = ?, tipo = ?, categoria = ? WHERE id = ? AND usuario_id = ?',
            [titulo, descricao || null, valor, data, tipo, categoria || null, id, usuario_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Transação não encontrada ou você não tem permissão para editá-la.' });
        }
        res.status(200).json({ message: 'Transação financeira atualizada com sucesso!' });
    } catch (err) {
        console.error('Erro ao atualizar transação financeira:', err);
        res.status(500).json({ error: 'Erro ao atualizar transação financeira.' });
    }
};

exports.deleteTransaction = async (req, res) => {
    // Verificação de segurança adicionada
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
    }
    const { id } = req.params;
    const usuario_id = req.user.id; 

    try {
        const [result] = await db.query('DELETE FROM transacoes_financeiras WHERE id = ? AND usuario_id = ?', [id, usuario_id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Transação não encontrada ou você não tem permissão para excluí-la.' });
        }
        res.status(200).json({ message: 'Transação financeira excluída com sucesso!' });
    } catch (err) {
        console.error('Erro ao excluir transação financeira:', err);
        res.status(500).json({ error: 'Erro ao excluir transação financeira.' });
    }
};