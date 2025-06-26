const db = require('../config/db');

exports.createInvoice = async (req, res) => {
    const { usuario_id, cliente_id, numero, servico_fornecido, cnpj_tomador, data_emissao, valor, status } = req.body;
    // const arquivo_pdf = req.file ? req.file.buffer : null; 

    try {
        const [result] = await db.query(
            'INSERT INTO notas_fiscais (usuario_id, cliente_id, numero, servico_fornecido, cnpj_tomador, data_emissao, valor, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [usuario_id, cliente_id || null, numero, servico_fornecido, cnpj_tomador, data_emissao, valor, status || 'emitida']
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
        console.error('Erro ao cadastrar nota fiscal:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Número da nota fiscal já existe.' });
        }
        res.status(500).json({ error: 'Erro ao cadastrar nota fiscal.' });
    }
};

exports.getInvoicesByUserId = async (req, res) => {
    const { usuario_id } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM notas_fiscais WHERE usuario_id = ?', [usuario_id]);
        res.status(200).json(rows);
    } catch (err) {
        console.error('Erro ao buscar notas fiscais:', err);
        res.status(500).json({ error: 'Erro ao buscar notas fiscais.' });
    }
};

exports.updateInvoice = async (req, res) => {
    const { id } = req.params;
    const { usuario_id, cliente_id, numero, servico_fornecido, cnpj_tomador, data_emissao, valor, status } = req.body;
    // const arquivo_pdf = req.file ? req.file.buffer : undefined; // Se você estiver usando multer para PDF

    try {
        const [existingInvoice] = await db.query('SELECT id FROM notas_fiscais WHERE id = ? AND usuario_id = ?', [id, usuario_id]);
        if (existingInvoice.length === 0) {
            return res.status(403).json({ error: 'Nota fiscal não encontrada ou você não tem permissão para editá-la.' });
        }

        const updateFields = {
            cliente_id: cliente_id || null, 
            numero, 
            servico_fornecido, 
            cnpj_tomador, 
            data_emissao, 
            valor, 
            status: status || 'emitida'
        };
        // if (arquivo_pdf !== undefined) { updateFields.arquivo_pdf = arquivo_pdf; }

        const [result] = await db.query('UPDATE notas_fiscais SET ? WHERE id = ?', [updateFields, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Nota fiscal não encontrada para atualização.' });
        }
        res.status(200).json({ message: 'Nota fiscal atualizada com sucesso!' });
    } catch (err) {
        console.error('Erro ao atualizar nota fiscal:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Número da nota fiscal já existe para outro registro.' });
        }
        res.status(500).json({ error: 'Erro ao atualizar nota fiscal.' });
    }
};

exports.deleteInvoice = async (req, res) => {
    const { id } = req.params;
    const { usuario_id } = req.body;

    try {
        const [existingInvoice] = await db.query('SELECT id FROM notas_fiscais WHERE id = ? AND usuario_id = ?', [id, usuario_id]);
        if (existingInvoice.length === 0) {
            return res.status(403).json({ error: 'Nota fiscal não encontrada ou você não tem permissão para excluí-la.' });
        }

        const [result] = await db.query('DELETE FROM notas_fiscais WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Nota fiscal não encontrada para exclusão.' });
        }
        res.status(200).json({ message: 'Nota fiscal excluída com sucesso!' });
    } catch (err) {
        console.error('Erro ao excluir nota fiscal:', err);
        res.status(500).json({ error: 'Erro ao excluir nota fiscal.' });
    }
};