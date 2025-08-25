const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const emailController = require('../controllers/emailController');
const authMiddleware = require('../middlewares/authMiddleware');
const { uploadProfilePicture } = require('../controllers/uploadController');

// --- Rotas de Autenticação e Cadastro ---
router.post('/cadastro', uploadProfilePicture, userController.cadastrarUsuario);
router.post('/login', userController.loginUsuario);

// --- Rotas de Recuperação de Senha ---
router.post('/forgot-password', emailController.sendPasswordResetEmail);
router.post('/reset-password', userController.resetPassword);

// --- Rotas de Gerenciamento de Usuário ---
router.get('/users/:id', authMiddleware, userController.getUserProfile);
router.put('/users/:id', authMiddleware, uploadProfilePicture, userController.updateUserProfile);
router.delete('/users/:id', authMiddleware, userController.excluirUsuario);

module.exports = router;