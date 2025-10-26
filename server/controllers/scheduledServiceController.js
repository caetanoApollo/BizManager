require('dotenv').config();
const db = require('../config/db');
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'postmessage'
);

const getAuthenticatedClient = async (userId) => {
    let connection;
    try {
        connection = await db.getConnection();
        const [configRows] = await connection.query('SELECT google_access_token, google_refresh_token, google_token_expiry FROM configuracoes WHERE usuario_id = ?', [userId]);

        if (configRows.length === 0 || !configRows[0].google_refresh_token) {
            console.log(`Usuário ${userId} não conectado ao Google Calendar ou refresh token ausente.`);
            return null;
        }

        const config = configRows[0];
        const client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );

        client.setCredentials({
            access_token: config.google_access_token,
            refresh_token: config.google_refresh_token,
            expiry_date: config.google_token_expiry ? Number(config.google_token_expiry) : null,
        });

        client.on('tokens', async (tokens) => {
            let updateQuery = 'UPDATE configuracoes SET google_access_token = ?, google_token_expiry = ?';
            const updateValues = [tokens.access_token, tokens.expiry_date];

            if (tokens.refresh_token) {
                console.log("Novo refresh token recebido, atualizando DB para userId:", userId);
                updateQuery += ', google_refresh_token = ?';
                updateValues.push(tokens.refresh_token);
            }
            console.log("Access token atualizado, atualizando DB para userId:", userId);
            updateQuery += ' WHERE usuario_id = ?';
            updateValues.push(userId);

            let updateConnection;
            try {
                updateConnection = await db.getConnection();
                await updateConnection.query(updateQuery, updateValues);
            } catch (dbError) {
                console.error("Erro ao atualizar tokens no DB:", dbError);
            } finally {
                if (updateConnection) updateConnection.release();
            }
        });

        if (config.google_token_expiry && Number(config.google_token_expiry) < (Date.now() + 60000)) {
            console.log("Token perto de expirar para userId:", userId, "Tentando refresh...");
            try {
                await client.refreshAccessToken();
            } catch (refreshError) {
                console.error("Erro ao tentar refresh do token para userId:", userId, refreshError.response?.data || refreshError.message);
                let disconnectConnection;
                try {
                    disconnectConnection = await db.getConnection();
                    await disconnectConnection.query('UPDATE configuracoes SET google_access_token = NULL, google_refresh_token = NULL, google_token_expiry = NULL, integracao_google_calendar = FALSE WHERE usuario_id = ?', [userId]);
                    console.log(`Refresh token inválido para userId: ${userId}. Desconectado do Google Calendar.`);
                    return null;
                } catch (dbError) {
                    console.error("Erro ao desconectar usuário no DB após falha no refresh:", dbError);
                    throw new Error('Falha ao atualizar token de acesso e ao desconectar a conta Google.');
                } finally {
                    if (disconnectConnection) disconnectConnection.release();
                }
            }
        }
        return client;
    } catch (error) {
        console.error(`Erro em getAuthenticatedClient para userId ${userId}:`, error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

const createGoogleCalendarEvent = async (userId, eventData) => {
    try {
        const auth = await getAuthenticatedClient(userId);
        if (!auth) {
            console.log(`Não foi possível obter cliente autenticado para criar evento Google (userId: ${userId}). Integração pode estar desligada ou token inválido.`);
            return null;
        }
        const calendar = google.calendar({ version: 'v3', auth });

        const startDateTime = `${eventData.data}T${eventData.horario}:00`;
        const endHour = parseInt(eventData.horario.split(':')[0], 10) + 1;
        const endDateTime = `${eventData.data}T${String(endHour).padStart(2, '0')}:${eventData.horario.split(':')[1]}:00`;
        const timeZone = 'America/Sao_Paulo';

        const event = {
            summary: eventData.titulo,
            description: `Cliente: ${eventData.nome_cliente || 'Não informado'}\nDescrição: ${eventData.descricao || ''}`,
            start: { dateTime: startDateTime, timeZone: timeZone },
            end: { dateTime: endDateTime, timeZone: timeZone },
        };

        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
        });

        console.log('Evento criado no Google Calendar:', response.data.id);
        return response.data.id;

    } catch (error) {
        console.error('Erro ao criar evento no Google Calendar:', error.response?.data?.error || error.message);
        return null;
    }
};

const updateGoogleCalendarEvent = async (userId, eventId, eventData) => {
    if (!eventId) return null;

    try {
        const auth = await getAuthenticatedClient(userId);
        if (!auth) {
            console.log(`Não foi possível obter cliente autenticado para atualizar evento Google ${eventId} (userId: ${userId}).`);
            return null;
        }
        const calendar = google.calendar({ version: 'v3', auth });

        const startDateTime = `${eventData.data}T${eventData.horario}:00`;
        const endHour = parseInt(eventData.horario.split(':')[0], 10) + 1;
        const endDateTime = `${eventData.data}T${String(endHour).padStart(2, '0')}:${eventData.horario.split(':')[1]}:00`;
        const timeZone = 'America/Sao_Paulo';

        const event = {
            summary: eventData.titulo,
            description: `Cliente: ${eventData.nome_cliente || 'Não informado'}\nDescrição: ${eventData.descricao || ''}`,
            start: { dateTime: startDateTime, timeZone },
            end: { dateTime: endDateTime, timeZone },
        };

        const response = await calendar.events.update({
            calendarId: 'primary',
            eventId: eventId,
            requestBody: event,
        });
        console.log('Evento atualizado no Google Calendar:', response.data.id);
        return response.data.id;
    } catch (error) {
        console.error(`Erro ao atualizar evento ${eventId} no Google Calendar:`, error.response?.data?.error || error.message);
        if (error.response?.status === 404 || error.response?.status === 410) {
            console.log("Evento não encontrado no Google Calendar para atualização. Será removido localmente.");
            return 'DELETED';
        }
        return null;
    }
};

const deleteGoogleCalendarEvent = async (userId, eventId) => {
    if (!eventId) return;

    try {
        const auth = await getAuthenticatedClient(userId);
        if (!auth) {
            console.log(`Não foi possível obter cliente autenticado para deletar evento Google ${eventId} (userId: ${userId}).`);
            return;
        }
        const calendar = google.calendar({ version: 'v3', auth });

        await calendar.events.delete({
            calendarId: 'primary',
            eventId: eventId,
        });
        console.log('Evento deletado no Google Calendar:', eventId);
    } catch (error) {
        console.error(`Erro ao deletar evento ${eventId} no Google Calendar:`, error.response?.data?.error || error.message);
        if (error.response?.status !== 404 && error.response?.status !== 410) {
            console.warn("Erro não fatal ao deletar evento do Google Calendar.");
        }
    }
};

exports.createScheduledService = async (req, res) => {
    const usuario_id = req.user.id;
    const { cliente_id, titulo, descricao, data, horario, status } = req.body;

    if (!cliente_id || !titulo || !data || !horario) {
        return res.status(400).json({ error: 'Campos cliente_id, titulo, data e horario são obrigatórios.' });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [result] = await connection.query(
            'INSERT INTO servicos_agendados (usuario_id, cliente_id, titulo, descricao, data, horario, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [usuario_id, cliente_id, titulo, descricao || null, data, horario, status || 'agendado']
        );
        const insertId = result.insertId;

        const [clienteRows] = await connection.query('SELECT nome FROM clientes WHERE id = ?', [cliente_id]);
        const nome_cliente = clienteRows.length > 0 ? clienteRows[0].nome : null;

        const [configRows] = await connection.query('SELECT integracao_google_calendar FROM configuracoes WHERE usuario_id = ?', [usuario_id]);
        const shouldSync = configRows.length > 0 && configRows[0].integracao_google_calendar;

        let googleEventId = null;
        if (shouldSync) {
            console.log(`Tentando criar evento no Google Calendar para userId: ${usuario_id}`);
            googleEventId = await createGoogleCalendarEvent(usuario_id, { titulo, descricao, data, horario, nome_cliente });

            if (googleEventId) {
                await connection.query('UPDATE servicos_agendados SET google_calendar_event_id = ? WHERE id = ?', [googleEventId, insertId]);
                console.log(`Evento Google ${googleEventId} associado ao serviço agendado ${insertId}`);
            } else {
                console.log(`Não foi possível criar evento no Google Calendar para serviço agendado ${insertId}, mas o serviço foi salvo localmente.`);
            }
        }

        await connection.commit();
        res.status(201).json({ id: insertId, usuario_id, ...req.body, google_calendar_event_id: googleEventId });

    } catch (err) {
        if (connection) await connection.rollback();
        console.error('Erro ao cadastrar serviço agendado:', err);
        res.status(500).json({ error: 'Erro ao cadastrar serviço agendado.' });
    } finally {
        if (connection) connection.release();
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

    if (!cliente_id || !titulo || !data || !horario) {
        return res.status(400).json({ error: 'Campos cliente_id, titulo, data e horario são obrigatórios.' });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [currentServiceRows] = await connection.query(
            'SELECT google_calendar_event_id FROM servicos_agendados WHERE id = ? AND usuario_id = ?',
            [id, usuario_id]
        );

        if (currentServiceRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Serviço agendado não encontrado ou você não tem permissão para editá-lo.' });
        }
        const currentGoogleEventId = currentServiceRows[0].google_calendar_event_id;

        const [result] = await connection.query(
            'UPDATE servicos_agendados SET cliente_id = ?, titulo = ?, descricao = ?, data = ?, horario = ?, status = ? WHERE id = ? AND usuario_id = ?',
            [cliente_id, titulo, descricao || null, data, horario, status || 'agendado', id, usuario_id]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Falha ao atualizar o serviço localmente.' });
        }

        const [clienteRows] = await connection.query('SELECT nome FROM clientes WHERE id = ?', [cliente_id]);
        const nome_cliente = clienteRows.length > 0 ? clienteRows[0].nome : null;

        const [configRows] = await connection.query('SELECT integracao_google_calendar FROM configuracoes WHERE usuario_id = ?', [usuario_id]);
        const shouldSync = configRows.length > 0 && configRows[0].integracao_google_calendar;

        let updatedGoogleEventId = currentGoogleEventId;

        if (shouldSync) {
            if (currentGoogleEventId) {
                console.log(`Tentando atualizar evento ${currentGoogleEventId} no Google Calendar para userId: ${usuario_id}`);
                const updateResult = await updateGoogleCalendarEvent(usuario_id, currentGoogleEventId, { titulo, descricao, data, horario, nome_cliente });

                if (updateResult === 'DELETED') {
                    await connection.query('UPDATE servicos_agendados SET google_calendar_event_id = NULL WHERE id = ?', [id]);
                    updatedGoogleEventId = null;
                    console.log(`Evento Google ${currentGoogleEventId} não encontrado, ID removido do serviço agendado ${id}`);
                } else if (updateResult) {
                    updatedGoogleEventId = updateResult;
                    console.log(`Evento Google ${updatedGoogleEventId} atualizado para o serviço agendado ${id}`);
                } else {
                    console.warn(`Falha ao atualizar evento Google ${currentGoogleEventId} para serviço agendado ${id}. O serviço foi atualizado localmente.`);
                }
            } else {
                console.log(`Tentando criar novo evento no Google Calendar durante atualização para userId: ${usuario_id}`);
                const newGoogleEventId = await createGoogleCalendarEvent(usuario_id, { titulo, descricao, data, horario, nome_cliente });
                if (newGoogleEventId) {
                    await connection.query('UPDATE servicos_agendados SET google_calendar_event_id = ? WHERE id = ?', [newGoogleEventId, id]);
                    updatedGoogleEventId = newGoogleEventId;
                    console.log(`Novo evento Google ${updatedGoogleEventId} criado e associado ao serviço agendado ${id}`);
                } else {
                    console.log(`Não foi possível criar evento no Google Calendar durante atualização do serviço agendado ${id}.`);
                }
            }
        } else if (currentGoogleEventId) {
            await connection.query('UPDATE servicos_agendados SET google_calendar_event_id = NULL WHERE id = ?', [id]);
            console.log(`Integração Google desativada. ID do evento Google ${currentGoogleEventId} removido do serviço agendado ${id}.`);
            updatedGoogleEventId = null;
        }

        await connection.commit();
        res.status(200).json({ message: 'Serviço agendado atualizado com sucesso!', google_calendar_event_id: updatedGoogleEventId });

    } catch (err) {
        if (connection) await connection.rollback();
        console.error('Erro ao atualizar serviço agendado:', err);
        res.status(500).json({ error: 'Erro ao atualizar serviço agendado.' });
    } finally {
        if (connection) connection.release();
    }
};

exports.deleteScheduledService = async (req, res) => {
    const usuario_id = req.user.id;
    const { id } = req.params;

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [currentServiceRows] = await connection.query(
            'SELECT google_calendar_event_id FROM servicos_agendados WHERE id = ? AND usuario_id = ?',
            [id, usuario_id]
        );

        if (currentServiceRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Serviço agendado não encontrado ou você não tem permissão para excluí-lo.' });
        }
        const googleEventIdToDelete = currentServiceRows[0].google_calendar_event_id;

        const [result] = await connection.query('DELETE FROM servicos_agendados WHERE id = ? AND usuario_id = ?', [id, usuario_id]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Falha ao deletar o serviço localmente.' });
        }

        const [configRows] = await connection.query('SELECT integracao_google_calendar FROM configuracoes WHERE usuario_id = ?', [usuario_id]);
        const shouldSync = configRows.length > 0 && configRows[0].integracao_google_calendar;

        if (shouldSync && googleEventIdToDelete) {
            console.log(`Tentando deletar evento ${googleEventIdToDelete} do Google Calendar para userId: ${usuario_id}`);
            await deleteGoogleCalendarEvent(usuario_id, googleEventIdToDelete);
        }

        await connection.commit();
        res.status(200).json({ message: 'Serviço agendado excluído com sucesso!' });
    }
    catch (err) {
        if (connection) await connection.rollback();
        console.error('Erro ao excluir serviço agendado:', err);
        res.status(500).json({ error: 'Erro ao excluir serviço agendado.' });
    } finally {
        if (connection) connection.release();
    }
};