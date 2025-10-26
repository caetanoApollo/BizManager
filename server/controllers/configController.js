const db = require('../config/db');

exports.getConfigsByUserId = async (req, res) => {
    const usuario_id = req.params.id;
    
    if (!usuario_id) {
        return res.status(400).json({ error: 'ID do usuário não informado.' });
    }

    try {
        let [rows] = await db.query('SELECT * FROM configuracoes WHERE usuario_id = ?', [usuario_id]);
        
        if (rows.length === 0) {
            await db.query(
                'INSERT INTO configuracoes (usuario_id, notificacoes_estoque, integracao_google_calendar) VALUES (?, TRUE, FALSE)',
                [usuario_id]
            );
            [rows] = await db.query('SELECT * FROM configuracoes WHERE usuario_id = ?', [usuario_id]);
        }
        
        const userConfigs = rows[0];

        const configsResponse = {
            ...userConfigs,
            notificacoes_estoque: !!userConfigs.notificacoes_estoque,
            integracao_google_calendar: !!userConfigs.integracao_google_calendar,
        };

        return res.json(configsResponse);

    } catch (err) {
        console.error('Erro ao buscar configurações:', err);
        res.status(500).json({ error: 'Erro ao buscar configurações.' });
    }
};

exports.updateConfigs = async (req, res) => {
    const usuario_id = req.params.id; 
    const { notificacoes_estoque, integracao_google_calendar } = req.body;

    if (!usuario_id) {
        return res.status(400).json({ error: 'ID do usuário não informado.' });
    }

    if (typeof notificacoes_estoque !== 'boolean' || typeof integracao_google_calendar !== 'boolean') {
        return res.status(400).json({ error: 'Valores de configuração inválidos. Devem ser booleanos.' });
    }

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
    } catch (err)
        {
        console.error('Erro ao atualizar configurações:', err);
        res.status(500).json({ error: 'Erro ao atualizar configurações.' });
    }
};