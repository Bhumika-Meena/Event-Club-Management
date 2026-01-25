/**
 * Test script for QR code verification
 * 
 * Usage:
 * 1. Get a JWT token from a QR code (scan it or extract from booking)
 * 2. Login as CLUB or ADMIN user
 * 3. Run: node test-qr-verification.js <JWT_TOKEN>
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
const CLUB_EMAIL = process.env.TEST_CLUB_EMAIL || 'club@example.com';
const CLUB_PASSWORD = process.env.TEST_CLUB_PASSWORD || 'password123';

// Get JWT token from command line argument
const qrCodeToken = process.argv[2];

if (!qrCodeToken) {
  console.error('❌ Error: QR code token is required');
  console.log('\nUsage: node test-qr-verification.js <JWT_TOKEN>');
  console.log('\nExample:');
  console.log('  node test-qr-verification.js eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
  process.exit(1);
}

async function testQRVerification() {
  try {
    console.log('🔐 Testing QR Code Verification...\n');

    // Step 1: Login as CLUB or ADMIN
    console.log('1️⃣ Logging in as CLUB/ADMIN...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: CLUB_EMAIL,
      password: CLUB_PASSWORD
    }, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!loginResponse.data.user) {
      throw new Error('Login failed');
    }

    console.log(`✅ Logged in as: ${loginResponse.data.user.firstName} ${loginResponse.data.user.lastName} (${loginResponse.data.user.role})\n`);

    // Extract cookies from response
    const cookies = loginResponse.headers['set-cookie'];
    const cookieString = cookies ? cookies.map(c => c.split(';')[0]).join('; ') : '';

    // Step 2: Verify QR Code
    console.log('2️⃣ Verifying QR code...');
    console.log(`   Token: ${qrCodeToken.substring(0, 50)}...\n`);

    const verifyResponse = await axios.post(
      `${API_BASE_URL}/bookings/verify-qr`,
      { qrCode: qrCodeToken },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookieString
        }
      }
    );

    // Step 3: Display results
    console.log('✅ QR Code Verification Successful!\n');
    console.log('📋 Check-in Details:');
    console.log('─────────────────────────────────────────');
    console.log(`Status: ${verifyResponse.data.booking.status}`);
    console.log(`Checked In At: ${new Date(verifyResponse.data.checkedInAt).toLocaleString()}`);
    console.log(`\n👤 User Information:`);
    console.log(`   Name: ${verifyResponse.data.booking.user.firstName} ${verifyResponse.data.booking.user.lastName}`);
    console.log(`   Email: ${verifyResponse.data.booking.user.email}`);
    console.log(`\n🎫 Event Information:`);
    console.log(`   Title: ${verifyResponse.data.booking.event.title}`);
    console.log(`   Date: ${new Date(verifyResponse.data.booking.event.date).toLocaleString()}`);
    console.log(`   Venue: ${verifyResponse.data.booking.event.venue}`);
    console.log(`   Club: ${verifyResponse.data.booking.event.club.name}`);
    console.log('─────────────────────────────────────────\n');

  } catch (error) {
    console.error('\n❌ Verification Failed!\n');
    
    if (error.response) {
      // Server responded with error
      console.error(`Status: ${error.response.status}`);
      console.error(`Message: ${error.response.data.message || error.response.data.error || 'Unknown error'}`);
      
      if (error.response.data.checkInOpensAt) {
        console.error(`\nCheck-in opens at: ${new Date(error.response.data.checkInOpensAt).toLocaleString()}`);
      }
      
      if (error.response.data.checkedInAt) {
        console.error(`\nAlready checked in at: ${new Date(error.response.data.checkedInAt).toLocaleString()}`);
      }
    } else if (error.request) {
      // Request made but no response
      console.error('No response from server. Is the backend running?');
      console.error(`URL: ${error.config?.url}`);
    } else {
      // Error setting up request
      console.error('Error:', error.message);
    }
    
    process.exit(1);
  }
}

// Run the test
testQRVerification();
