const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const emailController = require('../controllers/emailController');
const authMiddleware = require('../middlewares/authMiddleware');

// --- Rotas de Autenticação e Cadastro ---
router.post('/cadastro', userController.registerUser);
router.post('/login', userController.loginUser);

// --- Rotas de Recuperação de Senha ---
router.post('/forgot-password', emailController.sendPasswordResetEmail);
router.post('/reset-password', userController.resetPassword);

// --- Rotas de Gerenciamento de Usuário ---
router.get('/users/:id', authMiddleware, userController.getUserProfile);
router.put('/users/:id', authMiddleware, userController.updateUserProfile);
router.delete('/users/:id', authMiddleware, userController.deleteUser);

module.exports = router;