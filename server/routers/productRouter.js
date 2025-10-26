const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const authMiddleware = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validationMiddleware");
const { productSchema } = require("../validation/schemas");

/**
 * @swagger
 * tags:
 *   - name: Produtos
 *     description: Gestão de Produtos e Estoque
 */

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Cria um novo produto
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Produto'
 *     responses:
 *       201:
 *         description: Produto criado com sucesso.
 */
router.post(
    "/products",
    authMiddleware,
    validate(productSchema, "body"),
    productController.createProduct
);

/**
 * @swagger
 * /products/{usuario_id}:
 *   get:
 *     summary: Lista todos os produtos de um usuário
 *     tags: [Produtos]
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
 *         description: Lista de produtos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Produto'
 */
router.get(
    "/products/:usuario_id",
    authMiddleware,
    productController.getProductsByUserId
);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Atualiza um produto
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Produto'
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso.
 *       404:
 *         description: Produto não encontrado.
 */
router.put(
    "/products/:id",
    authMiddleware,
    validate(productSchema, "body"),
    productController.updateProduct
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Deleta um produto
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto deletado com sucesso.
 *       404:
 *         description: Produto não encontrado.
 */
router.delete("/products/:id", authMiddleware, productController.deleteProduct);

/**
 * @swagger
 * /stock/low-alerts:
 *   get:
 *     summary: Verifica produtos com estoque baixo ou zerado
 *     tags: [Produtos]
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
 *         description: Lista de produtos com estoque baixo ou zerado.
 *       404:
 *         description: Usuário não encontrado.
 */
router.get('/stock/low-alerts', authMiddleware, productController.getLowStockAlerts);

module.exports = router;
