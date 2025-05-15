const express = require('express');
const router = express.Router();
const likesController = require('../controllers/likefilm.controller');

// API Like cực đơn giản (không xác thực)
router.post('/', likesController.addLike);
router.get('/user/:user_id', likesController.getLikesByUserId);
router.get('/movie/:movie_slug', likesController.getLikesByMovieSlug);
router.get('/check/:user_id/:movie_slug', likesController.hasLikedMovie);
router.delete('/:id', likesController.deleteLike);
router.get('/all', likesController.getAllLikes);
router.get('/most-liked', likesController.getMostLikedMovies);
module.exports = router;