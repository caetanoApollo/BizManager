const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const emailController = require("../controllers/emailController");
const authMiddleware = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   - name: Usuários
 *     description: API para gerenciamento de usuários e autenticação
 */

/**
 * @swagger
 * /cadastro:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso.
 *       400:
 *         description: Dados inválidos.
 */
router.post("/cadastro", userController.registerUser);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Autentica um usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login bem-sucedido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Credenciais inválidas.
 */
router.post("/login", userController.loginUser);

/**
 * @swagger
 * /forgot-password:
 *   post:
 *     summary: Envia um email de recuperação de senha
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email de recuperação enviado.
 *       404:
 *         description: Email não encontrado.
 */
router.post("/forgot-password", emailController.sendPasswordResetEmail);

/**
 * @swagger
 * /reset-password:
 *   post:
 *     summary: Reseta a senha do usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Senha resetada com sucesso.
 *       400:
 *         description: Token inválido ou expirado.
 */
router.post("/reset-password", userController.resetPassword);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtém o perfil de um usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Perfil do usuário.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       404:
 *         description: Usuário não encontrado.
 */
router.get("/users/:id", authMiddleware, userController.getUserProfile);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Atualiza o perfil de um usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso.
 *       404:
 *         description: Usuário não encontrado.
 */
router.put("/users/:id", authMiddleware, userController.updateUserProfile);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Deleta um usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário deletado com sucesso.
 *       404:
 *         description: Usuário não encontrado.
 */
router.delete("/users/:id", authMiddleware, userController.deleteUser);

module.exports = router;
