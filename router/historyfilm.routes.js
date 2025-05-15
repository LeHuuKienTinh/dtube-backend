const express = require('express');
const router = express.Router();
const controller = require('../controllers/historyfilm.controller');

// Lấy lịch sử theo user_id
router.get('/history/:user_id', controller.getHistoryByUserId);

// Thêm lịch sử
router.post('/history', controller.addHistory);

// Lấy tất cả lịch sử
router.get('/historyall/', controller.getAllHistoryFilm);

// Xóa lịch sử theo id
router.delete('/history/delete/:id', controller.deleteHistory);

// Cập nhật thời gian xem
router.put('/history/update-time/:id', controller.updateWatchedTime);

// Lấy tập phim cuối cùng đã xem
router.get('/last/:user_id/:movie_slug', controller.getLastWatchedEpisode);

module.exports = router;
