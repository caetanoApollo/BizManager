const express = require("express");
const router = express.Router();
const financialController = require("../controllers/financialController");
const authMiddleware = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validationMiddleware");
const { transactionSchema } = require("../validation/schemas");

/**
 * @swagger
 * tags:
 *   - name: Financeiro
 *     description: Gestão de transações financeiras
 */

/**
 * @swagger
 * /transactions/user/{usuario_id}:
 *   get:
 *     summary: Lista todas as transações de um usuário
 *     tags: [Financeiro]
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
 *         description: Lista de transações.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TransacaoFinanceira'
 */
router.get(
    "/transactions/user/:usuario_id",
    authMiddleware,
    financialController.getTransactionsByUserId
);

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Cria uma nova transação financeira
 *     tags: [Financeiro]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransacaoFinanceira'
 *     responses:
 *       201:
 *         description: Transação criada com sucesso.
 */
router.post(
    "/transactions",
    authMiddleware,
    validate(transactionSchema, "body"),
    financialController.createTransaction
);

/**
 * @swagger
 * /transactions/{id}:
 *   put:
 *     summary: Atualiza uma transação financeira
 *     tags: [Financeiro]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID da transação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransacaoFinanceira'
 *     responses:
 *       200:
 *         description: Transação atualizada com sucesso.
 *       404:
 *         description: Transação não encontrada.
 */
router.put(
    "/transactions/:id",
    authMiddleware,
    validate(transactionSchema, "body"),
    financialController.updateTransaction
);

/**
 * @swagger
 * /transactions/{id}:
 *   delete:
 *     summary: Deleta uma transação financeira
 *     tags: [Financeiro]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID da transação
 *     responses:
 *       200:
 *         description: Transação deletada com sucesso.
 *       404:
 *         description: Transação não encontrada.
 */
router.delete(
    "/transactions/:id",
    authMiddleware,
    financialController.deleteTransaction
);

/**
 * @swagger
 * /transactions/{id}:
 *   get:
 *     summary: Obtém uma transação pelo ID
 *     tags: [Financeiro]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID da transação
 *     responses:
 *       200:
 *         description: Dados da transação.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransacaoFinanceira'
 *       404:
 *         description: Transação não encontrada.
 */
router.get(
    "/transactions/:id",
    authMiddleware,
    financialController.getTransactionById
);

module.exports = router;
