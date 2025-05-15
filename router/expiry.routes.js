const express = require('express');
const router = express.Router();
const checkExpiryController = require('../controllers/checkExpiry.controller');  // Import controller

// Route để gọi hàm kiểm tra hết hạn (nếu bạn vẫn cần)
router.get('/check-expiry', (req, res) => {
    // Gọi hàm checkExpiry thủ công (không cần thiết nếu bạn đã dùng setInterval)
    checkExpiryController.checkExpiry();
    res.send('Check expired users initiated');
});

module.exports = router;
