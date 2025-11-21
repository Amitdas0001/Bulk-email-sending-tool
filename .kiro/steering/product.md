# Product Overview

Email Marketing SaaS Platform - A complete email marketing solution for managing leads, creating campaigns, and tracking email performance.

## Core Features

- User authentication with JWT
- CSV lead import with validation and duplicate detection
- Campaign creation with HTML editor and file attachments
- Bulk email sending via Google SMTP with rate limiting (20/min, 500/day)
- Real-time tracking: opens, clicks, bounces, unsubscribes
- Analytics dashboard with comprehensive metrics
- Admin panel for system overview

## Key Workflows

1. **Lead Management**: Upload CSV → Validate → Store in MongoDB → Manage status
2. **Campaign Creation**: Design email → Add attachments → Generate unique token → Save as draft
3. **Email Sending**: Select campaign → Choose leads → Send via SMTP → Track delivery
4. **Analytics**: Track pixel for opens → Redirect links for clicks → Display metrics

## Personalization

Emails support tokens: `{{name}}`, `{{email}}`, `{{company_name}}`

## Deployment

- Frontend: Vercel (Next.js)
- Backend: Railway/Render (Express API)
- Database: MongoDB Atlas
