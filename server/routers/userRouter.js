const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const userController = require('../controllers/userController');

router.post('/cadastro', upload.single('foto_perfil'), userController.cadastrarUsuario);
router.post('/login', userController.loginUsuario);

module.exports = router;