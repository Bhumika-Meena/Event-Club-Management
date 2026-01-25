const { PrismaClient } = require('@prisma/client');
const { sendOTPEmail } = require('./notificationService');

const prisma = new PrismaClient();

// In-memory OTP storage (in production, use Redis or database)
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP to email
const sendOTP = async (email) => {
  try {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return { success: false, message: 'Email already registered' };
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    otpStore.set(email, {
      otp,
      expiresAt,
      attempts: 0
    });

    // Send OTP email
    try {
      await sendOTPEmail(email, otp);
      console.log(`OTP sent to ${email}: ${otp}`);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // In development, log OTP to console and continue
      if (process.env.NODE_ENV === 'development') {
        console.log('═══════════════════════════════════════');
        console.log(`⚠️  EMAIL SENDING FAILED - OTP for ${email}:`);
        console.log(`   OTP: ${otp}`);
        console.log(`   (This OTP is valid for 10 minutes)`);
        console.log('═══════════════════════════════════════');
        // Still return success in development
        return { success: true, message: `OTP generated. Check console for OTP: ${otp}` };
      }
      // In production, fail if email can't be sent
      throw emailError;
    }

    return { success: true, message: 'OTP sent to your email' };
  } catch (error) {
    console.error('Send OTP error:', error);
    return { success: false, message: error.message || 'Failed to send OTP' };
  }
};

// Verify OTP
const verifyOTP = (email, otp) => {
  const stored = otpStore.get(email);

  if (!stored) {
    return { success: false, message: 'OTP not found or expired' };
  }

  // Check if OTP expired
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(email);
    return { success: false, message: 'OTP has expired' };
  }

  // Check attempts (max 5 attempts)
  if (stored.attempts >= 5) {
    otpStore.delete(email);
    return { success: false, message: 'Too many attempts. Please request a new OTP' };
  }

  // Verify OTP
  if (stored.otp !== otp) {
    stored.attempts += 1;
    return { success: false, message: 'Invalid OTP' };
  }

  // OTP verified - mark as verified
  otpStore.set(email, {
    ...stored,
    verified: true
  });

  return { success: true, message: 'OTP verified successfully' };
};

// Check if email is verified
const isEmailVerified = (email) => {
  const stored = otpStore.get(email);
  return stored && stored.verified === true;
};

// Remove verified OTP after registration
const removeOTP = (email) => {
  otpStore.delete(email);
};

// Clean up expired OTPs (run periodically)
const cleanupExpiredOTPs = () => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(email);
    }
  }
};

// Run cleanup every 5 minutes
setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);

module.exports = {
  sendOTP,
  verifyOTP,
  isEmailVerified,
  removeOTP
};
