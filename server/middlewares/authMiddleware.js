const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Token não fornecido.' });
    }

    const [, token] = authHeader.split(' '); 

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded; 
        next();
    } catch (err) {
        console.error('Erro na verificação do token:', err);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expirado.' });
        }
        return res.status(401).json({ error: 'Token inválido.' });
    }
};

module.exports = authMiddleware;