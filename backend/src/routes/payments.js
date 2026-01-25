const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { createOrder } = require('../controllers/paymentController');

const router = express.Router();

// Create Razorpay order for event booking
router.post('/create-order', authMiddleware, createOrder);

module.exports = router;


