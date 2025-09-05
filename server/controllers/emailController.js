const nodemailer = require('nodemailer');
const crypto = require('crypto');
const db = require('../config/db');

// Configuração do Nodemailer com ajuste de TLS
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587", 10),
    secure: process.env.EMAIL_PORT === '465',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        ciphers:'SSLv3'
    }
});

exports.sendPasswordResetEmail = async (req, res) => {
    const { email } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'Nenhum usuário encontrado com este e-mail.' });
        }
        const user = users[0];

        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const passwordResetToken = crypto.createHash('sha256').update(resetCode).digest('hex');
        const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // Expira em 10 minutos

        await db.query('UPDATE usuarios SET passwordResetToken = ?, passwordResetExpires = ? WHERE id = ?', [passwordResetToken, passwordResetExpires, user.id]);

        const mailOptions = {
            from: `"BizManager" <recoverybizmanager@gmail.com>`, 
            to: user.email,
            subject: 'Recuperação de Senha - BizManager',
            text: `Você solicitou a redefinição de sua senha.\n\nSeu código de verificação é: ${resetCode}\n\nEste código expira em 10 minutos.\n\nSe você não solicitou isso, por favor, ignore este e-mail.`,
        };

        const info = await transporter.sendMail(mailOptions);

        console.log("E-mail de recuperação enviado: %s", info.messageId);

        res.status(200).json({ message: 'E-mail de recuperação enviado com sucesso.' });
    } catch (err) {
        console.error('Erro ao enviar e-mail de recuperação:', err);
        await db.query('UPDATE usuarios SET passwordResetToken = NULL, passwordResetExpires = NULL WHERE email = ?', [email]);
        res.status(500).json({ error: 'Erro ao enviar e-mail de recuperação.' });
    }
};