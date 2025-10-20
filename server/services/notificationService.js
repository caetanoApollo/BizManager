const db = require('../config/db');
const { Expo } = require('expo-server-sdk');

const expo = new Expo();

const sendPushNotification = async (token, title, body) => {
    if (!Expo.isExpoPushToken(token)) {
        console.error(`Token inválido: ${token}`);
        return;
    }

    const message = [{
        to: token,
        sound: 'default',
        title: title,
        body: body,
        data: { alertType: 'low_stock' }, 
    }];

    try {
        await expo.sendPushNotificationsAsync(message);
        console.log(`Notificação enviada para o token: ${token}`);
    } catch (error) {
        console.error('Erro ao enviar notificação push:', error);
    }
};

const checkLowStockAndSendNotifications = async () => {
    console.log('Iniciando rotina de checagem de estoque...');
    try {
        const [lowStockProducts] = await db.query(`
            SELECT 
                p.nome AS produto_nome,
                u.id AS usuario_id,
                c.push_token
            FROM 
                produtos p
            JOIN 
                usuarios u ON p.usuario_id = u.id
            JOIN 
                configuracoes c ON u.id = c.usuario_id
            WHERE 
                p.quantidade <= p.estoque_minimo
                AND c.notificacoes_estoque = TRUE
                AND c.push_token IS NOT NULL
        `);

        if (lowStockProducts.length === 0) {
            console.log('Nenhum item com estoque baixo para notificar.');
            return;
        }

        const userNotifications = lowStockProducts.reduce((acc, product) => {
            if (!acc[product.usuario_id]) {
                acc[product.usuario_id] = {
                    token: product.push_token,
                    products: []
                };
            }
            acc[product.usuario_id].products.push(product.produto_nome);
            return acc;
        }, {});

        for (const userId in userNotifications) {
            const { token, products } = userNotifications[userId];
            const body = `Os seguintes produtos estão com estoque baixo: ${products.join(', ')}.`;
            
            await sendPushNotification(token, '🚨 Alerta de Estoque Baixo!', body);
        }

        console.log(`Notificações de estoque enviadas para ${Object.keys(userNotifications).length} usuário(s).`);

    } catch (err) {
        console.error('Erro na rotina de verificação de estoque:', err);
    }
};

module.exports = {
    checkLowStockAndSendNotifications
};