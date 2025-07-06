const db = require('../config/db');

exports.getConfigsByUserId = async (req, res) => {
    const { usuario_id } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM configuracoes WHERE usuario_id = ?', [usuario_id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Configurações não encontradas para este usuário.' });
        }
        res.status(200).json(rows[0]);
    } catch (err) {
        console.error('Erro ao buscar configurações:', err);
        res.status(500).json({ error: 'Erro ao buscar configurações.' });
    }
};

exports.updateConfigs = async (req, res) => {
    const { usuario_id } = req.params; 
    const { notificacoes_estoque, integracao_google_calendar } = req.body;

    try {
        const [existingConfigs] = await db.query('SELECT id FROM configuracoes WHERE usuario_id = ?', [usuario_id]);

        if (existingConfigs.length > 0) {
            await db.query(
                'UPDATE configuracoes SET notificacoes_estoque = ?, integracao_google_calendar = ? WHERE usuario_id = ?',
                [notificacoes_estoque, integracao_google_calendar, usuario_id]
            );
            res.status(200).json({ message: 'Configurações atualizadas com sucesso!' });
        } else {
            await db.query(
                'INSERT INTO configuracoes (usuario_id, notificacoes_estoque, integracao_google_calendar) VALUES (?, ?, ?)',
                [usuario_id, notificacoes_estoque, integracao_google_calendar]
            );
            res.status(201).json({ message: 'Configurações criadas com sucesso!' });
        }
    } catch (err) {
        console.error('Erro ao atualizar configurações:', err);
        res.status(500).json({ error: 'Erro ao atualizar configurações.' });
    }
};