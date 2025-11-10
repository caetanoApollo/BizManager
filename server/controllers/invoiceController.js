const db = require('../config/db');
const axios = require('axios');

const focusApi = axios.create({
    baseURL: process.env.FOCUSNFE_URL || 'https://api.focusnfe.com.br',
    auth: {
        username: process.env.FOCUSNFE_TOKEN,
        password: ''
    }
});

exports.createInvoice = async (req, res) => {
    const usuario_id = req.user.id;

    const { cliente_id, tomador, servico, data_emissao } = req.body;

    let newInvoiceId;

    try {
        const [userRows] = await db.query('SELECT cnpj, inscricao_municipal, codigo_municipio FROM usuarios WHERE id = ?', [usuario_id]);
        if (userRows.length === 0) {
            return res.status(404).json({ error: 'Usuário (Prestador) não encontrado.' });
        }

        const prestador = userRows[0];
        if (!prestador.cnpj || !prestador.inscricao_municipal || !prestador.codigo_municipio) {
            return res.status(400).json({ error: 'Complete seus dados fiscais (CNPJ, Inscrição Municipal, Cód. Município) no seu perfil antes de emitir notas.' });
        }

        const [result] = await db.query(
            `INSERT INTO notas_fiscais (usuario_id, cliente_id, data_emissao, valor, discriminacao_servico, cnpj_tomador, razao_social_tomador, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 'pendente')`,
            [
                usuario_id,
                cliente_id || null,
                data_emissao,
                servico.valor_servicos,
                servico.discriminacao,
                tomador.cnpj,
                tomador.razao_social
            ]
        );
        newInvoiceId = result.insertId;

        const focusPayload = {
            data_emissao,
            prestador: {
                cnpj: prestador.cnpj.replace(/\D/g, ''),
                inscricao_municipal: prestador.inscricao_municipal,
                codigo_municipio: prestador.codigo_municipio
            },
            tomador: {
                ...tomador,
                cnpj: tomador.cnpj.replace(/\D/g, '')
            },
            servico: {
                ...servico,
                iss_retido: "false",
                item_lista_servico: servico.item_lista_servico || "01.07",
                codigo_tributario_municipio: servico.codigo_tributario_municipio || "01.07.00"
            }
        };

        const ref = `nf_${newInvoiceId}`;
        const focusResponse = await focusApi.post(`/v2/nfse?ref=${ref}`, focusPayload);

        const { data } = focusResponse;
        await db.query(
            `UPDATE notas_fiscais SET 
                focus_id = ?, ref = ?, status = ?, numero = ?, serie = ?, 
                codigo_verificacao = ?, url_pdf = ?, url_xml = ?, mensagem_erro = NULL
             WHERE id = ?`,
            [
                data.id, ref, data.status, data.numero, data.serie,
                data.codigo_verificacao, data.url_pdf, data.url_xml,
                newInvoiceId
            ]
        );

        res.status(focusResponse.status).json(data);

    } catch (err) {
        console.error('Erro ao criar nota fiscal:', err.response ? err.response.data : err.message);

        if (err.response && err.response.data && err.response.data.erros) {
            const erroMsg = JSON.stringify(err.response.data.erros);

            if (newInvoiceId) {
                await db.query('UPDATE notas_fiscais SET status = ?, mensagem_erro = ? WHERE id = ?', ['erro', erroMsg, newInvoiceId]);
            }
            return res.status(err.response.status).json({ error: 'Erro de validação da API de notas.', details: erroMsg });
        }

        if (newInvoiceId) {
            await db.query('UPDATE notas_fiscais SET status = ?, mensagem_erro = ? WHERE id = ?', ['erro', err.message, newInvoiceId]);
        }
        res.status(500).json({ error: 'Erro interno ao processar nota fiscal.' });
    }
};

exports.getInvoicesByUserId = async (req, res) => {
    const { usuario_id } = req.params;
    try {
        const [rows] = await db.query(
            `SELECT id, numero, razao_social_tomador, valor, status, data_emissao, url_pdf 
             FROM notas_fiscais 
             WHERE usuario_id = ? 
             ORDER BY data_emissao DESC`,
            [usuario_id]
        );
        res.status(200).json(rows);
    } catch (err) {
        console.error('Erro ao buscar notas fiscais:', err);
        res.status(500).json({ error: 'Erro ao buscar notas fiscais.' });
    }
};

exports.getInvoiceById = async (req, res) => {
    const { id } = req.params;
    const usuario_id = req.user.id;
    try {
        const [rows] = await db.query(
            'SELECT * FROM notas_fiscais WHERE id = ? AND usuario_id = ?',
            [id, usuario_id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Nota fiscal não encontrada.' });
        }
        res.status(200).json(rows[0]);
    } catch (err) {
        console.error('Erro ao buscar detalhes da nota fiscal:', err);
        res.status(500).json({ error: 'Erro ao buscar detalhes da nota fiscal.' });
    }
};

exports.consultInvoiceStatus = async (req, res) => {
    const { id } = req.params;
    const usuario_id = req.user.id;

    try {
        const [rows] = await db.query('SELECT focus_id FROM notas_fiscais WHERE id = ? AND usuario_id = ?', [id, usuario_id]);
        if (rows.length === 0 || !rows[0].focus_id) {
            return res.status(404).json({ error: 'Nota fiscal não encontrada ou sem ID de referência.' });
        }

        const focus_id = rows[0].focus_id;
        const focusResponse = await focusApi.get(`/v2/nfse/${focus_id}`);
        const { data } = focusResponse;

        await db.query(
            `UPDATE notas_fiscais SET 
                status = ?, numero = ?, serie = ?, codigo_verificacao = ?, 
                url_pdf = ?, url_xml = ?, mensagem_erro = ?
             WHERE id = ?`,
            [
                data.status, data.numero, data.serie, data.codigo_verificacao,
                data.url_pdf, data.url_xml,
                data.status === 'erro' ? data.mensagem_sefaz : null,
                id
            ]
        );

        res.status(200).json(data);
    } catch (err) {
        console.error('Erro ao consultar status:', err.response ? err.response.data : err.message);
        res.status(500).json({ error: 'Erro ao consultar status da nota.' });
    }
};

exports.cancelInvoice = async (req, res) => {
    const { id } = req.params;
    const usuario_id = req.user.id;

    try {
        const [rows] = await db.query('SELECT focus_id FROM notas_fiscais WHERE id = ? AND usuario_id = ?', [id, usuario_id]);
        if (rows.length === 0 || !rows[0].focus_id) {
            return res.status(404).json({ error: 'Nota fiscal não encontrada ou sem ID de referência.' });
        }

        const focus_id = rows[0].focus_id;
        await focusApi.delete(`/v2/nfse/${focus_id}`);

        await db.query('UPDATE notas_fiscais SET status = ? WHERE id = ?', ['cancelado', id]);

        res.status(200).json({ message: 'Solicitação de cancelamento enviada com sucesso.' });
    } catch (err) {
        console.log('Erro ao cancelar nota fiscal:', err.response ? err.response.data : err.message);
        const apiError = err.response ? err.response.data.erros[0].mensagem : 'Erro desconhecido.';
        res.status(500).json({ error: `Erro ao cancelar nota: ${apiError}` });
    }
};