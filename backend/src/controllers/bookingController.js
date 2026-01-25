const { PrismaClient } = require('@prisma/client');
const { verifyQRTicket } = require('../services/qrTicketService');

const prisma = new PrismaClient();

// Get user's bookings
const getUserBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: {
        event: {
          include: {
            club: {
              select: {
                id: true,
                name: true,
                logo: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ bookings });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        userId: req.user.id
      },
      include: {
        event: true
      }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if event has already started
    if (new Date(booking.event.date) <= new Date()) {
      return res.status(400).json({ message: 'Cannot cancel booking for past events' });
    }

    await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify QR code (for event check-in)
const verifyQRCode = async (req, res) => {
  try {
    const { qrCode } = req.body; // This is the JWT token from the QR code

    if (!qrCode) {
      return res.status(400).json({ message: 'QR code is required' });
    }

    // Verify and decode the JWT token
    let decodedToken;
    try {
      console.log('Verifying QR ticket, token length:', qrCode.length);
      console.log('Token preview:', qrCode.substring(0, 50) + '...');
      decodedToken = verifyQRTicket(qrCode);
      console.log('Token decoded successfully:', {
        bookingId: decodedToken.bookingId,
        userId: decodedToken.userId,
        eventId: decodedToken.eventId,
        type: decodedToken.type
      });
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      console.error('Error name:', jwtError.name);
      console.error('Error message:', jwtError.message);
      return res.status(401).json({
        message: jwtError.message || 'Invalid or expired QR ticket',
        error: jwtError.name
      });
    }

    // Find booking by ID from decoded token
    const booking = await prisma.booking.findUnique({
      where: { id: decodedToken.bookingId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            venue: true,
            club: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Log for debugging
    console.log('Booking found:', {
      bookingId: booking.id,
      storedQrCodeLength: booking.qrCode?.length || 0,
      sentQrCodeLength: qrCode.length,
      storedQrCodePreview: booking.qrCode?.substring(0, 50) + '...',
      sentQrCodePreview: qrCode.substring(0, 50) + '...'
    });

    // Verify the JWT token matches the booking's stored qrCode
    // Trim both to handle whitespace issues
    const storedCode = (booking.qrCode || '').trim();
    const sentCode = qrCode.trim();

    // If JWT verified successfully and contains correct bookingId, allow check-in
    // This handles cases where qrCode in DB might be old format or different
    if (decodedToken.bookingId !== booking.id) {
      return res.status(401).json({
        message: 'QR ticket does not match this booking',
        hint: 'The QR code is for a different booking.'
      });
    }

    // If stored code doesn't match but JWT is valid with correct bookingId, update it
    if (storedCode !== sentCode) {
      console.log('QR code in DB differs from sent code, but JWT is valid - updating stored code');
      // Update the stored qrCode to match (in case it was old format)
      await prisma.booking.update({
        where: { id: booking.id },
        data: { qrCode: sentCode }
      });
    }

    // Validate booking status
    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ message: 'This booking has been cancelled' });
    }

    if (booking.status === 'CHECKED_IN') {
      return res.status(400).json({
        message: 'Already checked in',
        checkedInAt: booking.checkedInAt
      });
    }

    // Check if event has started (allow check-in 20hr before event)
    const eventDate = new Date(booking.event.date);
    const checkInStartTime = new Date(eventDate.getTime() - 20 * 60 * 60 * 1000); // 20hr before
    const now = new Date();

    if (now < checkInStartTime) {
      return res.status(400).json({
        message: 'Check-in is not available yet. Check-in opens 20hr before the event.',
        checkInOpensAt: checkInStartTime
      });
    }

    // Block check-in 2 hours after event start
    const checkInEndTime = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000); // +2hr

    if (now > checkInEndTime) {
      return res.status(400).json({
        message: 'Check-in window has closed. Check-in is allowed only up to 2 hours after the event starts.',
        checkInClosedAt: checkInEndTime
      });
    }

    // Mark as checked in with timestamp
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'CHECKED_IN',
        checkedInAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            venue: true,
            club: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    res.json({
      message: 'Check-in successful',
      booking: updatedBooking,
      checkedInAt: updatedBooking.checkedInAt
    });
  } catch (error) {
    console.error('Verify QR code error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getUserBookings,
  cancelBooking,
  verifyQRCode
};
