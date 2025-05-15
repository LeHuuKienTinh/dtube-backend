const express = require('express');
const router = express.Router();
const viewController = require('../controllers/view.controller');

// Route 4: Lấy tất cả lượt xem phim
router.get('/', viewController.getAllViewFilms);

// Route 2: Lấy lượt xem theo movie_slug và episode_slug
router.get('/:movie_slug/:episode_slug', viewController.getViewCountByMovieAndEpisode);

// Route 3: Lấy tổng lượt xem theo movie_slug
router.get('/:movie_slug', viewController.getTotalViewCountByMovie);

// Route 1: Tăng lượt xem
router.post('/increase', viewController.increaseViewCount);


module.exports = router;
