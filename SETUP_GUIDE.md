# Email Marketing SaaS - Setup Guide

## Prerequisites

1. **Node.js 18+** installed
2. **MongoDB** (local or MongoDB Atlas account)
3. **Gmail Account** with App Password enabled

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Gmail SMTP

### Enable Gmail App Password:

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (enable if not already)
3. Scroll down to **App passwords**
4. Select app: **Mail**
5. Select device: **Other (Custom name)** → Enter "Email Marketing SaaS"
6. Click **Generate**
7. Copy the 16-character password (remove spaces)

## Step 3: Configure Environment Variables

Update `.env.local` with your actual credentials:

```env
# Database - Use your MongoDB connection string
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/BulkEmail

# JWT Secret - Generate a random string
JWT_SECRET=your_random_secret_key_here_make_it_long_and_secure

# Gmail SMTP - Use your actual Gmail credentials
GMAIL_USER=your.email@gmail.com
GMAIL_APP_PASSWORD=your16charapppassword

# Server URLs
PORT=3001
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001
```

## Step 4: Start the Application

### Option 1: Run Both Servers Together (Recommended)
```bash
npm run dev:all
```

### Option 2: Run Separately
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

## Step 5: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## Step 6: First Time Setup

1. **Create Account**: Go to http://localhost:3000 and sign up
2. **Configure SMTP**: After login, go to **Settings** and enter your SMTP details:
   - Host: `smtp.gmail.com`
   - Port: `587`
   - User: Your Gmail address
   - Password: Your Gmail App Password

3. **Test Connection**: Click "Test Connection" to verify SMTP settings

## Step 7: Using the Platform

### Upload Leads
1. Go to **Upload Leads**
2. Upload a CSV file with columns: `name`, `email`, `company_name` (optional)
3. Example CSV format:
```csv
name,email,company_name
John Doe,john@example.com,Acme Corp
Jane Smith,jane@example.com,Tech Inc
```

### Create Campaign
1. Go to **Create Campaign**
2. Enter campaign name and subject
3. Write your email content (supports HTML)
4. Use personalization tokens: `{{name}}`, `{{email}}`, `{{company_name}}`
5. Add attachments if needed
6. Click **Create Campaign**

### Send Campaign
1. Go to **Send Emails**
2. Select a campaign from the dropdown
3. Click **Send Campaign**
4. Monitor progress in real-time

### Track Results
1. Go to **Track Campaign**
2. Select a campaign to view analytics:
   - Open rates
   - Click rates
   - Bounce rates
   - Timeline of events

## Troubleshooting

### Backend won't start
- Check if MongoDB connection string is correct
- Verify port 3001 is not in use: `netstat -ano | findstr :3001`
- Check backend logs for errors

### Emails not sending
- Verify SMTP settings in Settings page
- Test connection using "Test Connection" button
- Check Gmail App Password is correct (no spaces)
- Ensure 2-Step Verification is enabled on Gmail
- Check backend console for error messages

### Frontend can't connect to backend
- Verify backend is running on port 3001
- Check CORS settings in `.env.local`
- Clear browser cache and cookies

### Database connection issues
- Verify MongoDB URI is correct
- Check network connectivity
- For MongoDB Atlas: Whitelist your IP address

## Rate Limits

- **Gmail SMTP**: 500 emails per day, 20 per minute
- The system automatically adds 3-second delays between emails
- Monitor your Gmail sending limits

## Production Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Backend (Railway/Render)
1. Create new project
2. Connect GitHub repository
3. Set environment variables
4. Deploy
5. Update `BACKEND_URL` in frontend environment

### Database (MongoDB Atlas)
1. Create cluster
2. Create database user
3. Whitelist IP addresses (0.0.0.0/0 for all)
4. Get connection string
5. Update `MONGODB_URI`

## Security Notes

- Never commit `.env.local` to version control
- Use strong JWT secrets in production
- Enable MongoDB authentication
- Use HTTPS in production
- Regularly rotate SMTP credentials
- Monitor for suspicious activity

## Support

For issues or questions:
1. Check backend console logs
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly
4. Test SMTP connection in Settings page
