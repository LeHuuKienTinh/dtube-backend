const express = require('express');
const router = express.Router();
const bannedMoviesController = require('../controllers/Admin/Ban_Movie.admin.controller');

// Create a new banned movie
router.post('/', bannedMoviesController.createBannedMovie);

// Get all banned movies
router.get('/', bannedMoviesController.getAllBannedMovies);

// Delete a banned movie by ID
router.delete('/:id', bannedMoviesController.deleteBannedMovie);

module.exports = router;
