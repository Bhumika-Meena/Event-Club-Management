const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const {
  sendRegistrationOTP,
  verifyRegistrationOTP,
  register,
  login,
  logout,
  getCurrentUser,
  emailValidation,
  otpValidation,
  registerValidation,
  loginValidation
} = require('../controllers/authController');

const router = express.Router();

// Public routes
router.post('/send-otp', emailValidation, sendRegistrationOTP);
router.post('/verify-otp', otpValidation, verifyRegistrationOTP);
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes
router.post('/logout', logout);
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;
