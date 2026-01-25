# Event & Club Management Portal

A comprehensive full-stack web application for managing events and clubs with role-based access control, ticket booking, and QR code verification.

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication with secure HTTP-only cookies
- Role-based access control (Student, Club, Admin)
- User registration and login system

### 📅 Event Management
- Create, update, and delete events
- Event approval workflow for admins
- Real-time seat availability tracking
- Event details with venue, date, pricing

### 🎫 Ticket Booking & RSVP
- Book events with seat availability check
- Generate unique QR codes for each ticket
- QR code verification for event check-in
- View booking history

### 🏛️ Club Management
- Club profile management
- Event analytics and reporting
- Attendee management
- Social media integration

### 👨‍💼 Admin Dashboard
- Approve/reject events
- User and club management
- Comprehensive analytics
- Platform statistics

### 📧 Notifications
- Email confirmations for bookings
- Event reminders
- Optional SMS notifications via Twilio

## Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database with Prisma ORM
- **JWT** for authentication
- **Nodemailer** for email notifications
- **Twilio** for SMS (optional)
- **QRCode** library for ticket generation

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Hook Form** for form handling
- **Axios** for API calls

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
```

Edit the `.env` file with your configuration:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/event_club_db"
JWT_SECRET="your-super-secret-jwt-key-here"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

5. Start the development server:
```bash
npm run dev
```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Demo Accounts

The seed script creates demo accounts for testing:

- **Admin**: admin@example.com / admin123
- **Club**: club@example.com / club123  
- **Student**: student@example.com / student123

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create event (Club/Admin)
- `PUT /api/events/:id` - Update event (Club/Admin)
- `DELETE /api/events/:id` - Delete event (Club/Admin)
- `POST /api/events/book` - Book event

### Clubs
- `GET /api/clubs` - Get all clubs
- `GET /api/clubs/:id` - Get club by ID
- `POST /api/clubs` - Create club
- `PUT /api/clubs/:id` - Update club
- `GET /api/clubs/my/club` - Get my club
- `GET /api/clubs/my/analytics` - Get club analytics

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/users` - Get all users
- `GET /api/admin/events` - Get events for approval
- `PATCH /api/admin/events/:id/status` - Approve/reject event
- `PATCH /api/admin/users/:id/status` - Update user status

### Bookings
- `GET /api/bookings/my-bookings` - Get user bookings
- `PATCH /api/bookings/:id/cancel` - Cancel booking
- `POST /api/bookings/verify-qr` - Verify QR code

## Database Schema

The application uses the following main entities:

- **Users**: User accounts with role-based access
- **Clubs**: Club profiles and information
- **Events**: Event details and management
- **Bookings**: Ticket bookings with QR codes
- **Notifications**: System notifications

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
