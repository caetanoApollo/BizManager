const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const { uploadProfilePicture } = require('../controllers/uploadController');

router.post('/cadastro', uploadProfilePicture, userController.cadastrarUsuario);

router.post('/login', userController.loginUsuario);

router.get('/users/:id', userController.getUserProfile);

router.put('/:id', authMiddleware, uploadProfilePicture, userController.updateUserProfile);

router.delete('/:id', authMiddleware, userController.excluirUsuario);

module.exports = router;