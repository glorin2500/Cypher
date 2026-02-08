# Vercel Deployment Guide for Cypher App

## Quick Deploy (Recommended)

### Option 1: Deploy via Vercel Dashboard

1. **Go to Vercel**: https://vercel.com
2. **Sign in** with your GitHub account
3. **Click "Add New Project"**
4. **Import your repository**: `glorin2500/Cypher`
5. **Configure Project**:
   - Framework Preset: **Next.js**
   - Root Directory: `./` (leave as default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
6. **Click "Deploy"**

That's it! Vercel will automatically build and deploy your app.

---

## Option 2: Deploy via Vercel CLI

### Install Vercel CLI
```bash
npm install -g vercel
```

### Login to Vercel
```bash
vercel login
```

### Deploy
```bash
cd c:\Users\Glorin\.gemini\antigravity\scratch\CYPHERR
vercel --prod
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N** (first time) or **Y** (subsequent)
- Project name: **cypher** (or your preferred name)
- Directory: **./`** (press Enter)
- Override settings? **N**

---

## Important Notes

### ⚠️ Backend Deployment

**Your FastAPI backend is NOT included in this deployment!**

The Vercel deployment only includes the **Next.js frontend**. You need to deploy the backend separately.

### Backend Deployment Options:

#### Option A: Railway (Recommended)
```bash
cd backend
railway login
railway init
railway up
```

Then update your frontend API URLs to point to Railway:
- In `lib/scanner-api.ts`, change `http://localhost:8000` to your Railway URL

#### Option B: Render
1. Go to https://render.com
2. Create new "Web Service"
3. Connect your GitHub repo
4. Set:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

#### Option C: Vercel Serverless Functions (Advanced)
Convert your FastAPI backend to Vercel serverless functions (requires refactoring)

---

## Environment Variables

If you add environment variables later, set them in Vercel:

1. Go to your project in Vercel Dashboard
2. Settings → Environment Variables
3. Add variables like:
   - `NEXT_PUBLIC_API_URL` = your backend URL
   - `NEXT_PUBLIC_ENV` = production

---

## Custom Domain (Optional)

1. Go to your project in Vercel
2. Settings → Domains
3. Add your custom domain
4. Follow DNS configuration instructions

---

## Automatic Deployments

Vercel automatically deploys when you push to GitHub:
- **Push to `main`** → Production deployment
- **Push to other branches** → Preview deployment

---

## Deployment Status

After deployment, you'll get:
- **Production URL**: `https://cypher-xxx.vercel.app`
- **Preview URLs**: For each branch/PR

---

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure `package.json` has correct scripts
- Verify all dependencies are in `package.json`

### App Doesn't Work
- Check browser console for errors
- Verify API endpoints are accessible
- Check environment variables

### ML Model Issues
- ML model files are included in the deployment
- Backend needs to be deployed separately for ML predictions to work

---

## Next Steps After Deployment

1. ✅ Deploy backend to Railway/Render
2. ✅ Update API URLs in frontend code
3. ✅ Test all features on production
4. ✅ Set up custom domain (optional)
5. ✅ Configure analytics (optional)

---

## Your Deployment URLs

**Frontend (Vercel)**: Will be provided after deployment
**Backend**: Deploy separately and update here

---

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console
3. Verify backend is running
4. Test API endpoints directly
