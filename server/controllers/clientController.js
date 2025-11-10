/*
 * ARQUIVO: server/controllers/clientController.js (Atualizado)
 *
 * O que mudou:
 * 1. `createClient`: Recebe e insere todos os novos campos (cnpj, endereco_...).
 * 2. `updateClient`: Recebe e atualiza todos os novos campos.
 * 3. `getClientById` e `getClientsByUserId`: Já retornavam `*`, então estão prontos.
 */
const db = require('../config/db');    

exports.createClient = async (req, res) => {
    const { 
        usuario_id, nome, email, telefone, observacoes, 
        cnpj, endereco_logradouro, endereco_numero, endereco_complemento, 
        endereco_bairro, endereco_cep, endereco_uf, endereco_codigo_municipio 
    } = req.body;

    if (!usuario_id || !nome || !telefone) {
        return res.status(400).json({ error: 'ID do Usuário, Nome e Telefone são obrigatórios para o cliente.' });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO clientes (
                usuario_id, nome, email, telefone, observacoes, 
                cnpj, endereco_logradouro, endereco_numero, endereco_complemento, 
                endereco_bairro, endereco_cep, endereco_uf, endereco_codigo_municipio
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                usuario_id, nome, email || null, telefone, observacoes || null,
                cnpj || null, endereco_logradouro || null, endereco_numero || null, endereco_complemento || null,
                endereco_bairro || null, endereco_cep || null, endereco_uf || null, endereco_codigo_municipio || null
            ]
        );
        console.log(`Novo cliente cadastrado: ID ${result.insertId}, Nome ${nome}`);
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
        console.error('Erro ao cadastrar cliente:', err);
        res.status(500).json({ error: 'Erro ao cadastrar cliente.' });
    }
};

exports.getClientsByUserId = async (req, res) => {
    const { usuario_id } = req.params;

    try {
        const [rows] = await db.query('SELECT * FROM clientes WHERE usuario_id = ?', [usuario_id]);
        res.status(200).json(rows);
    } catch (err) {
        console.error('Erro ao buscar clientes:', err);
        res.status(500).json({ error: 'Erro ao buscar clientes.' });
    }
};

exports.getClientById = async (req, res) => {
    const { id } = req.params;

    try {
        const [client] = await db.query('SELECT * FROM clientes WHERE id = ?', [id]);
        if (client.length === 0) {
            return res.status(404).json({ error: 'Cliente não encontrado.' });
        }
        res.status(200).json(client[0]);
    } catch (err) {
        console.error('Erro ao buscar cliente:', err);
        res.status(500).json({ error: 'Erro ao buscar cliente.' });
    }
};

exports.updateClient = async (req, res) => {
    const { id } = req.params; 
    const { 
        usuario_id, nome, email, telefone, observacoes,
        cnpj, endereco_logradouro, endereco_numero, endereco_complemento, 
        endereco_bairro, endereco_cep, endereco_uf, endereco_codigo_municipio
    } = req.body; 

    if (!nome || !telefone || !usuario_id) {
        return res.status(400).json({ error: 'Nome, telefone e ID do usuário são obrigatórios para atualização do cliente.' });
    }

    try {
        const [existingClient] = await db.query('SELECT id FROM clientes WHERE id = ? AND usuario_id = ?', [id, usuario_id]);
        if (existingClient.length === 0) {
            return res.status(403).json({ error: 'Cliente não encontrado ou você não tem permissão para editá-lo.' });
        }

        const [result] = await db.query(
            `UPDATE clientes SET 
                nome = ?, email = ?, telefone = ?, observacoes = ?, 
                cnpj = ?, endereco_logradouro = ?, endereco_numero = ?, endereco_complemento = ?, 
                endereco_bairro = ?, endereco_cep = ?, endereco_uf = ?, endereco_codigo_municipio = ?
             WHERE id = ?`,
            [
                nome, email || null, telefone, observacoes || null,
                cnpj || null, endereco_logradouro || null, endereco_numero || null, endereco_complemento || null,
                endereco_bairro || null, endereco_cep || null, endereco_uf || null, endereco_codigo_municipio || null,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cliente não encontrado para atualização.' });
        }
        console.log(`Cliente atualizado: ID ${id}`);
        res.status(200).json({ message: 'Cliente atualizado com sucesso!' });
    } catch (err) {
        console.error('Erro ao atualizar cliente:', err);
        res.status(500).json({ error: 'Erro ao atualizar cliente.' });
    }
};

exports.deleteClient = async (req, res) => {
    const { id } = req.params; 
    // O usuario_id deve vir do token de autenticação, não do body
    const usuario_id = req.user.id; 

    if (!usuario_id) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    try {
        const [existingClient] = await db.query('SELECT id FROM clientes WHERE id = ? AND usuario_id = ?', [id, usuario_id]);
        if (existingClient.length === 0) {
            return res.status(403).json({ error: 'Cliente não encontrado ou você não tem permissão para excluí-lo.' });
        }

        const [result] = await db.query('DELETE FROM clientes WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cliente não encontrado para exclusão.' });
        }
        console.log(`Cliente excluído: ID ${id}`);
        res.status(200).json({ message: 'Cliente excluído com sucesso!' });
    } catch (err) {
        console.error('Erro ao excluir cliente:', err);
        res.status(500).json({ error: 'Erro ao excluir cliente.' });
    }
};