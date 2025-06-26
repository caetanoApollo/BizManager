const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validationMiddleware');
const { invoiceSchema } = require('../validation/schemas');

const multer = require('multer');
const upload = multer(); 

router.post('/invoices', authMiddleware, upload.none(), validate(invoiceSchema, 'body'), invoiceController.createInvoice); // Use upload.none() se não há arquivos, ou .single() para um arquivo
router.get('/invoices/:usuario_id', authMiddleware, invoiceController.getInvoicesByUserId);
router.put('/invoices/:id', authMiddleware, upload.none(), validate(invoiceSchema, 'body'), invoiceController.updateInvoice);
router.delete('/invoices/:id', authMiddleware, invoiceController.deleteInvoice);

module.exports = router;