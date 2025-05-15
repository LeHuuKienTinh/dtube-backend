const express = require('express');
const router = express.Router();
const filmController = require('../controllers/movie.controller');

// 🔍 Tìm kiếm phim (keyword bắt buộc, các params khác là tùy chọn)
router.get('/search', filmController.searchMovies);
router.get('/allcategory', filmController.getAllCategories);
router.get('/category/list/:type/:page', filmController.getMoviesByType);
router.get('/allcountry', filmController.getAllCountry);
router.get('/country/:slug', filmController.getMoviesByCountry);
// 📽️ Lấy danh sách phim mới cập nhật
router.get('/latest/:page', filmController.getLatestMovies);

// 📂 Lấy danh sách phim theo thể loại: phim-le, phim-bo
router.get('/category/:type/:page', filmController.getMoviesByCategory);

// 🎞️ Lấy trailer phim theo slug
router.get('/:slug/trailer', filmController.getMovieTrailer);

// 🧾 Lấy chi tiết phim theo slug
router.get('/:slug', filmController.getMovieDetails);

module.exports = router;
