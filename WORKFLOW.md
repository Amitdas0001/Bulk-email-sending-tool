# Email Marketing Tool - Complete Workflow

## System Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Next.js   │ ◄─────► │  Express.js │ ◄─────► │   MongoDB   │
│  Frontend   │  REST   │   Backend   │         │   Database  │
│  Port 3000  │   API   │  Port 3001  │         │             │
└─────────────┘         └─────────────┘         └─────────────┘
                               │
                               ▼
                        ┌─────────────┐
                        │ Gmail SMTP  │
                        │   Server    │
                        └─────────────┘
```

## User Workflow

### 1. Authentication Flow
```
User → Sign Up/Login → JWT Token → Store in LocalStorage → Access Dashboard
```

**Files Involved:**
- Frontend: `src/components/AuthPage.tsx`, `src/contexts/AuthContext.tsx`
- Backend: `backend/controllers/authController.ts`, `backend/routes/auth.ts`
- Model: `backend/models/User.ts`

### 2. SMTP Configuration Flow
```
Dashboard → Settings → Enter SMTP Details → Test Connection → Save
```

**Files Involved:**
- Frontend: `src/components/SettingsPage.tsx`
- Backend: `backend/controllers/settingsController.ts`
- Model: `backend/models/User.ts` (smtp field)

**SMTP Settings:**
- Host: `smtp.gmail.com`
- Port: `587` (TLS) or `465` (SSL)
- User: Gmail address
- Password: Gmail App Password (16 characters)

### 3. Lead Management Flow

#### Upload Leads
```
CSV File → Upload → Parse → Validate → Store in MongoDB → Display in UI
```

**CSV Format:**
```csv
name,email,company_name
John Doe,john@example.com,Acme Corp
Jane Smith,jane@example.com,Tech Inc
```

**Files Involved:**
- Frontend: `src/components/UploadLeads.tsx`
- Backend: `backend/controllers/leadController.ts`, `backend/middleware/upload.ts`
- Model: `backend/models/Lead.ts`

**Validation Rules:**
- Required: `name`, `email`
- Optional: `company_name`
- Email must be unique per user
- Duplicate emails are rejected

#### Manage Leads
```
View All Leads → Edit/Delete → Update Database → Refresh UI
```

**Files Involved:**
- Frontend: `src/components/ManageLeads.tsx`
- Backend: `backend/controllers/leadController.ts`

### 4. Campaign Creation Flow
```
Create Campaign → Enter Details → Add HTML Content → Upload Attachments → Save as Draft
```

**Campaign Fields:**
- Name: Campaign identifier
- Subject: Email subject line
- HTML Content: Email body (supports personalization tokens)
- Attachments: Optional files (max 5 files)

**Personalization Tokens:**
- `{{name}}` - Replaced with lead's name
- `{{email}}` - Replaced with lead's email
- `{{company_name}}` - Replaced with lead's company name

**Files Involved:**
- Frontend: `src/components/CreateCampaign.tsx`
- Backend: `backend/controllers/campaignController.ts`, `backend/middleware/upload.ts`
- Model: `backend/models/Campaign.ts`

**Campaign Token:**
- Unique identifier generated for each campaign
- Used for tracking opens, clicks, and unsubscribes

### 5. Email Sending Flow
```
Select Campaign → Click Send → Initialize Tracking → Send Emails → Update Stats
```

**Detailed Process:**

1. **Pre-Send Validation**
   - Check SMTP settings configured
   - Verify campaign exists and is in draft/paused status
   - Ensure active leads exist
   - Create tracking records for all leads

2. **Bulk Email Sending**
   ```
   For each lead:
     1. Personalize email content (replace tokens)
     2. Add tracking pixel for opens
     3. Wrap links with tracking URLs
     4. Send via SMTP
     5. Update tracking status (sent/failed)
     6. Update campaign stats
     7. Wait 3 seconds (rate limiting)
   ```

3. **Rate Limiting**
   - 3 seconds between emails = 20 emails/minute
   - Gmail limit: 500 emails/day
   - Automatic retry on temporary failures

**Files Involved:**
- Frontend: `src/components/SendCampaign.tsx`
- Backend: `backend/controllers/emailController.ts`, `backend/utils/emailService.ts`
- Models: `backend/models/Campaign.ts`, `backend/models/EmailTracking.ts`

### 6. Tracking & Analytics Flow

#### Email Open Tracking
```
Email Opened → Load Tracking Pixel → Backend Receives Request → Update Database
```

**Tracking Pixel:**
```html
<img src="http://localhost:3001/api/track/open/{campaignToken}?lead={leadId}" width="1" height="1" />
```

**Files Involved:**
- Backend: `backend/controllers/trackingController.ts`
- Model: `backend/models/EmailTracking.ts`

#### Link Click Tracking
```
User Clicks Link → Redirect to Tracking URL → Log Click → Redirect to Original URL
```

**Tracking URL:**
```
http://localhost:3001/api/track/click/{campaignToken}?lead={leadId}&url={encodedUrl}
```

**Files Involved:**
- Backend: `backend/controllers/trackingController.ts`
- Model: `backend/models/EmailTracking.ts`

#### Unsubscribe Flow
```
User Clicks Unsubscribe → Update Lead Status → Update Campaign Stats → Show Confirmation
```

**Files Involved:**
- Backend: `backend/controllers/trackingController.ts`
- Models: `backend/models/Lead.ts`, `backend/models/Campaign.ts`

#### Analytics Dashboard
```
Select Campaign → Fetch Tracking Data → Calculate Metrics → Display Charts
```

**Metrics Calculated:**
- **Open Rate**: (Opened / Delivered) × 100
- **Click Rate**: (Clicked / Opened) × 100
- **Bounce Rate**: (Bounced / Sent) × 100
- **Delivery Rate**: (Delivered / Sent) × 100

**Files Involved:**
- Frontend: `src/components/TrackCampaign.tsx`, `src/components/AnalyticsView.tsx`
- Backend: `backend/controllers/trackingController.ts`, `backend/controllers/statsController.ts`

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  isAdmin: Boolean,
  smtp: {
    host: String,
    port: Number,
    user: String,
    pass: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Lead Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  name: String,
  email: String,
  companyName: String,
  status: 'active' | 'unsubscribed' | 'bounced',
  createdAt: Date,
  updatedAt: Date
}
```

### Campaign Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  campaignToken: String (unique),
  name: String,
  subject: String,
  htmlContent: String,
  textContent: String,
  attachments: Array,
  status: 'draft' | 'sending' | 'sent' | 'paused',
  totalRecipients: Number,
  sentCount: Number,
  failedCount: Number,
  openCount: Number,
  clickCount: Number,
  spamCount: Number,
  unsubscribeCount: Number,
  sentAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### EmailTracking Collection
```javascript
{
  _id: ObjectId,
  campaignId: ObjectId (ref: Campaign),
  campaignToken: String,
  leadId: ObjectId (ref: Lead),
  email: String,
  status: 'queued' | 'sent' | 'opened' | 'clicked' | 'bounced' | 'failed',
  sentAt: Date,
  openedAt: Date,
  clickedAt: Date,
  openCount: Number,
  clickCount: Number,
  clickedLinks: Array,
  failureReason: String,
  ipAddress: String,
  userAgent: String,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user

### Leads
- `POST /api/leads/upload-csv` - Upload CSV file
- `GET /api/leads` - Get all leads
- `PUT /api/leads/:leadId` - Update lead
- `DELETE /api/leads/:leadId` - Delete lead

### Campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns` - Get all campaigns
- `GET /api/campaigns/:token` - Get campaign by token
- `PUT /api/campaigns/:campaignId` - Update campaign
- `DELETE /api/campaigns/:campaignId` - Delete campaign

### Email
- `POST /api/email/send` - Send campaign
- `GET /api/email/status/:campaignToken` - Get campaign status
- `GET /api/email/test-connection` - Test SMTP connection

### Tracking
- `GET /api/track/open/:campaignToken` - Track email open
- `GET /api/track/click/:campaignToken` - Track link click
- `GET /api/track/analytics/:campaignToken` - Get analytics
- `GET /api/track/unsubscribe/:campaignToken` - Handle unsubscribe

### Settings
- `GET /api/settings/smtp` - Get SMTP settings
- `PUT /api/settings/smtp` - Update SMTP settings

### Stats
- `GET /api/stats/dashboard` - Get dashboard statistics

## Error Handling

### Common Errors

1. **SMTP Not Configured**
   - Error: "SMTP settings are not configured"
   - Solution: Go to Settings and configure SMTP

2. **Invalid Credentials**
   - Error: "Invalid credentials"
   - Solution: Check Gmail App Password

3. **No Active Leads**
   - Error: "No active leads to send to"
   - Solution: Upload leads first

4. **Campaign Already Sent**
   - Error: "Campaign is already sending or has been sent"
   - Solution: Create a new campaign

5. **Database Connection Failed**
   - Error: "MongoDB connection error"
   - Solution: Check MONGODB_URI in .env.local

## Security Features

1. **JWT Authentication** - All protected routes require valid token
2. **Password Hashing** - bcrypt with salt rounds
3. **CORS Protection** - Only frontend origin allowed
4. **Rate Limiting** - Prevent abuse
5. **Input Validation** - express-validator on all inputs
6. **Helmet** - Security headers
7. **User Isolation** - Users can only access their own data

## Performance Optimizations

1. **Database Indexes** - On frequently queried fields
2. **Async Operations** - Non-blocking email sending
3. **Connection Pooling** - MongoDB connection reuse
4. **Rate Limiting** - Prevent server overload
5. **Lazy Loading** - Frontend components load on demand

## Monitoring & Logging

- Console logs for all major operations
- Error tracking in try-catch blocks
- Campaign status updates in real-time
- Email sending progress logs
- SMTP connection verification

## Testing Checklist

- [ ] User signup and login
- [ ] SMTP configuration and test
- [ ] CSV upload with valid data
- [ ] Campaign creation with attachments
- [ ] Email sending to test leads
- [ ] Open tracking (check tracking pixel)
- [ ] Click tracking (check link redirects)
- [ ] Unsubscribe functionality
- [ ] Analytics dashboard display
- [ ] Error handling for invalid inputs
