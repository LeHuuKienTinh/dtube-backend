
const express = require("express");
const router = express.Router();
const chartController = require("../controllers/chart.controller");

router.get("/", chartController.getCharts);

module.exports = router;
