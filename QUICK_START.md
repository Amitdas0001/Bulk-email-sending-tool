# Quick Start Guide - 5 Minutes Setup

## 1. Install Dependencies (1 min)
```bash
npm install
```

## 2. Configure Gmail (2 min)

### Get Gmail App Password:
1. Visit: https://myaccount.google.com/apppasswords
2. Create app password for "Mail"
3. Copy the 16-character code

### Update `.env.local`:
```env
GMAIL_USER=your.email@gmail.com
GMAIL_APP_PASSWORD=abcdabcdabcdabcd
```

## 3. Start Application (1 min)
```bash
npm run dev:all
```

Wait for:
```
✅ Backend server running on http://localhost:3001
✅ Next.js ready on http://localhost:3000
```

## 4. First Login (1 min)

1. Open: http://localhost:3000
2. Click "Sign Up"
3. Create account
4. Go to **Settings** tab
5. Enter SMTP details:
   - Host: `smtp.gmail.com`
   - Port: `587`
   - User: Your Gmail
   - Password: Your App Password
6. Click "Test Connection" ✅

## 5. Send First Campaign (2 min)

### Upload Test Leads:
1. Go to **Upload Leads**
2. Create `test.csv`:
```csv
name,email,company_name
Test User,your.test@email.com,Test Co
```
3. Upload file

### Create Campaign:
1. Go to **Create Campaign**
2. Name: "Test Campaign"
3. Subject: "Hello {{name}}"
4. Content: "Hi {{name}}, this is a test email!"
5. Click "Create"

### Send:
1. Go to **Send Emails**
2. Select "Test Campaign"
3. Click "Send Campaign"
4. Check your email! 📧

### Track Results:
1. Go to **Track Campaign**
2. Select "Test Campaign"
3. View analytics 📊

## Troubleshooting

### Backend won't start?
```bash
# Check if port 3001 is free
netstat -ano | findstr :3001

# If occupied, kill the process or change PORT in .env.local
```

### Emails not sending?
- Verify Gmail App Password (no spaces)
- Check 2-Step Verification is enabled
- Test connection in Settings
- Check backend console for errors

### Frontend can't connect?
- Ensure backend is running
- Check `NEXT_PUBLIC_API_URL=http://localhost:3001` in `.env.local`
- Clear browser cache

## What's Next?

- Upload real leads from CSV
- Create professional email templates
- Monitor campaign analytics
- Scale to 500 emails/day (Gmail limit)

## Production Deployment

See `SETUP_GUIDE.md` for detailed production deployment instructions.

---

**Need Help?** Check `WORKFLOW.md` for complete system documentation.
