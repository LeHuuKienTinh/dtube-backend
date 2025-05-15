const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const { verifyToken, isNotBanned } = require('../middleware/auth');

// Tạo bình luận (người dùng đã đăng nhập và không bị ban)
router.post('/', commentController.createComment);

// Lấy tất cả bình luận
router.get('/', commentController.getComments);

// Lấy bình luận theo movie_slug và episode_slug
router.get('/:movie_slug/:episode_slug', commentController.getCommentsByMovieAndEpisode);

// Cập nhật bình luận (chỉ chủ comment hoặc admin)
router.put('/:id', verifyToken, isNotBanned, commentController.updateComment);

// Xoá bình luận (chỉ chủ comment hoặc admin)
router.delete('/:id', verifyToken, isNotBanned, commentController.deleteComment);

module.exports = router;
