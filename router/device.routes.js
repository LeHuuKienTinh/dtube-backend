const express = require("express");
const router = express.Router();
const deviceController = require("../controllers/Admin/Deviece_manager.admin.controller");

router.get("/:id", deviceController.getDeviceById);
router.post("/", deviceController.createDevice);
router.delete("/:id", deviceController.deleteDevice);

module.exports = router;
