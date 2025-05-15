// routes/chatRoutes.js
const express = require("express");
const { chat } = require("../controllers/chatbot.controller");

const router = express.Router();

// Định nghĩa route cho endpoint /chat
router.post("/", chat);

module.exports = router;
