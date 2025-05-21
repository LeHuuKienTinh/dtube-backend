// routes/notification.routes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notifications.controller');

// Lấy thông báo cho user theo userId
router.get('/get-all-noti/admin', notificationController.getAllNotifications);
router.post('/create/send', notificationController.sendSystemNotification);
router.get('/:userId', notificationController.getNotificationsByUser);
module.exports = router;
