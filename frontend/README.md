# Frontend Documentation

## Overview
This is the frontend application for the Event & Club Management Portal built with Next.js 14, TypeScript, and Tailwind CSS.

## Getting Started

### Installation
```bash
npm install
```

### Environment Setup
Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Running the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── app/
│   ├── contexts/
│   │   └── AuthContext.tsx      # Authentication context
│   ├── admin/
│   │   └── page.tsx             # Admin dashboard
│   ├── club/
│   │   └── page.tsx             # Club dashboard
│   ├── events/
│   │   └── page.tsx             # Events listing
│   ├── login/
│   │   └── page.tsx             # Login page
│   ├── register/
│   │   └── page.tsx             # Registration page
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/                  # Reusable components
├── lib/                         # Utility functions
├── types/                       # TypeScript type definitions
└── public/                      # Static assets
```

## Features

### 🎨 UI Components
- Responsive design with Tailwind CSS
- Smooth animations with Framer Motion
- Form handling with React Hook Form
- Toast notifications with React Hot Toast

### 🔐 Authentication
- JWT-based authentication
- Role-based access control
- Protected routes
- User context management

### 📱 Pages

#### Home Page (`/`)
- Landing page with feature overview
- Navigation based on user role
- Platform statistics

#### Authentication Pages
- **Login** (`/login`): User login with demo accounts
- **Register** (`/register`): User registration with role selection

#### Event Pages
- **Events** (`/events`): Browse and search events
- **Event Details** (`/events/[id]`): View event details and booking
- **Create Event** (`/events/create`): Create new events (Club role)

#### Dashboard Pages
- **Admin Dashboard** (`/admin`): Admin management interface
- **Club Dashboard** (`/club`): Club management interface

## Components

### AuthContext
Provides authentication state and methods:
```typescript
interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}
```

### User Types
```typescript
interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'STUDENT' | 'CLUB' | 'ADMIN'
  phone?: string
  avatar?: string
}
```

## API Integration

The frontend communicates with the backend API using Axios. All API calls are configured with:
- Base URL from environment variables
- Credentials included for cookie-based authentication
- Error handling with toast notifications

### API Service Functions
- Authentication: login, register, logout, getCurrentUser
- Events: getAllEvents, getEventById, createEvent, bookEvent
- Clubs: getAllClubs, getClubById, createClub, getAnalytics
- Admin: getDashboardStats, updateEventStatus, manageUsers
- Bookings: getUserBookings, cancelBooking, verifyQR

## Styling

### Tailwind CSS Classes
Custom utility classes defined in `globals.css`:
- `.btn-primary` - Primary button style
- `.btn-secondary` - Secondary button style
- `.btn-danger` - Danger button style
- `.input-field` - Form input style
- `.card` - Card container style
- `.card-hover` - Card with hover effect

### Color Scheme
- Primary: Blue (#3b82f6)
- Success: Green (#10b981)
- Warning: Yellow (#f59e0b)
- Danger: Red (#ef4444)
- Gray scale for text and backgrounds

## State Management

### Authentication State
Managed through React Context API with:
- User information
- Loading states
- Authentication methods

### Local State
Component-level state managed with:
- useState for form data and UI state
- useEffect for side effects and API calls

## Responsive Design

The application is fully responsive with breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Performance Optimizations

- Next.js Image optimization
- Code splitting with dynamic imports
- Lazy loading for heavy components
- Memoization for expensive calculations

## Development

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Husky for git hooks

## Deployment

### Build Process
```bash
npm run build
```

### Environment Variables
Set production environment variables:
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_APP_URL` - Frontend URL

### Static Export (Optional)
For static hosting:
```bash
npm run build
npm run export
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code style
2. Use TypeScript for all new components
3. Add proper error handling
4. Include responsive design
5. Test on multiple devices

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Check `NEXT_PUBLIC_API_URL` environment variable
   - Ensure backend server is running
   - Verify CORS configuration

2. **Authentication Issues**
   - Clear browser cookies
   - Check JWT token expiration
   - Verify user role permissions

3. **Build Errors**
   - Clear `.next` directory
   - Check TypeScript errors
   - Verify all dependencies are installed
