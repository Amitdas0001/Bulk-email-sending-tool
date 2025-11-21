# 🚀 Vercel Deployment Guide

This guide explains how to deploy your Email Marketing SaaS to production.

## Architecture

This is a **full-stack application** with:
- **Frontend**: Next.js (deploy to Vercel)
- **Backend**: Express.js (deploy to Railway/Render)
- **Database**: MongoDB Atlas (cloud)

## Prerequisites

✅ GitHub account  
✅ Vercel account  
✅ Railway/Render account (for backend)  
✅ MongoDB Atlas account  

---

## Part 1: Deploy Backend (Railway/Render)

### Option A: Railway (Recommended)

1. **Create Railway Project**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Connect your repository
   
2. **Configure Build Settings**
   - **Build Command**: `npm install && npx tsc backend/server.ts --outDir dist`
   - **Start Command**: `node dist/server.js`
   - **Root Directory**: `/`

3. **Set Environment Variables** in Railway dashboard:
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your-secret-key
   GMAIL_USER=your-gmail@gmail.com
   GMAIL_APP_PASSWORD=your-app-password
   PORT=3001
   NODE_ENV=production
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```

4. **Deploy**
   - Railway will auto-deploy
   - Copy the generated URL (e.g., `https://your-app.railway.app`)

### Option B: Render

1. **Create Web Service**
   - Go to [render.com](https://render.com)
   - Click "New" → "Web Service"
   - Connect GitHub repository

2. **Configure**
   - **Build Command**: `npm install && cd backend && npx tsc`
   - **Start Command**: `node backend/dist/server.js`
   - **Environment**: Node

3. **Add Environment Variables** (same as Railway)

4. **Deploy** and copy the URL

---

## Part 2: Deploy Frontend (Vercel)

### Step 1: Prepare MongoDB Atlas

1. **Create MongoDB Cluster**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Create database user
   - Whitelist all IPs (0.0.0.0/0) for serverless
   - Get connection string

### Step 2: Push to GitHub

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 3: Deploy to Vercel

1. **Import Project**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your GitHub repository

2. **Configure Project**
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

3. **Set Environment Variables**
   Click "Environment Variables" and add:
   
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```
   
   ⚠️ **IMPORTANT**: Replace `your-backend.railway.app` with your actual backend URL from Step 1.

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (2-3 minutes)
   - Vercel will give you a URL like `https://your-app.vercel.app`

### Step 4: Update Backend CORS

Go back to your backend (Railway/Render) and update the `FRONTEND_URL` environment variable:

```
FRONTEND_URL=https://your-app.vercel.app
```

Redeploy the backend for changes to take effect.

---

## Part 3: Verify Deployment

1. **Test Frontend**
   - Visit your Vercel URL
   - Check if the homepage loads

2. **Test Backend Connection**
   - Try logging in or signing up
   - Open browser DevTools → Network tab
   - Check if API calls to backend are successful

3. **Test Email Functionality**
   - Upload a CSV
   - Create a campaign
   - Send test emails

---

## Common Issues & Fixes

### ❌ "Failed to connect to backend"
- Check `NEXT_PUBLIC_API_URL` in Vercel
- Verify backend is running (visit `https://your-backend.railway.app/health`)
- Check CORS settings in backend

### ❌ "MongoDB connection failed"
- Verify MongoDB Atlas IP whitelist (should be 0.0.0.0/0)
- Check `MONGODB_URI` format
- Ensure database user has read/write permissions

### ❌ "Build failed on Vercel"
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify `next.config.js` is valid

### ❌ "Emails not sending"
- Verify `GMAIL_USER` and `GMAIL_APP_PASSWORD` in backend
- Check Gmail App Password (not regular password)
- Ensure 2FA is enabled on Gmail account

---

## Environment Variables Checklist

### Backend (Railway/Render)
- [ ] MONGODB_URI
- [ ] JWT_SECRET
- [ ] GMAIL_USER
- [ ] GMAIL_APP_PASSWORD
- [ ] PORT
- [ ] NODE_ENV=production
- [ ] FRONTEND_URL

### Frontend (Vercel)
- [ ] NEXT_PUBLIC_API_URL

---

## Post-Deployment

### Custom Domain (Optional)

**Vercel:**
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

**Railway:**
1. Go to Settings → Networking
2. Add custom domain
3. Update DNS records

### Monitoring

- **Vercel**: Automatic monitoring in dashboard
- **Railway**: Check logs and metrics
- **MongoDB**: Monitor in Atlas dashboard

---

## Development vs Production

### Development
```bash
npm run dev:all  # Runs both frontend and backend locally
```

### Production
- Frontend: Auto-deploys from GitHub → Vercel
- Backend: Auto-deploys from GitHub → Railway/Render

---

## Rollback

If deployment fails:
1. Go to Vercel dashboard → Deployments
2. Find the last working deployment
3. Click "⋯" → "Promote to Production"

---

## Support

- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Next.js Docs: https://nextjs.org/docs

## Fixed Issues in This Deployment

✅ Fixed bcrypt version (was 6.0.0, now 5.1.1)  
✅ Added vercel.json configuration  
✅ Updated next.config.js for production  
✅ Created .vercelignore to exclude backend  
✅ Configured proper environment variables  
✅ Separated frontend/backend deployment  

---

**Your app is now ready to deploy! 🎉**
