const express = require('express');
const packageController = require('../controllers/pakage.controller');

const router = express.Router();

// Define routes
router.get('/', packageController.getAllPakages);
router.get('/:id', packageController.getPakageById);
router.post('/create', packageController.createPakage);
router.put('/update/put/:id', packageController.updatePakage);
router.delete('/delete/:id', packageController.deletePakage);

module.exports = router;