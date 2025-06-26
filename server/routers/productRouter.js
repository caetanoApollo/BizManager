const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validationMiddleware');
const { productSchema } = require('../validation/schemas');

router.post('/products', authMiddleware, validate(productSchema, 'body'), productController.createProduct);
router.get('/products/:usuario_id', authMiddleware, productController.getProductsByUserId);
router.put('/products/:id', authMiddleware, validate(productSchema, 'body'), productController.updateProduct);
router.delete('/products/:id', authMiddleware, productController.deleteProduct);

module.exports = router;