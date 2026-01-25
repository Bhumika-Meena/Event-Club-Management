const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');

const prisma = new PrismaClient();

// Get all clubs
const getAllClubs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const clubs = await prisma.club.findMany({
      where: { isActive: true },
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: {
            events: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const total = await prisma.club.count({ where: { isActive: true } });

    res.json({
      clubs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get clubs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single club
const getClubById = async (req, res) => {
  try {
    const { id } = req.params;

    const club = await prisma.club.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        events: {
          where: { status: 'APPROVED' },
          select: {
            id: true,
            title: true,
            description: true,
            date: true,
            venue: true,
            maxSeats: true,
            price: true,
            _count: {
              select: {
                bookings: true
              }
            }
          },
          orderBy: {
            date: 'desc'
          }
        }
      }
    });

    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    res.json({ club });
  } catch (error) {
    console.error('Get club error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create club
const createClub = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      website,
      instagram,
      facebook,
      twitter
    } = req.body;

    // Check if user already has a club
    const existingClub = await prisma.club.findFirst({
      where: { ownerId: req.user.id }
    });

    if (existingClub) {
      return res.status(400).json({ message: 'You can only have one club' });
    }

    // Check if club name already exists
    const nameExists = await prisma.club.findUnique({
      where: { name }
    });

    if (nameExists) {
      return res.status(400).json({ message: 'Club name already exists' });
    }

    const club = await prisma.club.create({
      data: {
        name,
        description,
        website,
        instagram,
        facebook,
        twitter,
        ownerId: req.user.id
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Club created successfully',
      club
    });
  } catch (error) {
    console.error('Create club error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update club
const updateClub = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Check if user owns the club
    const existingClub = await prisma.club.findFirst({
      where: {
        id,
        ownerId: req.user.id
      }
    });

    if (!existingClub) {
      return res.status(403).json({ message: 'You can only update your own club' });
    }

    // Check if name is being changed and if it already exists
    if (updateData.name && updateData.name !== existingClub.name) {
      const nameExists = await prisma.club.findUnique({
        where: { name: updateData.name }
      });

      if (nameExists) {
        return res.status(400).json({ message: 'Club name already exists' });
      }
    }

    const club = await prisma.club.update({
      where: { id },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.json({
      message: 'Club updated successfully',
      club
    });
  } catch (error) {
    console.error('Update club error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's club
const getMyClub = async (req, res) => {
  try {
    const club = await prisma.club.findFirst({
      where: { ownerId: req.user.id },
      include: {
        events: {
          include: {
            _count: {
              select: {
                bookings: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            events: true
          }
        }
      }
    });

    if (!club) {
      return res.status(404).json({ message: 'You don\'t have a club yet' });
    }

    res.json({ club });
  } catch (error) {
    console.error('Get my club error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get club analytics
const getClubAnalytics = async (req, res) => {
  try {
    const club = await prisma.club.findFirst({
      where: { ownerId: req.user.id },
      include: {
        events: {
          include: {
            bookings: true
          }
        }
      }
    });

    if (!club) {
      return res.status(404).json({ message: 'You don\'t have a club yet' });
    }

    const analytics = {
      totalEvents: club.events.length,
      totalBookings: club.events.reduce((sum, event) => sum + event.bookings.length, 0),
      upcomingEvents: club.events.filter(event => new Date(event.date) > new Date()).length,
      pastEvents: club.events.filter(event => new Date(event.date) <= new Date()).length,
      totalRevenue: club.events.reduce((sum, event) => {
        return sum + (event.bookings.length * (event.price || 0));
      }, 0),
      averageAttendance: club.events.length > 0 
        ? club.events.reduce((sum, event) => sum + event.bookings.length, 0) / club.events.length 
        : 0
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Get club analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Validation rules
const clubValidation = [
  body('name').trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('website').optional().isURL(),
  body('instagram').optional().trim(),
  body('facebook').optional().trim(),
  body('twitter').optional().trim()
];

module.exports = {
  getAllClubs,
  getClubById,
  createClub,
  updateClub,
  getMyClub,
  getClubAnalytics,
  clubValidation
};
