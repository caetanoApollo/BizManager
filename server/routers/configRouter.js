const express = require("express");
const router = express.Router();
const configController = require("../controllers/configController");
const authMiddleware = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validationMiddleware");
const { configSchema } = require("../validation/schemas");

/**
 * @swagger
 * tags:
 *   - name: Configurações
 *     description: Gerenciamento de configurações do usuário
 */

/**
 * @swagger
 * /configs/{id}:
 *   get:
 *     summary: Obtém as configurações de um usuário
 *     tags: [Configurações]
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
 *         description: Configurações do usuário.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Configuracoes'
 *       404:
 *         description: Usuário não encontrado.
 */
router.get("/configs/:id", authMiddleware, configController.getConfigsByUserId);

/**
 * @swagger
 * /configs/{id}:
 *   put:
 *     summary: Atualiza as configurações de um usuário
 *     tags: [Configurações]
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
 *             $ref: '#/components/schemas/Configuracoes'
 *     responses:
 *       200:
 *         description: Configurações atualizadas com sucesso.
 *       400:
 *         description: Dados inválidos.
 */
router.put(
    "/configs/:id",
    authMiddleware,
    validate(configSchema, "body"),
    configController.updateConfigs
);

module.exports = router;
