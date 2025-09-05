const express = require('express');
const router = express.Router();
const financialController = require('../controllers/financialController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validationMiddleware');
const { transactionSchema } = require('../validation/schemas');

// Rota para buscar todas as transações de um usuário específico
router.get('/transactions/user/:usuario_id', authMiddleware, financialController.getTransactionsByUserId);

// Rotas para as outras funções financeiras
router.post('/transactions', authMiddleware, validate(transactionSchema, 'body'), financialController.createTransaction);
router.put('/transactions/:id', authMiddleware, validate(transactionSchema, 'body'), financialController.updateTransaction);
router.delete('/transactions/:id', authMiddleware, financialController.deleteTransaction);
router.get('/transactions/:id', authMiddleware, financialController.getTransactionById);

module.exports = router;