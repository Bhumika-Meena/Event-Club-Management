const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const { generateQRTicket } = require('../services/qrTicketService');

const prisma = new PrismaClient();

// Get all events
const getAllEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, clubId } = req.query;
    const skip = (page - 1) * limit;

    // Role-based visibility:
    // - Unauthenticated / STUDENT: only APPROVED
    // - ADMIN: all
    // - CLUB: APPROVED + own club's events (any status)
    const role = req.user?.role || 'STUDENT';

    let visibilityWhere = { status: 'APPROVED' };
    if (role === 'ADMIN') {
      visibilityWhere = {};
    } else if (role === 'CLUB') {
      visibilityWhere = {
        OR: [{ status: 'APPROVED' }, { club: { ownerId: req.user.id } }]
      };
    }

    const filters = {};
    if (clubId) filters.clubId = clubId;
    if (status) {
      // Students/unauthed can't force non-approved visibility
      if (role === 'ADMIN' || role === 'CLUB' || status === 'APPROVED') {
        filters.status = status;
      } else {
        filters.status = 'APPROVED';
      }
    }

    const where = Object.keys(filters).length
      ? { AND: [visibilityWhere, filters] }
      : visibilityWhere;

    const events = await prisma.event.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true
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
        date: 'asc'
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
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single event
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        club: {
          select: {
            id: true,
            name: true,
            logo: true,
            description: true,
            ownerId: true
          }
        },
        // bookings are conditionally added below for privacy
      }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const role = req.user?.role || 'STUDENT';
    const isOwnerClub = role === 'CLUB' && event.club?.ownerId === req.user?.id;

    // Visibility guard for non-approved events
    if (event.status !== 'APPROVED' && role !== 'ADMIN' && !isOwnerClub) {
      return res.status(403).json({ message: 'You do not have permission to view this event' });
    }

    // Add bookings only for Admin / owning Club
    if (role === 'ADMIN' || isOwnerClub) {
      const bookings = await prisma.booking.findMany({
        where: { eventId: event.id },
        select: {
          id: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return res.json({ event: { ...event, bookings } });
    }

    return res.json({ event });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create event
const createEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      venue,
      date,
      maxSeats,
      price = 0,
      clubId
    } = req.body;

    // Check if user owns the club
    const club = await prisma.club.findFirst({
      where: {
        id: clubId,
        ownerId: req.user.id
      }
    });

    if (!club) {
      return res.status(403).json({ message: 'You can only create events for your own club' });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        venue,
        date: new Date(date),
        maxSeats: parseInt(maxSeats),
        price: parseFloat(price),
        creatorId: req.user.id,
        clubId
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Check if user owns the event
    const existingEvent = await prisma.event.findFirst({
      where: {
        id,
        creatorId: req.user.id
      }
    });

    if (!existingEvent) {
      return res.status(403).json({ message: 'You can only update your own events' });
    }

    // Convert date if provided
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        club: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        }
      }
    });

    res.json({
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user owns the event
    const existingEvent = await prisma.event.findFirst({
      where: {
        id,
        creatorId: req.user.id
      }
    });

    if (!existingEvent) {
      return res.status(403).json({ message: 'You can only delete your own events' });
    }

    await prisma.event.delete({
      where: { id }
    });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Book event
const bookEvent = async (req, res) => {
  try {
    const {
      eventId,
      userType,
      rollNo,
      department,
      semester,
      facultyId,
      employeeCategory,
      attendingWith,
      numberOfPeople = 1,
      guests = []
    } = req.body;

    // Check if event exists and is approved
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: {
            bookings: true
          }
        },
        club: {
          select: {
            name: true
          }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status !== 'APPROVED') {
      return res.status(400).json({ message: 'Event is not available for booking' });
    }

    // Check if already booked
    const existingBooking = await prisma.booking.findUnique({
      where: {
        userId_eventId: {
          userId: req.user.id,
          eventId
        }
      }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'You have already booked this event' });
    }

    // Check if seats are available (consider number of people)
    const totalPeople = parseInt(numberOfPeople) || 1;
    if (event._count.bookings + totalPeople > event.maxSeats) {
      return res.status(400).json({ message: 'Not enough seats available' });
    }

    // Generate a temporary unique QR code to satisfy the unique constraint
    // This will be replaced with the JWT token immediately after
    const tempQrCode = `temp-${req.user.id}-${eventId}-${Date.now()}`;
    
    // Prepare booking data (without qrCode first, as we need booking ID)
    const bookingDataToCreate = {
      userId: req.user.id,
      eventId,
      qrCode: tempQrCode, // Temporary unique value, will be updated after booking is created
      userType,
      attendingWith,
      numberOfPeople: totalPeople
    };

    // Add student-specific fields
    if (userType === 'STUDENT') {
      if (rollNo) bookingDataToCreate.rollNo = rollNo;
      if (department) bookingDataToCreate.department = department;
      if (semester) bookingDataToCreate.semester = semester;
    }

    // Add faculty-specific fields
    if (userType === 'FACULTY') {
      if (facultyId) bookingDataToCreate.facultyId = facultyId;
      if (employeeCategory) bookingDataToCreate.employeeCategory = employeeCategory;
    }

    // Create booking first to get booking ID
    const booking = await prisma.booking.create({
      data: bookingDataToCreate,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            venue: true
          }
        }
      }
    });

    // Store guest details (if provided)
    // Guests are only expected when attending with family; count should be numberOfPeople - 1
    if (Array.isArray(guests) && guests.length > 0) {
      await prisma.bookingGuest.createMany({
        data: guests.map((g) => ({
          bookingId: booking.id,
          name: String(g?.name || '').trim(),
          age: parseInt(g?.age, 10)
        }))
      });
    }

    // Generate JWT-based QR ticket
    const { token: qrToken, qrCodeImage } = await generateQRTicket({
      bookingId: booking.id,
      userId: req.user.id,
      eventId: event.id,
      userEmail: req.user.email,
      userName: `${req.user.firstName} ${req.user.lastName}`
    });

    // Update booking with JWT token as qrCode
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: { qrCode: qrToken },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            venue: true
          }
        }
      }
    });

    // Send booking confirmation email with QR code
    const { sendBookingConfirmationEmail } = require('../services/notificationService');
    try {
      await sendBookingConfirmationEmail(
        req.user.email,
        req.user.firstName,
        {
          title: event.title,
          date: event.date,
          venue: event.venue,
          clubName: event.club.name
        },
        qrCodeImage
      );
    } catch (emailError) {
      console.error('Error sending booking confirmation email:', emailError);
      // Don't fail the booking if email fails
    }

    res.status(201).json({
      message: 'Event booked successfully',
      booking: updatedBooking,
      qrCodeImage: qrCodeImage
    });
  } catch (error) {
    console.error('Book event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Validation rules
const eventValidation = [
  body('title').trim().isLength({ min: 1 }),
  body('description').trim().isLength({ min: 1 }),
  body('venue').trim().isLength({ min: 1 }),
  body('date').isISO8601(),
  body('maxSeats').isInt({ min: 1 }),
  body('price').optional().isFloat({ min: 0 }),
  body('clubId').trim().isLength({ min: 1 })
];

const bookingValidation = [
  body('eventId').trim().isLength({ min: 1 }).withMessage('Event ID is required'),
  body('userType').isIn(['STUDENT', 'FACULTY']).withMessage('User type must be STUDENT or FACULTY'),
  body('attendingWith').isIn(['ALONE', 'WITH_FAMILY']).withMessage('Attending type must be ALONE or WITH_FAMILY'),
  body('numberOfPeople').optional().isInt({ min: 1 }).withMessage('Number of people must be at least 1'),
  body('rollNo').optional().trim(),
  body('department').optional().trim(),
  body('semester').optional().trim(),
  body('facultyId').optional().trim(),
  // body('employeeCategory').optional().isIn(['TEACHING', 'NON_TEACHING']).withMessage('Employee category must be TEACHING or NON_TEACHING'),
  // body('guests').optional().isArray().withMessage('Guests must be an array'),
  // body('guests.*.name').optional().trim().isLength({ min: 1 }).withMessage('Guest name is required'),
  // body('guests.*.age').optional().isInt({ min: 0, max: 120 }).withMessage('Guest age must be valid')
];

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  bookEvent,
  eventValidation,
  bookingValidation
};
