# 🚀 Quick Deploy Commands

## Before Deploying - Commit Your Changes

```bash
git add .
git commit -m "Fix Vercel deployment issues"
git push origin main
```

## Deploy Frontend to Vercel

1. Go to: https://vercel.com/new
2. Import your GitHub repository
3. Click "Deploy" (no config needed, vercel.json handles it)
4. After deployment, go to Settings → Environment Variables
5. Add: `NEXT_PUBLIC_API_URL` = `https://your-backend-url`
6. Redeploy

## Deploy Backend to Railway

1. Go to: https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select your repository
4. Add environment variables:
   - MONGODB_URI
   - JWT_SECRET
   - GMAIL_USER
   - GMAIL_APP_PASSWORD
   - PORT=3001
   - NODE_ENV=production
   - FRONTEND_URL (add after Vercel deployment)
5. Click Deploy

## Test Your Deployment

```bash
# Test backend health
curl https://your-backend.railway.app/health

# Test frontend
# Visit: https://your-app.vercel.app
```

## If Something Goes Wrong

1. Check Vercel build logs
2. Check Railway/Render deployment logs
3. Verify environment variables are set correctly
4. Check DEPLOYMENT_GUIDE.md for troubleshooting

## Local Development (Still Works!)

```bash
# Run both frontend and backend
npm run dev:all

# Or run separately
npm run dev:frontend  # Port 3000
npm run dev:backend   # Port 3001
```

---

**That's it! Your deployment is ready! 🎉**
