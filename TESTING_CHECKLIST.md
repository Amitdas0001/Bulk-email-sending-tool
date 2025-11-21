# Testing Checklist - Email Marketing Tool

## Pre-Testing Setup

- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` configured with actual credentials
- [ ] MongoDB connection string valid
- [ ] Gmail App Password generated
- [ ] Both servers running (`npm run dev:all`)

## 1. Backend Health Check

```bash
# Test backend is running
curl http://localhost:3001/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-XX-XXTXX:XX:XX.XXXZ"
}
```

- [ ] Backend responds with 200 OK
- [ ] Health endpoint returns status

## 2. Authentication Tests

### Sign Up
- [ ] Navigate to http://localhost:3000
- [ ] Click "Sign Up" tab
- [ ] Fill in:
  - First Name: Test
  - Last Name: User
  - Email: test@example.com
  - Password: Test123!
- [ ] Click "Sign Up"
- [ ] Redirected to dashboard
- [ ] User info displayed in sidebar

### Login
- [ ] Logout from dashboard
- [ ] Click "Login" tab
- [ ] Enter credentials
- [ ] Click "Login"
- [ ] Successfully logged in

### Token Persistence
- [ ] Refresh page
- [ ] Still logged in
- [ ] User data persists

## 3. SMTP Configuration Tests

### Configure SMTP
- [ ] Go to **Settings** tab
- [ ] Enter SMTP details:
  ```
  Host: smtp.gmail.com
  Port: 587
  User: your.email@gmail.com
  Password: your16charapppassword
  ```
- [ ] Click "Save Settings"
- [ ] Success message displayed

### Test Connection
- [ ] Click "Test Connection" button
- [ ] Wait for response
- [ ] Success message: "Connection successful!"
- [ ] Check backend console for verification log

**If Test Fails:**
- [ ] Verify Gmail App Password is correct
- [ ] Check 2-Step Verification is enabled
- [ ] Ensure no spaces in password
- [ ] Check backend console for error details

## 4. Lead Management Tests

### Upload CSV
- [ ] Create test CSV file:
```csv
name,email,company_name
John Doe,john@test.com,Acme Corp
Jane Smith,jane@test.com,Tech Inc
Bob Wilson,bob@test.com,StartupXYZ
```
- [ ] Go to **Upload Leads** tab
- [ ] Click "Choose File"
- [ ] Select CSV file
- [ ] Click "Upload CSV"
- [ ] Success message: "X leads imported successfully"

### View Leads
- [ ] Go to **Manage Leads** tab
- [ ] All uploaded leads displayed
- [ ] Correct names, emails, companies shown
- [ ] Status shows "active"

### Edit Lead
- [ ] Click "Edit" on a lead
- [ ] Change name/email/company
- [ ] Click "Save"
- [ ] Changes reflected in list

### Delete Lead
- [ ] Click "Delete" on a lead
- [ ] Confirm deletion
- [ ] Lead removed from list

### Duplicate Detection
- [ ] Upload same CSV again
- [ ] Error message about duplicates
- [ ] No duplicate leads created

## 5. Campaign Creation Tests

### Create Basic Campaign
- [ ] Go to **Create Campaign** tab
- [ ] Enter:
  - Campaign Name: "Test Campaign"
  - Subject: "Hello {{name}}"
  - Email Content: "Hi {{name}}, this is a test from {{company_name}}!"
- [ ] Click "Create Campaign"
- [ ] Success message displayed

### Create Campaign with HTML
- [ ] Create new campaign
- [ ] Use HTML content:
```html
<h1>Hello {{name}}!</h1>
<p>Welcome to our newsletter.</p>
<a href="https://example.com">Visit our website</a>
```
- [ ] Click "Create Campaign"
- [ ] Campaign created successfully

### Create Campaign with Attachments
- [ ] Create new campaign
- [ ] Add 1-2 file attachments
- [ ] Click "Create Campaign"
- [ ] Files uploaded successfully

### View Campaigns
- [ ] All created campaigns listed
- [ ] Campaign details visible
- [ ] Status shows "draft"

## 6. Email Sending Tests

### Send Test Campaign
- [ ] Go to **Send Emails** tab
- [ ] Select "Test Campaign" from dropdown
- [ ] Campaign details displayed
- [ ] Click "Send Campaign"
- [ ] Success message: "Campaign sending initiated"
- [ ] Status changes to "sending"

### Monitor Sending Progress
- [ ] Check backend console
- [ ] See logs: "Sending X/Y to email@example.com"
- [ ] See success/failure indicators
- [ ] Wait for completion (3 seconds per email)
- [ ] Final log: "Finished campaign"

### Verify Email Received
- [ ] Check recipient inbox
- [ ] Email received
- [ ] Subject line correct
- [ ] Personalization tokens replaced
- [ ] Content displays properly
- [ ] Attachments included (if any)

### Check Campaign Status
- [ ] Refresh Send Emails page
- [ ] Campaign status: "sent"
- [ ] Sent count matches lead count

## 7. Tracking Tests

### Email Open Tracking
- [ ] Open received email
- [ ] Wait 2-3 seconds
- [ ] Go to **Track Campaign** tab
- [ ] Select campaign
- [ ] Open count incremented
- [ ] Timeline shows open event

### Link Click Tracking
- [ ] Click link in email
- [ ] Redirected to correct URL
- [ ] Go to **Track Campaign** tab
- [ ] Click count incremented
- [ ] Timeline shows click event
- [ ] Clicked URL displayed

### Multiple Opens
- [ ] Open email again
- [ ] Check tracking
- [ ] Open count incremented again
- [ ] Multiple open events in timeline

### Analytics Metrics
- [ ] Go to **Track Campaign** tab
- [ ] Select campaign
- [ ] Verify metrics:
  - Total Recipients
  - Sent Count
  - Open Rate (%)
  - Click Rate (%)
  - Timeline events

## 8. Dashboard Tests

### Dashboard Stats
- [ ] Go to **Dashboard** tab
- [ ] Stats displayed:
  - Total Campaigns
  - Total Leads
  - Emails Sent
  - Average Open Rate
- [ ] Numbers match actual data

### Recent Activity
- [ ] Recent campaigns listed
- [ ] Campaign stats visible
- [ ] Quick actions available

## 9. Error Handling Tests

### Send Without SMTP
- [ ] Create new user account
- [ ] Don't configure SMTP
- [ ] Try to send campaign
- [ ] Error: "SMTP settings are not configured"

### Send Without Leads
- [ ] Delete all leads
- [ ] Try to send campaign
- [ ] Error: "No active leads to send to"

### Invalid CSV Upload
- [ ] Upload CSV without required columns
- [ ] Error message displayed
- [ ] No leads imported

### Send Already Sent Campaign
- [ ] Try to send same campaign again
- [ ] Error: "Campaign is already sending or has been sent"

## 10. Security Tests

### Protected Routes
- [ ] Logout
- [ ] Try to access: http://localhost:3001/api/leads
- [ ] 401 Unauthorized error

### User Isolation
- [ ] Create second user account
- [ ] Upload different leads
- [ ] Verify first user can't see second user's leads
- [ ] Verify campaigns are isolated

### Token Expiration
- [ ] Wait 7 days (or modify JWT_EXPIRES_IN)
- [ ] Try to access protected route
- [ ] Token expired, redirected to login

## 11. Performance Tests

### Bulk Email Sending
- [ ] Upload 50+ leads
- [ ] Send campaign
- [ ] Monitor backend console
- [ ] Verify 3-second delay between emails
- [ ] All emails sent successfully
- [ ] No memory leaks

### Large CSV Upload
- [ ] Create CSV with 100+ leads
- [ ] Upload file
- [ ] All leads imported
- [ ] No timeout errors

### Concurrent Users
- [ ] Open 2 browser windows
- [ ] Login as different users
- [ ] Both can send campaigns simultaneously
- [ ] No conflicts

## 12. Edge Cases

### Special Characters in Email
- [ ] Create lead with special chars in name: "José García"
- [ ] Send campaign
- [ ] Name displays correctly in email

### Long Email Content
- [ ] Create campaign with 1000+ words
- [ ] Send email
- [ ] Content not truncated

### No Company Name
- [ ] Upload lead without company_name
- [ ] Send campaign with {{company_name}} token
- [ ] Token replaced with empty string (no error)

### Unsubscribe
- [ ] Add unsubscribe link to campaign:
```html
<a href="http://localhost:3001/api/track/unsubscribe/{{campaignToken}}?lead={{leadId}}">Unsubscribe</a>
```
- [ ] Send campaign
- [ ] Click unsubscribe link
- [ ] Confirmation page displayed
- [ ] Lead status changed to "unsubscribed"
- [ ] Lead not included in future campaigns

## Test Results Summary

### Passed Tests: _____ / _____

### Failed Tests:
1. 
2. 
3. 

### Issues Found:
1. 
2. 
3. 

### Notes:
- 
- 
- 

## Production Readiness Checklist

- [ ] All tests passed
- [ ] No console errors
- [ ] SMTP working reliably
- [ ] Tracking functioning correctly
- [ ] Analytics accurate
- [ ] Error handling robust
- [ ] Security measures in place
- [ ] Performance acceptable
- [ ] Documentation complete
- [ ] Environment variables configured
- [ ] Database backups enabled
- [ ] Monitoring set up
- [ ] Rate limiting tested
- [ ] CORS configured correctly
- [ ] SSL/HTTPS enabled (production)

## Troubleshooting Common Issues

### Backend won't start
```bash
# Check port availability
netstat -ano | findstr :3001

# Check MongoDB connection
# Verify MONGODB_URI in .env.local

# Check logs
npm run dev:backend
```

### Emails not sending
```bash
# Test SMTP connection
# Go to Settings → Test Connection

# Check backend console for errors
# Verify Gmail App Password

# Check Gmail sending limits
# Max 500/day, 20/minute
```

### Tracking not working
```bash
# Verify BACKEND_URL in .env.local
# Check tracking pixel in email source
# Ensure backend is accessible from internet (for production)
```

### Frontend can't connect
```bash
# Verify NEXT_PUBLIC_API_URL in .env.local
# Check CORS settings
# Clear browser cache
```

---

**Testing Date:** ___________  
**Tester Name:** ___________  
**Environment:** Development / Production  
**Version:** ___________
