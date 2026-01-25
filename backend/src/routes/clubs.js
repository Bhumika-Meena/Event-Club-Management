const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const {
  getAllClubs,
  getClubById,
  createClub,
  updateClub,
  getMyClub,
  getClubAnalytics,
  clubValidation
} = require('../controllers/clubController');

const router = express.Router();

// Public routes
router.get('/', getAllClubs);
router.get('/:id', getClubById);

// Protected routes
router.post('/', authMiddleware, roleMiddleware('CLUB'), clubValidation, createClub);
router.put('/:id', authMiddleware, roleMiddleware('CLUB'), clubValidation, updateClub);
router.get('/my/club', authMiddleware, roleMiddleware('CLUB'), getMyClub);
router.get('/my/analytics', authMiddleware, roleMiddleware('CLUB'), getClubAnalytics);

module.exports = router;
