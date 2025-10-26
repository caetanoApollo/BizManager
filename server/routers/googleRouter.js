// server/routers/googleRouter.js (ou adicione em server.js)
const express = require('express');
const router = express.Router();
const googleController = require('../controllers/googleController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/google/exchange-code', googleController.exchangeCodeForTokens);

module.exports = router;

