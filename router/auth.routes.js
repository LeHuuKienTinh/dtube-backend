const express = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/sendtoken', authController.sendTokenLogin);
router.post('/checktoken', authController.checkToken);
router.get('/me/:id', authMiddleware.verifyToken, authController.getUserTypeById);
router.post('/forgotpassword', authController.forgotPassword);
router.post('/verifyotp', authController.verifyOTP);
router.post('/resetpassword', authController.resetPassword);
router.get('/verify-email', authController.verifyEmail);
router.post('/change-password', authController.changePassword);

// Role-based test routes
router.get('/test/admin', [
  authMiddleware.verifyToken,
  authMiddleware.isNotBanned,
  authMiddleware.canAccessAdmin
], (req, res) => {
  res.send('Admin Content');
});

router.get('/test/home', [
  authMiddleware.verifyToken,
  authMiddleware.isNotBanned,
  authMiddleware.canAccessHome
], (req, res) => {
  res.send('Home Page Content');
});

router.get('/test/pay', [
  authMiddleware.verifyToken,
  authMiddleware.isNotBanned,
  authMiddleware.canAccessPay
], (req, res) => {
  res.send('Pay Page Content');
});

router.get('/test/ban', [
  authMiddleware.verifyToken
], (req, res) => {
  if (req.userType === '4') {
    return res.send('Your account is banned');
  }
  res.send('You are not banned');
});

module.exports = router;
