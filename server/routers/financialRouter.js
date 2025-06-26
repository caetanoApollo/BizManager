const express = require('express');
const router = express.Router();
const financialController = require('../controllers/financialController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validationMiddleware');
const { transactionSchema } = require('../validation/schemas');

router.post('/financial', authMiddleware, validate(transactionSchema, 'body'), financialController.createTransaction);
router.get('/financial/:usuario_id', authMiddleware, financialController.getTransactionsByUserId);
router.put('/financial/:id', authMiddleware, validate(transactionSchema, 'body'), financialController.updateTransaction);
router.delete('/financial/:id', authMiddleware, financialController.deleteTransaction);

module.exports = router;