# Tech Stack

## Frontend

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4
- **State**: React Context API (AuthContext)
- **Fonts**: Geist Sans & Geist Mono

## Backend

- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt
- **Email**: Nodemailer with Google SMTP
- **File Upload**: Multer (CSV, attachments)
- **Real-time**: Socket.io
- **Security**: Helmet, CORS, express-rate-limit, express-validator

## Development Tools

- **TypeScript Compiler**: tsx for backend watch mode
- **Process Manager**: concurrently for running frontend + backend
- **Linting**: ESLint with Next.js config

## Common Commands

```bash
# Install dependencies
npm install

# Development (both servers)
npm run dev:all

# Frontend only (port 3000)
npm run dev:frontend

# Backend only (port 3001)
npm run dev:backend

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Environment Variables

Required in `.env.local`:
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT signing
- `GMAIL_USER`: Gmail address for SMTP
- `GMAIL_APP_PASSWORD`: Gmail app password
- `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:3000)
- `BACKEND_URL`: Backend API URL (default: http://localhost:3001)

## TypeScript Configuration

- Target: ES2017
- Module: ESNext with bundler resolution
- Path alias: `@/*` maps to `./src/*`
- Strict mode enabled
