# Project Structure

## Root Layout

```
email-marketing-saas/
├── src/                    # Next.js frontend
├── backend/                # Express.js API
├── api/                    # Vercel serverless functions
├── public/                 # Static assets
└── .env.local              # Environment variables
```

## Frontend (`src/`)

```
src/
├── app/
│   ├── layout.tsx          # Root layout with AuthProvider
│   ├── page.tsx            # Landing/auth page
│   ├── globals.css         # Global styles
│   └── favicon.ico
├── components/             # React components (all client-side)
│   ├── AuthPage.tsx        # Login/signup
│   ├── Dashboard.tsx       # Main dashboard with sidebar nav
│   ├── DashboardStats.tsx  # Stats overview
│   ├── UploadLeads.tsx     # CSV upload
│   ├── ManageLeads.tsx     # Lead management
│   ├── CreateCampaign.tsx  # Campaign editor
│   ├── SendCampaign.tsx    # Email sending
│   ├── TrackCampaign.tsx   # Analytics view
│   ├── AnalyticsView.tsx   # Detailed analytics
│   └── SettingsPage.tsx    # User settings
└── contexts/
    └── AuthContext.tsx     # Auth state management
```

## Backend (`backend/`)

```
backend/
├── server.ts               # Express app setup
├── controllers/            # Request handlers
│   ├── authController.ts
│   ├── campaignController.ts
│   ├── emailController.ts
│   ├── leadController.ts
│   ├── settingsController.ts
│   ├── statsController.ts
│   └── trackingController.ts
├── models/                 # Mongoose schemas
│   ├── User.ts
│   ├── Lead.ts
│   ├── Campaign.ts
│   └── EmailTracking.ts
├── routes/                 # Express routes
│   ├── auth.ts
│   ├── leads.ts
│   ├── campaigns.ts
│   ├── email.ts
│   ├── tracking.ts
│   ├── settings.ts
│   └── stats.ts
├── middleware/             # Custom middleware
│   ├── auth.ts             # JWT verification
│   └── upload.ts           # Multer config
├── utils/                  # Utilities
│   ├── database.ts         # MongoDB connection
│   └── emailService.ts     # Nodemailer setup
└── uploads/                # File storage
    ├── csv/
    └── attachments/
```

## Architecture Patterns

### Frontend
- All components use `'use client'` directive (client-side rendering)
- Dashboard uses tab-based navigation with conditional rendering
- AuthContext provides global auth state
- API calls to backend at `http://localhost:3001/api/*`

### Backend
- RESTful API structure
- Controller → Service → Model pattern
- JWT middleware protects authenticated routes
- Mongoose models with TypeScript interfaces
- CORS configured for frontend origin

### Data Models
- **User**: Authentication and profile
- **Lead**: Contact information and status
- **Campaign**: Email campaign details and stats
- **EmailTracking**: Individual email tracking events

## File Naming Conventions

- Components: PascalCase (e.g., `Dashboard.tsx`)
- Controllers: camelCase with suffix (e.g., `authController.ts`)
- Models: PascalCase (e.g., `Campaign.ts`)
- Routes: lowercase (e.g., `leads.ts`)
- Utilities: camelCase (e.g., `emailService.ts`)
