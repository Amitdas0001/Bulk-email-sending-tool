# Email Marketing SaaS Platform

A complete email marketing SaaS platform built with Next.js, Express.js, MongoDB, and Google SMTP integration. Features include CSV lead upload, campaign creation, bulk email sending, real-time tracking, analytics, and a modern dashboard interface.

## 🚀 Features

- **User Authentication**: Secure signup/login with JWT tokens
- **CSV Upload**: Import leads from CSV files with validation
- **Campaign Management**: Create campaigns with HTML editor and file attachments
- **Bulk Email Sending**: Send personalized emails via Google SMTP with rate limiting
- **Real-time Tracking**: Track email opens, clicks, bounces, and unsubscribes
- **Analytics Dashboard**: View comprehensive campaign analytics and metrics
- **Modern UI**: Clean, responsive dashboard with sidebar navigation
- **File Storage**: Support for email attachments and inline images
- **Admin Panel**: Admin interface for system overview
- **Deployment Ready**: Configured for Vercel/Railway deployment

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js, TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Email Service**: Google SMTP via Nodemailer
- **Authentication**: JWT with bcrypt password hashing
- **File Upload**: Multer for CSV and attachment handling
- **Real-time**: Socket.io for live status updates
- **Tracking**: Custom pixel and link tracking system

## 🔧 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   Update `.env.local` with your MongoDB URI, Gmail credentials, and JWT secret.

3. **Start development servers**
   ```bash
   npm run dev:all
   ```
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB (local or cloud)
- Gmail account with App Password enabled

## 🎯 Main Features

### Dashboard Overview
- Campaign statistics and metrics
- Recent activity timeline
- Quick action buttons

### Lead Management
- CSV file upload with validation
- Duplicate detection and handling
- Lead status management

### Campaign Creation
- Rich HTML email editor
- Personalization tokens ({{name}}, {{email}}, {{company_name}})
- File attachments support
- Unique campaign token generation

### Email Sending
- Bulk email sending with Google SMTP
- Rate limiting (20 emails/minute, 500/day)
- Real-time sending status
- Automatic retry on failures

### Analytics & Tracking
- Email open tracking (invisible pixel)
- Link click tracking with redirects
- Bounce and spam detection
- Comprehensive analytics dashboard

## 📁 Project Structure

```
email-marketing-saas/
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   └── contexts/            # React contexts
├── backend/
│   ├── controllers/         # API controllers
│   ├── models/              # MongoDB schemas
│   ├── routes/              # Express routes
│   ├── middleware/          # Custom middleware
│   ├── utils/               # Utility functions
│   └── server.ts            # Main server file
└── .env.local               # Environment variables
```

## 🚀 Deployment

- **Frontend**: Deploy to Vercel with automatic GitHub integration
- **Backend**: Deploy to Railway/Render with environment variables
- **Database**: Use MongoDB Atlas for cloud database

## 📊 Analytics Metrics

- Delivery Rate, Open Rate, Click Rate
- Bounce Rate, Spam Rate, Unsubscribe Rate
- Timeline views and engagement tracking
- Real-time campaign performance

---

Built with modern web technologies for reliable email marketing automation.
