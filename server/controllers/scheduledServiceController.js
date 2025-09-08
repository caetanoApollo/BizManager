const db = require('../config/db');

exports.createScheduledService = async (req, res) => {
    const usuario_id = req.user.id;
    const { cliente_id, titulo, descricao, data, horario, status } = req.body;

    try {
        const [result] = await db.query(
            'INSERT INTO servicos_agendados (usuario_id, cliente_id, titulo, descricao, data, horario, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [usuario_id, cliente_id, titulo, descricao || null, data, horario, status || 'agendado']
        );
        res.status(201).json({ id: result.insertId, usuario_id, ...req.body });
    } catch (err) {
        console.error('Erro ao cadastrar serviço agendado:', err);
        res.status(500).json({ error: 'Erro ao cadastrar serviço agendado.' });
    }
};

exports.getScheduledServicesByUserId = async (req, res) => {
    const usuario_id = req.user.id;
    try {
        const [rows] = await db.query(
            `SELECT sa.*, c.nome as nome_cliente 
             FROM servicos_agendados sa 
             LEFT JOIN clientes c ON sa.cliente_id = c.id 
             WHERE sa.usuario_id = ? 
             ORDER BY sa.data DESC, sa.horario ASC`,
            [usuario_id]
        );
        res.status(200).json(rows);
    } catch (err) {
        console.error('Erro ao buscar serviços agendados:', err);
        res.status(500).json({ error: 'Erro ao buscar serviços agendados.' });
    }
};

exports.getScheduledServiceById = async (req, res) => {
    const usuario_id = req.user.id;
    const { id } = req.params;

    try {
        const [rows] = await db.query(
            `SELECT sa.*, c.nome as nome_cliente 
             FROM servicos_agendados sa 
             LEFT JOIN clientes c ON sa.cliente_id = c.id 
             WHERE sa.id = ? AND sa.usuario_id = ?`,
            [id, usuario_id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Serviço agendado não encontrado.' });
        }
        res.status(200).json(rows[0]);
    } catch (err) {
        console.error('Erro ao buscar serviço agendado:', err);
        res.status(500).json({ error: 'Erro ao buscar serviço agendado.' });
    }
};

exports.updateScheduledService = async (req, res) => {
    const usuario_id = req.user.id;
    const { id } = req.params;
    const { cliente_id, titulo, descricao, data, horario, status } = req.body;

    try {
        const [result] = await db.query(
            'UPDATE servicos_agendados SET cliente_id = ?, titulo = ?, descricao = ?, data = ?, horario = ?, status = ? WHERE id = ? AND usuario_id = ?',
            [cliente_id, titulo, descricao || null, data, horario, status || 'agendado', id, usuario_id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Serviço agendado não encontrado ou você não tem permissão para editá-lo.' });
        }
        res.status(200).json({ message: 'Serviço agendado atualizado com sucesso!' });
    } catch (err) {
        console.error('Erro ao atualizar serviço agendado:', err);
        res.status(500).json({ error: 'Erro ao atualizar serviço agendado.' });
    }
};

exports.deleteScheduledService = async (req, res) => {
    const usuario_id = req.user.id;
    const { id } = req.params;

    try {
        const [result] = await db.query('DELETE FROM servicos_agendados WHERE id = ? AND usuario_id = ?', [id, usuario_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Serviço agendado não encontrado ou você não tem permissão para excluí-lo.' });
        }
        res.status(200).json({ message: 'Serviço agendado excluído com sucesso!' });
    }
    catch (err) {
        console.error('Erro ao excluir serviço agendado:', err);
        res.status(500).json({ error: 'Erro ao excluir serviço agendado.' });
    }
};

