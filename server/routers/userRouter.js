const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/cadastro', upload.single('foto_perfil'), userController.cadastrarUsuario);
router.post('/login', userController.loginUsuario);

router.put('/editar/:id', authMiddleware, upload.single('foto_perfil'), userController.editarUsuario);
router.delete('/excluir/:id', authMiddleware, userController.excluirUsuario);

module.exports = router;