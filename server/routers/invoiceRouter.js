const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");
const authMiddleware = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validationMiddleware");
const { invoiceSchema } = require("../validation/schemas");
const multer = require("multer");
const upload = multer();

/**
 * @swagger
 * tags:
 *   - name: Notas Fiscais
 *     description: Gestão de Notas Fiscais
 */

/**
 * @swagger
 * /invoices:
 *   post:
 *     summary: Cria uma nova nota fiscal
 *     tags: [Notas Fiscais]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotaFiscal'
 *     responses:
 *       201:
 *         description: Nota fiscal criada com sucesso.
 */
router.post(
    "/invoices",
    authMiddleware,
    upload.none(),
    validate(invoiceSchema, "body"),
    invoiceController.createInvoice
);

/**
 * @swagger
 * /invoices/{usuario_id}:
 *   get:
 *     summary: Lista todas as notas fiscais de um usuário
 *     tags: [Notas Fiscais]
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
 *         description: Lista de notas fiscais.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/NotaFiscal'
 */
router.get(
    "/invoices/:usuario_id",
    authMiddleware,
    invoiceController.getInvoicesByUserId
);

/**
 * @swagger
 * /invoices/{id}:
 *   put:
 *     summary: Atualiza uma nota fiscal
 *     tags: [Notas Fiscais]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID da nota fiscal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotaFiscal'
 *     responses:
 *       200:
 *         description: Nota fiscal atualizada com sucesso.
 *       404:
 *         description: Nota fiscal não encontrada.
 */
router.put(
    "/invoices/:id",
    authMiddleware,
    upload.none(),
    validate(invoiceSchema, "body"),
    invoiceController.updateInvoice
);

/**
 * @swagger
 * /invoices/{id}:
 *   delete:
 *     summary: Deleta uma nota fiscal
 *     tags: [Notas Fiscais]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID da nota fiscal
 *     responses:
 *       200:
 *         description: Nota fiscal deletada com sucesso.
 *       404:
 *         description: Nota fiscal não encontrada.
 */
router.delete("/invoices/:id", authMiddleware, invoiceController.deleteInvoice);

module.exports = router;
