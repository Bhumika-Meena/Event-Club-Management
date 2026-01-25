const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');

// JWT secret for QR tickets (should be different from auth JWT secret)
const QR_TICKET_SECRET = process.env.QR_TICKET_SECRET || process.env.JWT_SECRET || 'your-qr-ticket-secret-key';

/**
 * Generate a JWT-based QR code ticket for a booking
 * @param {Object} bookingData - Booking information
 * @param {string} bookingData.bookingId - Booking ID
 * @param {string} bookingData.userId - User ID
 * @param {string} bookingData.eventId - Event ID
 * @param {string} bookingData.userEmail - User email
 * @param {string} bookingData.userName - User name
 * @returns {Promise<{token: string, qrCodeImage: string}>} JWT token and QR code image data URL
 */
const generateQRTicket = async (bookingData) => {
  try {
    const { bookingId, userId, eventId, userEmail, userName } = bookingData;

    // Create JWT payload with booking information
    const payload = {
      bookingId,
      userId,
      eventId,
      userEmail,
      userName,
      type: 'EVENT_TICKET',
      iat: Math.floor(Date.now() / 1000) // Issued at timestamp
    };

    // Generate JWT token (expires in 1 year for long-term validity)
    const token = jwt.sign(payload, QR_TICKET_SECRET, {
      expiresIn: '365d'
    });

    // Generate QR code image from JWT token
    // Using higher width for better visibility in emails
    const qrCodeImage = await QRCode.toDataURL(token, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return {
      token,
      qrCodeImage
    };
  } catch (error) {
    console.error('Error generating QR ticket:', error);
    throw new Error('Failed to generate QR ticket');
  }
};

/**
 * Verify and decode a JWT-based QR ticket
 * @param {string} token - JWT token from QR code
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyQRTicket = (token) => {
  try {
    // Trim whitespace from token
    const cleanToken = token.trim();
    
    // Log the secret being used (first few chars for debugging)
    console.log('Using QR_TICKET_SECRET:', QR_TICKET_SECRET ? QR_TICKET_SECRET.substring(0, 10) + '...' : 'NOT SET');
    
    // Verify and decode the JWT token
    const decoded = jwt.verify(cleanToken, QR_TICKET_SECRET);

    // Validate token type
    if (decoded.type !== 'EVENT_TICKET') {
      console.error('Invalid token type:', decoded.type);
      throw new Error('Invalid ticket type');
    }

    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', {
      name: error.name,
      message: error.message,
      tokenPreview: token.substring(0, 50) + '...'
    });
    
    if (error.name === 'TokenExpiredError') {
      throw new Error('QR ticket has expired');
    } else if (error.name === 'JsonWebTokenError') {
      // Provide more specific error message
      if (error.message.includes('invalid signature')) {
        throw new Error('Invalid QR ticket signature - token may be corrupted');
      } else if (error.message.includes('jwt malformed')) {
        throw new Error('Invalid QR ticket format - token is malformed');
      }
      throw new Error('Invalid QR ticket: ' + error.message);
    }
    throw error;
  }
};

module.exports = {
  generateQRTicket,
  verifyQRTicket
};
