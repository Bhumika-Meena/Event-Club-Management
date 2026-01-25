# QR Code Verification Guide

## 📋 Overview

This guide explains how to verify QR codes, their lifetime, and how check-in entries are stored in the database.

---

## 🔐 QR Code Lifetime

**Expiration:** **365 days (1 year)** from the time of booking

- The JWT token embedded in the QR code expires after 1 year
- This ensures tickets remain valid for long-term events
- After expiration, the QR code cannot be verified

**Location:** `backend/src/services/qrTicketService.js` (line 34)

---

## ✅ How to Verify QR Codes

### API Endpoint

**POST** `/api/bookings/verify-qr`

**Authentication Required:** Yes (JWT token in HTTP-only cookie)
**Authorization:** CLUB or ADMIN role only

### Request Body

```json
{
  "qrCode": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

The `qrCode` is the JWT token string that can be:
- Scanned from the QR code image
- Extracted from the QR code data

### Response Examples

#### ✅ Success (First Check-in)
```json
{
  "message": "Check-in successful",
  "booking": {
    "id": "clx123...",
    "status": "CHECKED_IN",
    "checkedInAt": "2026-01-21T11:00:00.000Z",
    "user": {
      "id": "clx456...",
      "firstName": "Sheetal",
      "lastName": "Kumar",
      "email": "sheetal@example.com"
    },
    "event": {
      "id": "clx789...",
      "title": "Seminar 1",
      "date": "2026-01-21T11:30:00.000Z",
      "venue": "A4",
      "club": {
        "name": "Tech Society"
      }
    }
  },
  "checkedInAt": "2026-01-21T11:00:00.000Z"
}
```

#### ❌ Already Checked In
```json
{
  "message": "Already checked in",
  "checkedInAt": "2026-01-21T11:00:00.000Z"
}
```

#### ❌ Invalid/Expired QR Code
```json
{
  "message": "Invalid or expired QR ticket"
}
```

#### ❌ Check-in Not Available Yet
```json
{
  "message": "Check-in is not available yet. Check-in opens 30 minutes before the event.",
  "checkInOpensAt": "2026-01-21T11:00:00.000Z"
}
```

### Verification Process

1. **JWT Validation**: Verifies the token signature and expiration
2. **Booking Lookup**: Finds the booking using the `bookingId` from the token
3. **Token Match**: Ensures the scanned token matches the stored `qrCode` in database
4. **Status Check**: Verifies booking is not cancelled or already checked in
5. **Timing Check**: Allows check-in 30 minutes before event start
6. **Update Database**: Marks booking as `CHECKED_IN` and records `checkedInAt` timestamp

---

## 💾 Database Entry Storage

### Booking Model Fields

When a QR code is verified and check-in is successful, the following fields are updated:

```prisma
model Booking {
  id          String        @id @default(cuid())
  qrCode      String        @unique        // JWT token string
  status      BookingStatus                // Changes to CHECKED_IN
  checkedInAt DateTime?                    // Timestamp of check-in
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  // ... other fields
}
```

### Status Values

- `CONFIRMED` - Booking created, not checked in yet
- `CHECKED_IN` - Successfully checked in at event
- `CANCELLED` - Booking was cancelled

### Example Database Entry After Check-in

```sql
SELECT 
  id,
  qrCode,
  status,
  "checkedInAt",
  "createdAt",
  "updatedAt",
  "userId",
  "eventId"
FROM bookings
WHERE id = 'clx123...';
```

**Result:**
```
id: clx123...
qrCode: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
status: CHECKED_IN
checkedInAt: 2026-01-21 11:00:00.000
createdAt: 2026-01-20 10:30:00.000
updatedAt: 2026-01-21 11:00:00.000
userId: clx456...
eventId: clx789...
```

---

## 🧪 Testing QR Code Verification

### Method 1: Using cURL

```bash
# First, login as CLUB or ADMIN to get auth cookie
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"club@example.com","password":"password123"}' \
  -c cookies.txt

# Verify QR code
curl -X POST http://localhost:5000/api/bookings/verify-qr \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"qrCode":"YOUR_JWT_TOKEN_HERE"}'
```

### Method 2: Using Postman

1. **Login** to get authentication cookie
   - POST `http://localhost:5000/api/auth/login`
   - Body: `{"email": "club@example.com", "password": "password123"}`
   - Save the cookie automatically

2. **Verify QR Code**
   - POST `http://localhost:5000/api/bookings/verify-qr`
   - Headers: `Content-Type: application/json`
   - Body: `{"qrCode": "YOUR_JWT_TOKEN_HERE"}`
   - Cookie will be sent automatically

### Method 3: Extract JWT from QR Code

To get the JWT token from a QR code image:

1. **Scan the QR code** using any QR scanner app
2. **Copy the text** - it's the JWT token
3. **Use it in the API request**

Or decode the QR code programmatically:

```javascript
// In Node.js
const QRCode = require('qrcode');
const fs = require('fs');

// Read QR code image
QRCode.decode(fs.readFileSync('qrcode.png'), (err, token) => {
  if (err) console.error(err);
  else console.log('JWT Token:', token);
});
```

---

## 📊 Querying Check-in Entries

### Get All Check-ins for an Event

```sql
SELECT 
  b.id,
  b."checkedInAt",
  b.status,
  u."firstName",
  u."lastName",
  u.email,
  e.title as event_title
FROM bookings b
JOIN users u ON b."userId" = u.id
JOIN events e ON b."eventId" = e.id
WHERE b."eventId" = 'YOUR_EVENT_ID'
  AND b.status = 'CHECKED_IN'
ORDER BY b."checkedInAt" DESC;
```

### Get Check-in Statistics

```sql
SELECT 
  e.title,
  COUNT(*) FILTER (WHERE b.status = 'CHECKED_IN') as checked_in_count,
  COUNT(*) FILTER (WHERE b.status = 'CONFIRMED') as pending_count,
  COUNT(*) as total_bookings
FROM events e
LEFT JOIN bookings b ON e.id = b."eventId"
WHERE e.id = 'YOUR_EVENT_ID'
GROUP BY e.id, e.title;
```

### Using Prisma Client (Backend)

```javascript
// Get all check-ins for an event
const checkIns = await prisma.booking.findMany({
  where: {
    eventId: 'YOUR_EVENT_ID',
    status: 'CHECKED_IN'
  },
  include: {
    user: {
      select: {
        firstName: true,
        lastName: true,
        email: true
      }
    }
  },
  orderBy: {
    checkedInAt: 'desc'
  }
});
```

---

## 🔒 Security Features

1. **JWT Signature Verification**: Ensures QR code hasn't been tampered with
2. **Token Expiration**: QR codes expire after 1 year
3. **Database Validation**: Verifies token matches stored booking
4. **Status Validation**: Prevents check-in of cancelled bookings
5. **Duplicate Prevention**: Prevents multiple check-ins for same booking
6. **Role-Based Access**: Only CLUB and ADMIN can verify QR codes
7. **Timing Validation**: Check-in only allowed 30 minutes before event

---

## 📝 Notes

- QR codes are **unique per booking** (stored in `qrCode` field with `@unique` constraint)
- Each check-in is **timestamped** in `checkedInAt` field
- The `updatedAt` field is automatically updated when status changes
- Check-in can only happen **once per booking**
- Check-in opens **30 minutes before** the event start time
