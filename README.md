# Chronosi - AI-Powered Learning Platform

Chronosi is an intelligent learning platform that generates personalized study plans using AI. It helps users master any subject with curated learning timelines, complete with video recommendations, articles, and course suggestions.

## Features

- **AI-Generated Study Plans**: Get personalized learning paths for any subject
- **User Authentication**: Secure login and signup system
- **Modern UI/UX**: Beautiful, responsive design with Tailwind CSS
- **Protected Routes**: Secure access to study plan features
- **Real-time Validation**: Form validation and error handling

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation
- Lucide React for icons

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL database
- Redis for caching
- JWT authentication
- bcrypt for password hashing
- Express rate limiting

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- Redis 6+
- npm or yarn

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Chronosi
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env file with your configuration
# Set your database URL, JWT secrets, and other environment variables

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# From the root directory
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:3000`

### 4. Database Setup

Make sure PostgreSQL and Redis are running. The backend will automatically create the necessary tables on first run.

## Environment Variables

### Backend (.env)

```env
# Server Configuration
NODE_ENV=development
PORT=5000
HOST=localhost

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/chronosi_db
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user profile

### Study Plans
- `POST /api/study-plans` - Create study plan
- `GET /api/study-plans` - Get user's study plans
- `GET /api/study-plans/:id` - Get specific study plan

## Usage

1. **Visit the homepage** at `http://localhost:3000`
2. **Sign up** for a new account or **sign in** if you already have one
3. **Create a study plan** by specifying what you want to learn
4. **Follow the AI-generated timeline** with curated resources

## Development

### Available Scripts

```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Backend
npm run dev          # Start development server with nodemon
npm run build        # Build TypeScript
npm run start        # Start production server
```

### Project Structure

```
Chronosi/
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── contexts/           # React contexts (Auth)
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── backend/                # Backend source
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── database/       # Database connections
│   │   └── utils/          # Utility functions
│   └── Dockerfile
└── docker-compose.yml      # Docker configuration
```

## Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on authentication endpoints
- CORS configuration
- Input validation and sanitization
- SQL injection protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.






