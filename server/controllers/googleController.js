const { google } = require('googleapis');
const db = require('../config/db');

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,     
    process.env.GOOGLE_CLIENT_SECRET, 
    process.env.GOOGLE_REDIRECT_URI || 'postmessage' 
);

exports.exchangeCodeForTokens = async (req, res) => {
    const { code, userId, redirectUri } = req.body; 

    if (!code || !userId) {
        return res.status(400).json({ error: 'Código de autorização ou ID do usuário ausente.' });
    }

    oauth2Client.redirectUri = redirectUri;

    try {
        console.log(`Trocando código para userId: ${userId} com redirectUri: ${redirectUri}`);
        const { tokens } = await oauth2Client.getToken(code);
        console.log('Tokens recebidos:', tokens);

        if (!tokens.refresh_token) {
            console.warn('Refresh token não recebido. O usuário pode já ter autorizado.');
        }

        const expiryDate = tokens.expiry_date ? Number(tokens.expiry_date) : null;

        const updateFields = {
            google_access_token: tokens.access_token,
            google_token_expiry: expiryDate,
            integracao_google_calendar: true 
        };
        if (tokens.refresh_token) {
            updateFields.google_refresh_token = tokens.refresh_token;
        }

        const [result] = await db.query(
            'UPDATE configuracoes SET ? WHERE usuario_id = ?',
            [updateFields, userId]
        );

        if (result.affectedRows === 0) {
            await db.query(
                'INSERT INTO configuracoes (usuario_id, google_access_token, google_refresh_token, google_token_expiry, integracao_google_calendar) VALUES (?, ?, ?, ?, ?)',
                [userId, tokens.access_token, tokens.refresh_token || null, expiryDate, true]
            );
        }

        res.status(200).json({ message: 'Tokens obtidos e armazenados com sucesso.' });

    } catch (error) {
        console.error('Erro ao trocar código por tokens:', error.response?.data || error.message);
        res.status(500).json({ error: 'Falha ao obter tokens do Google.', details: error.message });
    }
};

const getAuthenticatedClient = async (userId) => {
    const [configRows] = await db.query('SELECT google_access_token, google_refresh_token, google_token_expiry FROM configuracoes WHERE usuario_id = ?', [userId]);
    if (configRows.length === 0 || !configRows[0].google_refresh_token) { 
        throw new Error('Usuário não conectado ao Google Calendar ou refresh token ausente.');
    }

    const config = configRows[0];
    const client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );

    client.setCredentials({
        access_token: config.google_access_token,
        refresh_token: config.google_refresh_token,
        expiry_date: config.google_token_expiry,
    });

    client.on('tokens', async (tokens) => {
        if (tokens.refresh_token) {
            console.log("Novo refresh token recebido, atualizando DB para userId:", userId);
            await db.query('UPDATE configuracoes SET google_refresh_token = ? WHERE usuario_id = ?', [tokens.refresh_token, userId]);
        }
        console.log("Access token atualizado, atualizando DB para userId:", userId);
        await db.query('UPDATE configuracoes SET google_access_token = ?, google_token_expiry = ? WHERE usuario_id = ?',
            [tokens.access_token, tokens.expiry_date, userId]);
    });

    if (config.google_token_expiry && config.google_token_expiry < (Date.now() + 60000)) { 
        console.log("Token perto de expirar para userId:", userId, "Tentando refresh...");
        try {
            await client.refreshAccessToken();
        } catch (refreshError) {
            console.error("Erro ao tentar refresh do token para userId:", userId, refreshError);
            await db.query('UPDATE configuracoes SET google_access_token = NULL, google_refresh_token = NULL, google_token_expiry = NULL, integracao_google_calendar = FALSE WHERE usuario_id = ?', [userId]);
            throw new Error('Falha ao atualizar token de acesso. Por favor, reconecte sua conta Google.');
        }
    }


    return client;
};

exports.createGoogleCalendarEvent = async (userId, eventData) => {
    try {
        const auth = await getAuthenticatedClient(userId);
        const calendar = google.calendar({ version: 'v3', auth });

        const startDateTime = `${eventData.data}T${eventData.horario}:00`;
        const endHour = parseInt(eventData.horario.split(':')[0], 10) + 1;
        const endDateTime = `${eventData.data}T${String(endHour).padStart(2, '0')}:${eventData.horario.split(':')[1]}:00`;

        // TODO: Pegar fuso horário do usuário ou definir um padrão (ex: 'America/Sao_Paulo')
        const timeZone = 'America/Sao_Paulo';

        const event = {
            summary: eventData.titulo,
            description: eventData.descricao || '',
            start: {
                dateTime: startDateTime,
                timeZone: timeZone,
            },
            end: {
                dateTime: endDateTime,
                timeZone: timeZone,
            },
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

exports.updateGoogleCalendarEvent = async (userId, eventId, eventData) => {
    if (!eventId) return null;

    try {
        const auth = await getAuthenticatedClient(userId);
        const calendar = google.calendar({ version: 'v3', auth });

        const startDateTime = `${eventData.data}T${eventData.horario}:00`;
        const endHour = parseInt(eventData.horario.split(':')[0], 10) + 1;
        const endDateTime = `${eventData.data}T${String(endHour).padStart(2, '0')}:${eventData.horario.split(':')[1]}:00`;
        const timeZone = 'America/Sao_Paulo';

        const event = {
            summary: eventData.titulo,
            description: eventData.descricao || '',
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
        console.error('Erro ao atualizar evento no Google Calendar:', error.response?.data?.error || error.message);
        if (error.response?.status === 404 || error.response?.status === 410) {
            console.log("Evento não encontrado no Google Calendar para atualização, possivelmente deletado. Removendo ID local.");
            return 'DELETED'; 
        }
        return null; 
    }
};

exports.deleteGoogleCalendarEvent = async (userId, eventId) => {
    if (!eventId) return; 

    try {
        const auth = await getAuthenticatedClient(userId);
        const calendar = google.calendar({ version: 'v3', auth });

        await calendar.events.delete({
            calendarId: 'primary',
            eventId: eventId,
        });
        console.log('Evento deletado no Google Calendar:', eventId);
    } catch (error) {
        console.error('Erro ao deletar evento no Google Calendar:', error.response?.data?.error || error.message);
        if (error.response?.status !== 404 && error.response?.status !== 410) {
        }
    }
};