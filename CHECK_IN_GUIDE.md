# 📱 QR Code Check-In Guide - Step by Step

## Overview

This guide explains the complete process of checking in attendees using QR codes at events.

---

## 🎯 Who Can Check-In?

- **Club Organizers** (CLUB role) - Can check in attendees for their own events
- **Administrators** (ADMIN role) - Can check in attendees for any event

---

## 📋 Complete Check-In Process

### Step 1: Attendee Books an Event

1. Attendee visits the events page (`/events`)
2. Clicks "Book Now" on an event
3. Fills out the booking form (Student or Faculty details)
4. Confirms booking (payment if required)
5. **Receives booking confirmation email with QR code**

**Result:** Attendee has a QR code in their email that contains a JWT token

---

### Step 2: Access Check-In Page

**For Club Organizers:**
1. Log in to your account
2. Go to **Club Dashboard** (`/club`)
3. Click the **"Check-In"** button in the header (QR code icon)

**For Administrators:**
1. Log in to your account
2. Go to **Admin Dashboard** (`/admin`)
3. Click the **"Check-In"** button in the header (QR code icon)

**Direct URL:** `http://localhost:3000/check-in`

---

### Step 3: Start QR Scanner

1. On the Check-In page, click **"Start Scanner"** button
2. **Allow camera permissions** when prompted by your browser
3. The camera will activate and show a scanning frame

**Note:** 
- On mobile devices, it uses the back camera by default
- On desktop, it uses the default camera
- Make sure you're in a well-lit area

---

### Step 4: Scan Attendee's QR Code

**Option A: Camera Scanner (Recommended)**
1. Ask the attendee to open their booking confirmation email
2. Display the QR code on their phone/device
3. Position the QR code within the scanning frame on your screen
4. The system will **automatically detect and verify** the QR code
5. Wait for the success message

**Option B: Manual Entry (If Scanner Fails)**
1. Click **"Enter Manual Code"** button
2. Ask the attendee to copy the JWT token from their QR code
   - They can scan their own QR code with any QR reader app
   - Or extract the token from the email (if visible)
3. Paste the token into the text area
4. Click **"Verify QR Code"**

---

### Step 5: Verify Check-In Success

After scanning, you'll see one of these results:

#### ✅ **Success Message**
- Green checkmark icon
- Shows attendee name
- Shows event details (title, venue, club)
- Shows check-in timestamp
- Button to "Scan Another"

#### ❌ **Error Messages**

**"Invalid or expired QR ticket"**
- QR code is corrupted or expired (1 year validity)
- Solution: Ask attendee to show a fresh QR code

**"Already checked in"**
- This attendee was already checked in
- Shows the original check-in timestamp
- Solution: Move to next attendee

**"Check-in is not available yet"**
- Event hasn't started (check-in opens 30 minutes before)
- Shows when check-in will be available
- Solution: Wait until 30 minutes before event

**"This booking has been cancelled"**
- Attendee cancelled their booking
- Solution: They cannot check in

**"QR ticket does not match this booking"**
- Token doesn't match database record
- Solution: Ask attendee to verify their booking

---

### Step 6: Continue Scanning

After a successful check-in:
1. Click **"Scan Another"** button
2. Scanner restarts automatically
3. Repeat for next attendee

---

## 🔍 How QR Codes Work

### What's Inside the QR Code?

The QR code contains a **JWT (JSON Web Token)** with:
- Booking ID
- User ID
- Event ID
- User email and name
- Expiration date (1 year from booking)

### Security Features

1. **JWT Signature**: Prevents tampering
2. **Database Validation**: Verifies token matches booking
3. **Expiration Check**: QR codes expire after 1 year
4. **One-Time Use**: Can't check in twice
5. **Timing Validation**: Only works 30 minutes before event

---

## 📊 Viewing Check-In Records

### In Database

```sql
-- Get all check-ins for an event
SELECT 
  b.id,
  b."checkedInAt",
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

### Using API

```javascript
// Get booking details (includes check-in status)
GET /api/bookings/my-bookings

// Response includes:
{
  "bookings": [
    {
      "id": "...",
      "status": "CHECKED_IN",
      "checkedInAt": "2026-01-21T11:00:00.000Z",
      "event": { ... }
    }
  ]
}
```

---

## 🛠️ Troubleshooting

### Camera Not Working

**Problem:** Camera doesn't start or shows error

**Solutions:**
1. Check browser permissions (allow camera access)
2. Try a different browser (Chrome/Firefox recommended)
3. Use "Enter Manual Code" option instead
4. Check if another app is using the camera

### QR Code Not Scanning

**Problem:** Scanner doesn't detect QR code

**Solutions:**
1. Ensure good lighting
2. Hold QR code steady within frame
3. Make sure QR code is clear and not damaged
4. Try "Enter Manual Code" option
5. Ask attendee to zoom in on their QR code

### "Camera Access Denied"

**Problem:** Browser blocks camera permission

**Solutions:**
1. Click the camera icon in browser address bar
2. Allow camera permissions
3. Refresh the page
4. Check browser settings for camera permissions

### "Invalid QR Code"

**Problem:** QR code doesn't verify

**Solutions:**
1. Verify QR code is from booking confirmation email
2. Check if QR code is expired (1 year old)
3. Ensure attendee hasn't cancelled booking
4. Try manual entry with exact token

---

## 📱 Mobile vs Desktop

### Mobile Devices (Recommended)
- ✅ Better camera quality
- ✅ Easier to position for scanning
- ✅ Can use back camera
- ✅ Portable for event entry points

### Desktop/Laptop
- ✅ Larger screen for viewing results
- ✅ Easier to see attendee details
- ⚠️ May need external camera
- ⚠️ Less portable

**Best Practice:** Use mobile device at event entry point, desktop for backup/admin

---

## 🎬 Example Workflow

### At Event Entry Point

1. **Setup:**
   - Open check-in page on tablet/phone
   - Log in as Club organizer or Admin
   - Start scanner

2. **For Each Attendee:**
   - "Hi! Please show me your QR code from the booking email"
   - Attendee opens email and shows QR code
   - Position QR code in scanner frame
   - Wait for success message
   - "Great! You're checked in. Enjoy the event!"

3. **If Issues:**
   - Use manual entry option
   - Verify attendee details
   - Contact admin if needed

---

## 🔐 Security Notes

- Only CLUB and ADMIN roles can access check-in page
- QR codes are unique per booking
- Each check-in is timestamped
- Duplicate check-ins are prevented
- Check-in opens 30 minutes before event
- QR codes expire after 1 year

---

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Verify you have CLUB or ADMIN role
3. Check browser console for errors
4. Try manual code entry as backup
5. Contact system administrator

---

## ✅ Quick Checklist

Before starting check-in:
- [ ] Logged in as CLUB or ADMIN
- [ ] Camera permissions granted
- [ ] Good lighting available
- [ ] Backup manual entry ready
- [ ] Event starts within 30 minutes (or later)

During check-in:
- [ ] QR code clearly visible
- [ ] Scanner frame positioned correctly
- [ ] Success/error message noted
- [ ] Attendee confirmed checked in

After check-in:
- [ ] Records saved in database
- [ ] Can view check-ins via API/database
- [ ] Ready for next attendee
