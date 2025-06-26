const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validationMiddleware');
const { configSchema } = require('../validation/schemas');

router.get('/configs/:usuario_id', authMiddleware, configController.getConfigsByUserId);
router.put('/configs/:usuario_id', authMiddleware, validate(configSchema, 'body'), configController.updateConfigs);

module.exports = router;