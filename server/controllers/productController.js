const db = require('../config/db');

exports.createProduct = async (req, res) => {
    const { usuario_id, nome, descricao, quantidade, quantidade_minima, preco_custo, preco_venda, fornecedor } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO produtos (usuario_id, nome, descricao, quantidade, quantidade_minima, preco_custo, preco_venda, fornecedor) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [usuario_id, nome, descricao || null, quantidade, quantidade_minima || 5, preco_custo, preco_venda, fornecedor || null]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
        console.error('Erro ao cadastrar produto:', err);
        res.status(500).json({ error: 'Erro ao cadastrar produto.' });
    }
};

exports.getProductsByUserId = async (req, res) => {
    const { usuario_id } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM produtos WHERE usuario_id = ?', [usuario_id]);
        res.status(200).json(rows);
    } catch (err) {
        console.error('Erro ao buscar produtos:', err);
        res.status(500).json({ error: 'Erro ao buscar produtos.' });
    }
};

exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { usuario_id, nome, descricao, quantidade, quantidade_minima, preco_custo, preco_venda, fornecedor } = req.body;

    try {
        const [existingProduct] = await db.query('SELECT id FROM produtos WHERE id = ? AND usuario_id = ?', [id, usuario_id]);
        if (existingProduct.length === 0) {
            return res.status(403).json({ error: 'Produto não encontrado ou você não tem permissão para editá-lo.' });
        }

        const [result] = await db.query(
            'UPDATE produtos SET nome = ?, descricao = ?, quantidade = ?, quantidade_minima = ?, preco_custo = ?, preco_venda = ?, fornecedor = ? WHERE id = ?',
            [nome, descricao || null, quantidade, quantidade_minima || 5, preco_custo, preco_venda, fornecedor || null, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Produto não encontrado para atualização.' });
        }
        res.status(200).json({ message: 'Produto atualizado com sucesso!' });
    } catch (err) {
        console.error('Erro ao atualizar produto:', err);
        res.status(500).json({ error: 'Erro ao atualizar produto.' });
    }
};

exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    const { usuario_id } = req.body; 

    try {
        const [existingProduct] = await db.query('SELECT id FROM produtos WHERE id = ? AND usuario_id = ?', [id, usuario_id]);
        if (existingProduct.length != 0) {
            return res.status(403).json({ error: 'Produto não encontrado ou você não tem permissão para excluí-lo.' });
        }

        const [result] = await db.query('DELETE FROM produtos WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Produto não encontrado para exclusão.' });
        }
        res.status(200).json({ message: 'Produto excluído com sucesso!' });
    } catch (err) {
        console.error('Erro ao excluir produto:', err);
        res.status(500).json({ error: 'Erro ao excluir produto.' });
    }
};

exports.getLowStockAlerts = async (req, res) => {
    const usuario_id = req.user.id; 

    if (!usuario_id) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    try {
        const [lowStockProducts] = await db.query(`
            SELECT
                p.id,
                p.nome,
                p.quantidade,
                p.quantidade_minima
            FROM
                produtos p
            JOIN
                configuracoes c ON p.usuario_id = c.usuario_id
            WHERE
                p.usuario_id = ?
                AND p.quantidade <= p.quantidade_minima
                AND c.notificacoes_estoque = TRUE
        `, [usuario_id]);

        res.status(200).json(lowStockProducts);

    } catch (err) {
        console.error('Erro ao buscar alertas de estoque baixo:', err);
        res.status(500).json({ error: 'Erro ao buscar alertas de estoque.' });
    }
};