const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validationMiddleware');
const { clientSchema } = require('../validation/schemas');

router.post('/clients', authMiddleware, validate(clientSchema, 'body'), clientController.createClient);
router.get('/clients/:id', authMiddleware, clientController.getClientById);
router.get('/clients/user/:usuario_id', authMiddleware, clientController.getClientsByUserId); 
router.put('/clients/:id', authMiddleware, validate(clientSchema, 'body'), clientController.updateClient);
router.delete('/clients/:id', authMiddleware, clientController.deleteClient);

module.exports = router;