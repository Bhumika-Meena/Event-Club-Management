const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');

const prisma = new PrismaClient();

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (role) where.role = role;

    const users = await prisma.user.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const total = await prisma.user.count({ where });

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all events for approval
const getEventsForApproval = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const events = await prisma.event.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        club: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        },
        _count: {
          select: {
            bookings: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const total = await prisma.event.count({ where });

    res.json({
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get events for approval error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve/Reject event
const updateEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const event = await prisma.event.update({
      where: { id },
      data: { status },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        club: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json({
      message: `Event ${status.toLowerCase()} successfully`,
      event
    });
  } catch (error) {
    console.error('Update event status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get admin dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalClubs,
      totalEvents,
      pendingEvents,
      totalBookings,
      activeUsers,
      recentEvents,
      topClubs
    ] = await Promise.all([
      prisma.user.count(),
      prisma.club.count({ where: { isActive: true } }),
      prisma.event.count(),
      prisma.event.count({ where: { status: 'PENDING' } }),
      prisma.booking.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.event.findMany({
        take: 5,
        include: {
          club: {
            select: {
              name: true
            }
          },
          _count: {
            select: {
              bookings: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.club.findMany({
        take: 5,
        include: {
          _count: {
            select: {
              events: true
            }
          }
        },
        orderBy: {
          events: {
            _count: 'desc'
          }
        }
      })
    ]);

    const stats = {
      totalUsers,
      totalClubs,
      totalEvents,
      pendingEvents,
      totalBookings,
      activeUsers,
      recentEvents,
      topClubs
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user status
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    });

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Validation rules
const eventStatusValidation = [
  body('status').isIn(['APPROVED', 'REJECTED'])
];

const userStatusValidation = [
  body('isActive').isBoolean()
];

module.exports = {
  getAllUsers,
  getEventsForApproval,
  updateEventStatus,
  getDashboardStats,
  updateUserStatus,
  eventStatusValidation,
  userStatusValidation
};
