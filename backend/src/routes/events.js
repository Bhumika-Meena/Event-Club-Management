const express = require('express');
const { authMiddleware, optionalAuthMiddleware, roleMiddleware } = require('../middleware/auth');
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  bookEvent,
  eventValidation,
  bookingValidation
} = require('../controllers/eventController');

const router = express.Router();

// Public routes
router.get('/', optionalAuthMiddleware, getAllEvents);
router.get('/:id', optionalAuthMiddleware, getEventById);

// Protected routes
router.post('/book', authMiddleware, bookingValidation, bookEvent);

// Club/Admin routes
router.post('/', authMiddleware, roleMiddleware('CLUB', 'ADMIN'), eventValidation, createEvent);
router.put('/:id', authMiddleware, roleMiddleware('CLUB', 'ADMIN'), eventValidation, updateEvent);
router.delete('/:id', authMiddleware, roleMiddleware('CLUB', 'ADMIN'), deleteEvent);

module.exports = router;
