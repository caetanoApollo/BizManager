const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const userController = require('../controllers/userController');

router.post('/cadastro', upload.single('foto_perfil'), userController.cadastrarUsuario);
router.post('/login', userController.loginUsuario);
router.put('/editar/:id', upload.single('foto_perfil'), userController.editarUsuario);
router.delete('/excluir/:id', userController.excluirUsuario);

module.exports = router;