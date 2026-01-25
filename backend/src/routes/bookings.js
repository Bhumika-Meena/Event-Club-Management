const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const {
  getUserBookings,
  cancelBooking,
  verifyQRCode
} = require('../controllers/bookingController');

const router = express.Router();

// Protected routes
router.get('/my-bookings', authMiddleware, getUserBookings);
router.patch('/:id/cancel', authMiddleware, cancelBooking);

// QR code verification (can be used by event organizers)
router.post('/verify-qr', authMiddleware, roleMiddleware('CLUB', 'ADMIN'), verifyQRCode);

module.exports = router;
