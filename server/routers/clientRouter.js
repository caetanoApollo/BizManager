const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");
const authMiddleware = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validationMiddleware");
const { clientSchema } = require("../validation/schemas");

/**
 * @swagger
 * tags:
 *   - name: Clientes
 *     description: Gestão de Clientes
 */

/**
 * @swagger
 * /clients:
 *   post:
 *     summary: Cria um novo cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cliente'
 *     responses:
 *       201:
 *         description: Cliente criado com sucesso.
 *       400:
 *         description: Dados inválidos.
 */
router.post(
    "/clients",
    authMiddleware,
    validate(clientSchema, "body"),
    clientController.createClient
);

/**
 * @swagger
 * /clients/{id}:
 *   get:
 *     summary: Obtém um cliente pelo ID
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Dados do cliente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       404:
 *         description: Cliente não encontrado.
 */
router.get("/clients/:id", authMiddleware, clientController.getClientById);

/**
 * @swagger
 * /clients/user/{usuario_id}:
 *   get:
 *     summary: Lista todos os clientes de um usuário
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: usuario_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Lista de clientes.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cliente'
 */
router.get(
    "/clients/user/:usuario_id",
    authMiddleware,
    clientController.getClientsByUserId
);

/**
 * @swagger
 * /clients/{id}:
 *   put:
 *     summary: Atualiza um cliente existente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cliente'
 *     responses:
 *       200:
 *         description: Cliente atualizado com sucesso.
 *       404:
 *         description: Cliente não encontrado.
 */
router.put(
    "/clients/:id",
    authMiddleware,
    validate(clientSchema, "body"),
    clientController.updateClient
);

/**
 * @swagger
 * /clients/{id}:
 *   delete:
 *     summary: Deleta um cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Cliente deletado com sucesso.
 *       404:
 *         description: Cliente não encontrado.
 */
router.delete("/clients/:id", authMiddleware, clientController.deleteClient);

module.exports = router;
