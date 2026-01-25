# QR Code Verification Fix

## 🔧 Changes Made

### 1. Improved Error Logging
- Added detailed console logging to track JWT verification process
- Logs token preview, secret being used, and specific error types
- Helps identify exactly where verification fails

### 2. More Robust Verification
- If JWT verifies successfully and contains correct `bookingId`, check-in is allowed
- Handles cases where database `qrCode` might be old format or different
- Automatically updates stored `qrCode` if JWT is valid but DB value differs

### 3. Fixed Booking Creation
- Changed empty string `qrCode` to temporary unique value
- Prevents database constraint issues with `@unique` constraint

### 4. Better Error Messages
- More specific error messages for different JWT failure types
- Provides hints about what went wrong

---

## 🚨 Important: Restart Backend Server

**After these changes, you MUST restart your backend server:**

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd backend
npm run dev
```

The JWT secret is loaded when the server starts, so changes won't take effect until restart.

---

## ✅ Testing Steps

### Step 1: Verify Environment Variables

Check your `backend/.env` file has:
```env
JWT_SECRET="your-super-secret-jwt-key-here"
# Optional, defaults to JWT_SECRET if not set:
QR_TICKET_SECRET="your-qr-ticket-secret-key-here"
```

### Step 2: Create a New Booking

1. Book a new event (to get a fresh QR code with current JWT secret)
2. Check your email for the booking confirmation
3. The QR code should contain a JWT token

### Step 3: Test Check-In

1. Go to `/check-in` page
2. Click "Enter Manual Code"
3. Copy the JWT token from the QR code (scan with any QR reader app, or extract from email)
4. Paste and click "Verify QR Code"
5. Check browser console for detailed logs

### Step 4: Check Backend Logs

Look for these messages in your backend console:
- `Verifying QR ticket, token length: ...`
- `Token decoded successfully: ...`
- `Booking found: ...`
- `Check-in successful`

If you see errors, they'll show exactly what went wrong.

---

## 🔍 Debugging

### If you still get "Invalid QR ticket":

1. **Check JWT Secret:**
   ```bash
   # In backend console, you should see:
   # "Using QR_TICKET_SECRET: your-secret..."
   ```
   If it shows "NOT SET", add `JWT_SECRET` to your `.env` file

2. **Verify Token Format:**
   - JWT tokens start with `eyJ`
   - Should have 3 parts separated by dots: `header.payload.signature`
   - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJib29raW5n...`

3. **Check if Booking Exists:**
   ```sql
   SELECT id, qrCode, status FROM bookings WHERE id = 'YOUR_BOOKING_ID';
   ```

4. **Test JWT Manually:**
   ```bash
   cd backend
   node test-qr-verification.js YOUR_JWT_TOKEN
   ```

### Common Issues:

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid QR ticket" | JWT secret mismatch | Restart server, ensure JWT_SECRET is set |
| "Invalid QR ticket signature" | Token corrupted | Get fresh QR code from email |
| "QR ticket has expired" | Token older than 1 year | Create new booking |
| "Booking not found" | Wrong bookingId in token | Verify booking exists |

---

## 📝 What Changed in Code

### `backend/src/controllers/bookingController.js`
- Added detailed logging for JWT verification
- Made verification more lenient (trusts valid JWT even if DB differs)
- Auto-updates stored qrCode if JWT is valid

### `backend/src/services/qrTicketService.js`
- Better error messages for different JWT error types
- Logs which secret is being used
- Trims whitespace from tokens

### `backend/src/controllers/eventController.js`
- Fixed empty qrCode issue by using temporary unique value

---

## 🎯 Expected Behavior

After restarting the server and testing:

1. ✅ JWT token is verified successfully
2. ✅ Booking is found in database
3. ✅ Check-in is recorded with timestamp
4. ✅ `checkedInAt` field is updated in database
5. ✅ Success message is shown to user

---

## 💡 Next Steps

1. **Restart backend server** (important!)
2. **Create a new booking** to get a fresh QR code
3. **Test check-in** using manual code entry
4. **Check browser console** for any errors
5. **Check backend console** for verification logs

If issues persist, check the console logs - they now provide detailed information about what's failing.
