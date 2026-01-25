const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const {
  getAllUsers,
  getEventsForApproval,
  updateEventStatus,
  getDashboardStats,
  updateUserStatus,
  eventStatusValidation,
  userStatusValidation
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(roleMiddleware('ADMIN'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.patch('/users/:id/status', userStatusValidation, updateUserStatus);

// Event management
router.get('/events', getEventsForApproval);
router.patch('/events/:id/status', eventStatusValidation, updateEventStatus);

module.exports = router;
