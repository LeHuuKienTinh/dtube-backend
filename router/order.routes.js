const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const paymentController = require('../controllers/payment.controller');

router.post('/orders', orderController.createOrder);
router.post('/webhook/sepay', paymentController.handleSePayWebhook);

module.exports = router;
