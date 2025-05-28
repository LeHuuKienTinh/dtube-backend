const express = require('express');
const router = express.Router();
const { chatWithGroq } = require('../controllers/groq.controller');

router.post('/chat', chatWithGroq);

module.exports = router;
