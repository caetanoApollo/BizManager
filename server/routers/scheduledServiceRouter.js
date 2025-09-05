const express = require('express');
const router = express.Router();
const scheduledServiceController = require('../controllers/scheduledServiceController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rota para criar um novo serviço (evento)
router.post('/scheduled-services', authMiddleware, scheduledServiceController.createScheduledService);

// Rota para buscar todos os serviços (eventos) do usuário logado
// A rota foi simplificada para /scheduled-services, pois o ID do usuário vem do token
router.get('/scheduled-services', authMiddleware, scheduledServiceController.getScheduledServicesByUserId);

// Rota para atualizar um serviço (evento) específico
router.put('/scheduled-services/:id', authMiddleware, scheduledServiceController.updateScheduledService);

// Rota para deletar um serviço (evento) específico
router.delete('/scheduled-services/:id', authMiddleware, scheduledServiceController.deleteScheduledService);

router.get('/:id', authMiddleware, scheduledServiceController.getScheduledServiceById);

module.exports = router;
