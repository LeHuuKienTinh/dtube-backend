const express = require('express');
const badWordController = require('../controllers/Admin/Ban_Comment.admin.controller');

const router = express.Router();

// Route to add a bad word
router.post('/', badWordController.addBadWord);

// Route to get all bad words
router.get('/', badWordController.getBadWords);

// Route to update a bad word by ID
router.put('/:id', badWordController.updateBadWord);
router.get('/search', badWordController.searchBadWords); 
// Route to delete a bad word by ID
router.delete('/:id', badWordController.deleteBadWord);

module.exports = router;