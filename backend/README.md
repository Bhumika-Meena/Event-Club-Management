# Backend API Documentation

## Overview
This is the backend API for the Event & Club Management Portal built with Node.js, Express, and PostgreSQL.

## Getting Started

### Installation
```bash
npm install
```

### Environment Setup
Copy `env.example` to `.env` and configure:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/event_club_db"
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="your-twilio-phone-number"
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE=5242880
FRONTEND_URL="http://localhost:3000"
```

### Database Setup
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### Running the Server
```bash
npm run dev
```

## API Endpoints

### Authentication Routes (`/api/auth`)

#### POST /register
Register a new user
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "STUDENT"
}
```

#### POST /login
Login user
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST /logout
Logout user (clears cookie)

#### GET /me
Get current user information (requires authentication)

### Event Routes (`/api/events`)

#### GET /
Get all events with pagination
Query params: `page`, `limit`, `status`, `clubId`

#### GET /:id
Get event by ID

#### POST /
Create new event (requires CLUB or ADMIN role)
```json
{
  "title": "Event Title",
  "description": "Event description",
  "venue": "Event venue",
  "date": "2024-01-01T10:00:00Z",
  "maxSeats": 100,
  "price": 10,
  "clubId": "club-id"
}
```

#### PUT /:id
Update event (requires CLUB or ADMIN role)

#### DELETE /:id
Delete event (requires CLUB or ADMIN role)

#### POST /book
Book an event (requires authentication)
```json
{
  "eventId": "event-id"
}
```

### Club Routes (`/api/clubs`)

#### GET /
Get all clubs with pagination

#### GET /:id
Get club by ID

#### POST /
Create new club (requires CLUB role)
```json
{
  "name": "Club Name",
  "description": "Club description",
  "website": "https://club.com",
  "instagram": "@club",
  "facebook": "clubpage",
  "twitter": "@club"
}
```

#### PUT /:id
Update club (requires CLUB role)

#### GET /my/club
Get current user's club (requires CLUB role)

#### GET /my/analytics
Get club analytics (requires CLUB role)

### Admin Routes (`/api/admin`)

#### GET /dashboard
Get admin dashboard statistics (requires ADMIN role)

#### GET /users
Get all users with pagination (requires ADMIN role)

#### PATCH /users/:id/status
Update user status (requires ADMIN role)
```json
{
  "isActive": true
}
```

#### GET /events
Get events for approval (requires ADMIN role)

#### PATCH /events/:id/status
Approve or reject event (requires ADMIN role)
```json
{
  "status": "APPROVED"
}
```

### Booking Routes (`/api/bookings`)

#### GET /my-bookings
Get current user's bookings (requires authentication)

#### PATCH /:id/cancel
Cancel a booking (requires authentication)

#### POST /verify-qr
Verify QR code for check-in (requires CLUB or ADMIN role)
```json
{
  "qrCode": "qr-code-string"
}
```

### User Routes (`/api/users`)

#### GET /profile
Get user profile (requires authentication)

#### PUT /profile
Update user profile (requires authentication)
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

## Authentication

The API uses JWT tokens stored in HTTP-only cookies for authentication. Include the token in the Authorization header for protected routes:

```
Authorization: Bearer <token>
```

## Error Handling

All errors return a consistent format:
```json
{
  "message": "Error description",
  "error": "Additional error details (development only)"
}
```

## Rate Limiting

API requests are rate-limited to 100 requests per 15-minute window per IP address.

## File Uploads

File uploads are handled via multer middleware. Supported file types and size limits are configured in the environment variables.

## Database Models

### User
- id (String, Primary Key)
- email (String, Unique)
- password (String, Hashed)
- firstName (String)
- lastName (String)
- role (Enum: STUDENT, CLUB, ADMIN)
- phone (String, Optional)
- avatar (String, Optional)
- isActive (Boolean)
- createdAt (DateTime)
- updatedAt (DateTime)

### Club
- id (String, Primary Key)
- name (String, Unique)
- description (String, Optional)
- logo (String, Optional)
- website (String, Optional)
- instagram (String, Optional)
- facebook (String, Optional)
- twitter (String, Optional)
- isActive (Boolean)
- ownerId (String, Foreign Key)
- createdAt (DateTime)
- updatedAt (DateTime)

### Event
- id (String, Primary Key)
- title (String)
- description (String)
- banner (String, Optional)
- venue (String)
- date (DateTime)
- maxSeats (Int)
- price (Float, Optional)
- status (Enum: PENDING, APPROVED, REJECTED, CANCELLED)
- creatorId (String, Foreign Key)
- clubId (String, Foreign Key)
- createdAt (DateTime)
- updatedAt (DateTime)

### Booking
- id (String, Primary Key)
- qrCode (String, Unique)
- status (Enum: CONFIRMED, CANCELLED, CHECKED_IN)
- userId (String, Foreign Key)
- eventId (String, Foreign Key)
- createdAt (DateTime)
- updatedAt (DateTime)

### Notification
- id (String, Primary Key)
- title (String)
- message (String)
- type (String)
- isRead (Boolean)
- userId (String, Foreign Key)
- createdAt (DateTime)

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data

### Testing
Run tests with:
```bash
npm test
```

### Linting
Check code style with:
```bash
npm run lint
```
