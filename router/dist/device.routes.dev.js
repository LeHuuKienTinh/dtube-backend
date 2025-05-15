"use strict";

var express = require("express");

var router = express.Router();

var deviceController = require("../controllers/Admin/Deviece_manager.admin.controller");

router.get("/:id", deviceController.getDeviceById);
router.post("/", deviceController.createDevice);
router["delete"]("/:id", deviceController.deleteDevice);
module.exports = router;