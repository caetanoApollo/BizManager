const express = require('express');
const router = express.Router();
const scheduledServiceController = require('../controllers/scheduledServiceController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validationMiddleware');
const { scheduledServiceSchema } = require('../validation/schemas');

router.post('/scheduled-services', authMiddleware, validate(scheduledServiceSchema, 'body'), scheduledServiceController.createScheduledService);
router.get('/scheduled-services/:usuario_id', authMiddleware, scheduledServiceController.getScheduledServicesByUserId);
router.put('/scheduled-services/:id', authMiddleware, validate(scheduledServiceSchema, 'body'), scheduledServiceController.updateScheduledService);
router.delete('/scheduled-services/:id', authMiddleware, scheduledServiceController.deleteScheduledService);

module.exports = router;