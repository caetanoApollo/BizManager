require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const swaggerUi = require('swagger-ui-express'); 
const swaggerSpec = require('./config/swaggerConfig');

const app = express();
app.use(cors());
app.use(express.json());

(async () => {
    try {
        await db.query('SELECT 1');
        console.log('Banco de dados conectado com sucesso!');
    } catch (err) {
        console.error('Erro ao conectar no banco de dados:', err.message);
        process.exit(1);
    }
})();

const userRoutes = require('./routers/userRouter');
app.use('/api', userRoutes);

const clientRoutes = require('./routers/clientRouter');
app.use('/api', clientRoutes);

const productRoutes = require('./routers/productRouter');
app.use('/api', productRoutes);

const financialRoutes = require('./routers/financialRouter');
app.use('/api', financialRoutes);

const invoiceRoutes = require('./routers/invoiceRouter');
app.use('/api', invoiceRoutes);

const scheduledServiceRoutes = require('./routers/scheduledServiceRouter');
app.use('/api', scheduledServiceRoutes);

const configRouter = require('./routers/configRouter');
app.use('/api', configRouter);

const uploadRouter = require('./routers/uploadRouter');
app.use('/api/upload', uploadRouter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); 

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});