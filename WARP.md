# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development
```powershell
# Install dependencies
npm install

# Start both frontend and backend in development mode
npm run dev:all

# Start only frontend (Next.js)
npm run dev

# Start only backend (Express server with watch mode)
npm run dev:backend

# Start backend without watch mode
npm run backend
```

### Build & Production
```powershell
# Build frontend for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

### Testing Individual Components
```powershell
# Test specific backend route/controller
cd backend && npx tsx server.ts

# Test email service functionality
# Use the /api/health endpoint to verify backend is running
curl http://localhost:3001/api/health

# Test specific API endpoints during development
# Auth: POST http://localhost:3001/api/auth/login
# Leads: GET http://localhost:3001/api/leads
# Campaigns: GET http://localhost:3001/api/campaigns
# Email: POST http://localhost:3001/api/email/send
```

## Architecture Overview

### Full-Stack Architecture
This is a **monorepo containing a Next.js frontend and Express backend**, designed as a complete email marketing SaaS platform.

**Frontend (Next.js 15 + TypeScript):**
- App Router architecture in `src/app/`
- React components in `src/components/`
- Global state management via React Context (`src/contexts/AuthContext.tsx`)
- Tailwind CSS for styling

**Backend (Express + TypeScript):**
- RESTful API server in `backend/`
- MongoDB with Mongoose ODM for data persistence
- JWT authentication with bcrypt password hashing
- Google SMTP integration via Nodemailer
- Rate limiting and security middleware (Helmet, CORS)

### Key Domain Models

**User System:**
- `User` model with authentication, admin roles
- JWT-based session management with localStorage persistence
- Secure password hashing with bcrypt (salt rounds: 12)

**Email Marketing Core:**
- `Campaign` model with status tracking (draft/sending/sent/paused)
- `Lead` model for contact management with CSV import support
- `EmailTracking` model for opens, clicks, bounces, unsubscribes
- Template personalization with `{{name}}`, `{{email}}`, `{{company_name}}` tokens

**Email Service Architecture:**
- Rate-limited sending (20 emails/minute, 500/day) to comply with Gmail limits
- Real-time tracking via invisible pixels and link wrapping
- Attachment support with file upload handling
- Template processing with custom field substitution

### API Architecture

**Route Structure:**
- `/api/auth/*` - User authentication (login, signup)
- `/api/leads/*` - Lead management and CSV upload  
- `/api/campaigns/*` - Campaign CRUD operations
- `/api/email/*` - Email sending and management
- `/api/track/*` - Tracking pixels and click redirects

**Key Controllers:**
- `authController.ts` - JWT generation, password validation
- `campaignController.ts` - Campaign lifecycle management
- `emailController.ts` - Bulk email sending orchestration
- `leadController.ts` - CSV processing and lead validation
- `trackingController.ts` - Analytics data collection

### Database Schema Design

**MongoDB Collections:**
- **users**: Authentication, user profiles, admin flags
- **campaigns**: Email campaigns with metrics (open/click/bounce rates)
- **leads**: Contact lists with custom field support
- **emailtrackings**: Individual email interaction tracking

**Key Relationships:**
- Users → Campaigns (one-to-many)
- Users → Leads (one-to-many) 
- Campaigns → EmailTracking (one-to-many via campaignToken)
- Leads → EmailTracking (one-to-many)

### Environment Configuration

**Required Environment Variables:**
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `GMAIL_USER` - Gmail account for SMTP
- `GMAIL_APP_PASSWORD` - Gmail app-specific password
- `FRONTEND_URL` - Frontend URL for tracking links (default: http://localhost:3000)
- `PORT` - Backend port (default: 3001)

**Rate Limiting Configuration:**
- `RATE_LIMIT_WINDOW_MS` - API rate limit window (default: 15 minutes)
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window (default: 100)

### File Upload & Storage
- Uses Multer middleware for CSV and attachment handling
- Files stored in `backend/uploads/` directory
- Served statically via `/uploads` endpoint
- Support for email attachments with content-type detection

### Frontend State Management
- **AuthContext**: Global authentication state with localStorage persistence
- **Component Architecture**: Functional components with hooks
- **Routing**: Next.js App Router with TypeScript
- **Styling**: Tailwind CSS with custom configurations

### Development Notes

**Dual Server Setup:**
- Frontend runs on port 3000 (Next.js dev server)
- Backend runs on port 3001 (Express server with TSX watch mode)
- Use `npm run dev:all` to start both servers concurrently

**Database Integration:**
- MongoDB connection handled in `backend/utils/database.ts`
- Mongoose models define schema validation and methods
- Automatic password hashing on user save operations

**Email Service Constraints:**
- Gmail SMTP rate limits enforced in `emailService.ts`
- Automatic retry logic for failed sends
- Tracking pixel injection for open rate measurement
- Link wrapping for click tracking analytics

**Security Features:**
- Helmet.js for security headers
- CORS configuration for cross-origin requests
- Request rate limiting per IP address
- JWT token expiration and validation
- Secure password storage with salt rounds