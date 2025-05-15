// routes/report.routes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');

// Tạo báo cáo mới
router.post('/create', reportController.createReport);

// Xóa báo cáo theo ID
router.delete('/delete/:report_id', reportController.deleteReport);

// Cập nhật báo cáo theo ID
router.put('/update/:report_id', reportController.updateReport);

// Lấy báo cáo theo loại (1: movie, 2: episode, 3: comment)
router.get('/type/:type_comment', reportController.getReportsByType);

// Lấy tất cả báo cáo (với thông tin người báo cáo và bình luận)
router.get('/', reportController.getAllReports);
router.put('/:report_id/status', reportController.updateReportStatus);

module.exports = router;
