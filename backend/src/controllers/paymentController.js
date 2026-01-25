const { PrismaClient } = require('@prisma/client');
const { getRazorpayInstance } = require('../services/razorpayService');

const prisma = new PrismaClient();

const createOrder = async (req, res) => {
  try {
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required' });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: { select: { bookings: true } },
        club: { select: { name: true } },
      },
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status !== 'APPROVED') {
      return res.status(400).json({ message: 'Event is not available for booking' });
    }

    if (event._count.bookings >= event.maxSeats) {
      return res.status(400).json({ message: 'No seats available' });
    }

    const price = event.price || 0;

    if (price <= 0) {
      return res.status(400).json({ message: 'Event is free, no payment required' });
    }

    const amount = Math.round(price * 100); // amount in paise
    const razorpay = getRazorpayInstance();

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `evt_${eventId}_${Date.now()}`,
      notes: {
        eventId,
        userId: req.user.id,
      },
    });

    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      event: {
        id: event.id,
        title: event.title,
        venue: event.venue,
        clubName: event.club?.name || '',
      },
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    return res.status(500).json({ message: 'Failed to create payment order' });
  }
};

module.exports = {
  createOrder,
};


