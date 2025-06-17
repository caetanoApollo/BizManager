require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const app = express();
app.use(cors());

(async () => {
    try {
        await db.query('SELECT 1');
        console.log('Banco de dados conectado com sucesso!');
    } catch (err) {
        console.error('Erro ao conectar no banco de dados:', err.message);
        process.exit(1);
    }
})();

// Rotas de usuário
const userRoutes = require('./routers/userRouter');
app.use('/api', userRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});