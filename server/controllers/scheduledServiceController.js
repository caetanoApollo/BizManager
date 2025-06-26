const db = require('../config/db');

exports.createScheduledService = async (req, res) => {
    const { usuario_id, cliente_id, titulo, descricao, data, horario, status } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO servicos_agendados (usuario_id, cliente_id, titulo, descricao, data, horario, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [usuario_id, cliente_id, titulo, descricao || null, data, horario, status || 'agendado']
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
        console.error('Erro ao cadastrar serviço agendado:', err);
        res.status(500).json({ error: 'Erro ao cadastrar serviço agendado.' });
    }
};

exports.getScheduledServicesByUserId = async (req, res) => {
    const { usuario_id } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM servicos_agendados WHERE usuario_id = ?', [usuario_id]);
        res.status(200).json(rows);
    } catch (err) {
        console.error('Erro ao buscar serviços agendados:', err);
        res.status(500).json({ error: 'Erro ao buscar serviços agendados.' });
    }
};

exports.updateScheduledService = async (req, res) => {
    const { id } = req.params;
    const { usuario_id, cliente_id, titulo, descricao, data, horario, status } = req.body;

    try {
        const [existingService] = await db.query('SELECT id FROM servicos_agendados WHERE id = ? AND usuario_id = ?', [id, usuario_id]);
        if (existingService.length === 0) {
            return res.status(403).json({ error: 'Serviço agendado não encontrado ou você não tem permissão para editá-lo.' });
        }

        const [result] = await db.query(
            'UPDATE servicos_agendados SET cliente_id = ?, titulo = ?, descricao = ?, data = ?, horario = ?, status = ? WHERE id = ?',
            [cliente_id, titulo, descricao || null, data, horario, status || 'agendado', id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Serviço agendado não encontrado para atualização.' });
        }
        res.status(200).json({ message: 'Serviço agendado atualizado com sucesso!' });
    } catch (err) {
        console.error('Erro ao atualizar serviço agendado:', err);
        res.status(500).json({ error: 'Erro ao atualizar serviço agendado.' });
    }
};

exports.deleteScheduledService = async (req, res) => {
    const { id } = req.params;
    const { usuario_id } = req.body;

    try {
        const [existingService] = await db.query('SELECT id FROM servicos_agendados WHERE id = ? AND usuario_id = ?', [id, usuario_id]);
        if (existingService.length === 0) {
            return res.status(403).json({ error: 'Serviço agendado não encontrado ou você não tem permissão para excluí-lo.' });
        }

        const [result] = await db.query('DELETE FROM servicos_agendados WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Serviço agendado não encontrado para exclusão.' });
        }
        res.status(200).json({ message: 'Serviço agendado excluído com sucesso!' });
    } catch (err) {
        console.error('Erro ao excluir serviço agendado:', err);
        res.status(500).json({ error: 'Erro ao excluir serviço agendado.' });
    }
};