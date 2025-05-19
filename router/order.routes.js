const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const paymentController = require('../controllers/payment.controller');

router.get('/orders/all', orderController.getAllOrders);
router.get('/payment/get/:id', paymentController.getPaymentByOrderId);
router.post('/orders', orderController.createOrder);
router.post('/webhook/sepay', paymentController.handleSePayWebhook);
router.post('/buy-package', paymentController.buyPackage);
// Kiểm tra trạng thái đơn hàng theo note
router.get('/:note/status', orderController.checkOrderStatus);
module.exports = router;
