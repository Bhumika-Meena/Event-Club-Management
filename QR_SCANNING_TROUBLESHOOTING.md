# QR Code Scanning Troubleshooting Guide

## 🔍 Common Issues and Solutions

### Issue 1: QR Code Not Being Detected

**Symptoms:**
- Scanner is running but not detecting QR codes
- No feedback when QR code is in frame
- Scanner keeps running without results

**Solutions:**

1. **Check if QR code is on a screen:**
   - QR codes displayed on phone/computer screens can be harder to scan
   - **Solution:** Use "Enter Manual Code" option instead
   - Or print the QR code and scan the printed version

2. **Improve lighting:**
   - Ensure good, even lighting
   - Avoid glare on the QR code
   - Make sure QR code is clearly visible

3. **Adjust QR code size:**
   - Zoom in on the QR code on the attendee's device
   - Make sure QR code fills a good portion of the scanning frame
   - Hold device steady

4. **Check camera focus:**
   - Move QR code closer/farther from camera
   - Wait for camera to auto-focus
   - Ensure QR code is in the center of the frame

5. **Use Manual Entry:**
   - Click "Enter Manual Code"
   - Ask attendee to scan their own QR code with any QR reader app
   - Copy the JWT token and paste it manually

---

### Issue 2: "Check-in is not available yet" Error

**Symptoms:**
- Error message: "Check-in is not available yet. Check-in opens 30 minutes before the event."
- QR code is valid but check-in fails

**Solutions:**

1. **Check current time:**
   - Check-in opens **30 minutes before** event start time
   - If event starts at 12:00 PM, check-in opens at 11:30 AM
   - Wait until 30 minutes before the event

2. **Verify event time:**
   - Check the event date/time in the database
   - Ensure timezone is correct
   - Verify event is approved

3. **For testing purposes:**
   - You can temporarily modify the backend code to allow earlier check-in
   - Or set event time to past time for testing

---

### Issue 3: "Invalid or expired QR ticket" Error

**Symptoms:**
- Error: "Invalid or expired QR ticket"
- QR code was scanned but verification fails

**Solutions:**

1. **Check QR code age:**
   - QR codes expire after **1 year** (365 days)
   - If booking is older than 1 year, QR code is invalid
   - Solution: Create a new booking

2. **Verify QR code format:**
   - QR code should contain a JWT token
   - Token should start with `eyJ` (base64 encoded JWT)
   - If token looks wrong, QR code might be corrupted

3. **Check booking status:**
   - Verify booking exists in database
   - Check if booking was cancelled
   - Ensure booking is in `CONFIRMED` status

---

### Issue 4: Camera Not Starting

**Symptoms:**
- "Failed to start camera" error
- Camera permission denied
- Scanner doesn't activate

**Solutions:**

1. **Grant camera permissions:**
   - Click camera icon in browser address bar
   - Allow camera access
   - Refresh the page

2. **Check browser compatibility:**
   - Use Chrome or Firefox (recommended)
   - Ensure browser is up to date
   - Try incognito/private mode

3. **Check if camera is in use:**
   - Close other apps using camera
   - Restart browser
   - Check system camera permissions

4. **Use Manual Entry:**
   - If camera doesn't work, use manual code entry
   - This is a reliable backup method

---

### Issue 5: "Already checked in" Error

**Symptoms:**
- Error: "Already checked in"
- Shows previous check-in timestamp

**Solutions:**

1. **This is expected behavior:**
   - System prevents duplicate check-ins
   - Each booking can only be checked in once
   - Move to next attendee

2. **If check-in was accidental:**
   - Currently, there's no way to undo check-in
   - Contact admin to manually update database if needed

---

## 🧪 Testing the Scanner

### Step 1: Test with Manual Entry

1. Get a valid JWT token from a booking:
   ```sql
   SELECT qrCode FROM bookings WHERE id = 'YOUR_BOOKING_ID';
   ```

2. Go to check-in page
3. Click "Enter Manual Code"
4. Paste the JWT token
5. Click "Verify QR Code"
6. Should show success or specific error

### Step 2: Test Scanner Detection

1. Generate a test QR code with any QR generator:
   - Use a simple text QR code first
   - See if scanner detects it
   - If it detects, scanner is working

2. Try with actual booking QR code:
   - Open booking email
   - Display QR code on screen
   - Try scanning

### Step 3: Check Browser Console

1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for:
   - "QR Code detected: ..." - Scanner is working
   - "Processing QR code: ..." - Verification started
   - Error messages - Will show what's wrong

---

## 🔧 Debugging Steps

### 1. Check Scanner Status

Look for these console messages:
- ✅ "Starting QR scanner..." - Scanner initializing
- ✅ "Scanner started successfully" - Camera active
- ✅ "QR Code detected: ..." - QR code found
- ✅ "Processing QR code: ..." - Verification started
- ❌ Error messages - Check what failed

### 2. Verify Backend Connection

Check if API call is being made:
- Open Network tab in browser dev tools
- Look for POST request to `/api/bookings/verify-qr`
- Check response status and message

### 3. Test API Directly

Use the test script:
```bash
cd backend
node test-qr-verification.js YOUR_JWT_TOKEN
```

Or use Postman:
```
POST http://localhost:5000/api/bookings/verify-qr
Body: { "qrCode": "YOUR_JWT_TOKEN" }
```

### 4. Check Database

Verify booking exists and is valid:
```sql
SELECT 
  id,
  qrCode,
  status,
  "checkedInAt",
  "userId",
  "eventId"
FROM bookings
WHERE id = 'YOUR_BOOKING_ID';
```

---

## 💡 Best Practices

1. **For Production Events:**
   - Use printed QR codes when possible (easier to scan)
   - Have backup manual entry ready
   - Test scanner before event starts
   - Ensure good lighting at check-in point

2. **For Testing:**
   - Use manual entry for quick testing
   - Test timing restrictions
   - Verify error messages are clear
   - Check database after check-in

3. **Troubleshooting Order:**
   1. Check browser console for errors
   2. Try manual entry first
   3. Verify timing (30 min before event)
   4. Check booking status in database
   5. Test API directly
   6. Check camera permissions

---

## 📞 Quick Checklist

Before reporting an issue, check:

- [ ] Current time is 30+ minutes before event
- [ ] Booking exists in database
- [ ] Booking status is `CONFIRMED`
- [ ] QR code is not expired (less than 1 year old)
- [ ] Camera permissions granted
- [ ] Browser console shows no errors
- [ ] Tried manual entry option
- [ ] Checked network tab for API errors

---

## 🎯 Common Solutions Summary

| Issue | Quick Fix |
|-------|-----------|
| QR not detected | Use manual entry |
| Camera not working | Grant permissions, try different browser |
| "Not available yet" | Wait until 30 min before event |
| "Invalid QR" | Check if expired or booking cancelled |
| "Already checked in" | Normal - move to next attendee |

---

## 🔍 Still Having Issues?

1. **Check browser console** - Most errors are logged there
2. **Try manual entry** - This bypasses scanner issues
3. **Verify timing** - Most common issue is timing restriction
4. **Check database** - Verify booking exists and is valid
5. **Test API directly** - Use Postman or test script
