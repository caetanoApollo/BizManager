const db = require('../config/db');

exports.createTransaction = async (req, res) => {
    const { usuario_id, titulo, descricao, valor, data, tipo, categoria } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO transacoes_financeiras (usuario_id, titulo, descricao, valor, data, tipo, categoria) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [usuario_id, titulo, descricao || null, valor, data, tipo, categoria || null]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
        console.error('Erro ao cadastrar transação financeira:', err);
        res.status(500).json({ error: 'Erro ao cadastrar transação financeira.' });
    }
};

exports.getTransactionsByUserId = async (req, res) => {
    const { usuario_id } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM transacoes_financeiras WHERE usuario_id = ?', [usuario_id]);
        res.status(200).json(rows);
    } catch (err) {
        console.error('Erro ao buscar transações financeiras:', err);
        res.status(500).json({ error: 'Erro ao buscar transações financeiras.' });
    }
};

exports.updateTransaction = async (req, res) => {
    const { id } = req.params;
    const { usuario_id, titulo, descricao, valor, data, tipo, categoria } = req.body;

    try {
        const [existingTransaction] = await db.query('SELECT id FROM transacoes_financeiras WHERE id = ? AND usuario_id = ?', [id, usuario_id]);
        if (existingTransaction.length === 0) {
            return res.status(403).json({ error: 'Transação não encontrada ou você não tem permissão para editá-la.' });
        }

        const [result] = await db.query(
            'UPDATE transacoes_financeiras SET titulo = ?, descricao = ?, valor = ?, data = ?, tipo = ?, categoria = ? WHERE id = ?',
            [titulo, descricao || null, valor, data, tipo, categoria || null, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Transação não encontrada para atualização.' });
        }
        res.status(200).json({ message: 'Transação financeira atualizada com sucesso!' });
    } catch (err) {
        console.error('Erro ao atualizar transação financeira:', err);
        res.status(500).json({ error: 'Erro ao atualizar transação financeira.' });
    }
};

exports.deleteTransaction = async (req, res) => {
    const { id } = req.params;
    const { usuario_id } = req.body; 

    try {
        const [existingTransaction] = await db.query('SELECT id FROM transacoes_financeiras WHERE id = ? AND usuario_id = ?', [id, usuario_id]);
        if (existingTransaction.length === 0) {
            return res.status(403).json({ error: 'Transação não encontrada ou você não tem permissão para excluí-la.' });
        }

        const [result] = await db.query('DELETE FROM transacoes_financeiras WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Transação não encontrada para exclusão.' });
        }
        res.status(200).json({ message: 'Transação financeira excluída com sucesso!' });
    } catch (err) {
        console.error('Erro ao excluir transação financeira:', err);
        res.status(500).json({ error: 'Erro ao excluir transação financeira.' });
    }
};