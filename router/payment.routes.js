const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

router.post('/create-payment-url', paymentController.createPaymentUrl);
router.get('/payment-success', paymentController.vnpayReturn);

module.exports = router;
