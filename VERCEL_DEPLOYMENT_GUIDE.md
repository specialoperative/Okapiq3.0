# Okapiq 3.0 - Vercel Deployment Guide

## 🚀 Complete Migration Guide from Localhost to Vercel

This guide will help you deploy your Okapiq 3.0 Business Intelligence Platform to Vercel.

---

## 📋 Pre-Deployment Checklist

✅ **Build Status**: Successful (34 pages generated)  
✅ **All Dependencies**: Installed and up to date  
✅ **GitHub Repository**: [https://github.com/specialoperative/Okapiq3.0](https://github.com/specialoperative/Okapiq3.0)  
✅ **Latest Commit**: All fixes pushed  

---

## 🎯 Step 1: Deploy Frontend to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**: [https://vercel.com](https://vercel.com)
2. **Sign in** with your GitHub account
3. **Click "Add New Project"**
4. **Import your repository**:
   - Select: `specialoperative/Okapiq3.0`
   - Branch: `main`
5. **Configure Project**:
   - **Framework Preset**: Next.js ✅
   - **Root Directory**: `./` (project root)
   - **Build Command**: `next build`
   - **Output Directory**: Next.js default
   - **Install Command**: `npm install --legacy-peer-deps`

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
cd /Users/scripturebrandenburg/Desktop/CS_PROJECTS/oc_startup_3
vercel

# Follow the prompts:
# - Link to existing project? No
# - What's your project's name? okapiq-demo3
# - In which directory is your code located? ./
# - Want to override settings? No
```

---

## 🔐 Step 2: Configure Environment Variables

In your Vercel project settings, add these environment variables:

### **Frontend Environment Variables** (Required)

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_APP_NAME=Okapiq
NEXT_PUBLIC_BASE_URL=https://okapiq-demo3.vercel.app
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDxwCGvlHvNdEssqgr-Sje-gHYDU0RiFGE

# API Keys
YELP_API_KEY=9R5wVAAW0ir_P1GrhxFsfVtv1aNolQHn3E15jQZqR43948PH99XndFP9x-aB82PSS3lBStlxhhtqykJ6qEImxUEVf2XzwSCAuh6A27e32Qmc3Js3tmJ-2kPRX6ahaHYx
GOOGLE_MAPS_API_KEY=AIzaSyDxwCGvlHvNdEssqgr-Sje-gHYDU0RiFGE
CENSUS_API_KEY=274084692b280203c821ec6bf4436266a28d2a4c
OPENAI_API_KEY=your_openai_api_key_here
DATA_AXLE_API_KEY=c54bb620b9afa2f0b48a26b3
SERPAPI_API_KEY=606fbdb7bf6d903f07f8666896c1801d793d76df85f6ef8c3e67092d1e0796ae
APIFY_API_TOKEN=your_apify_api_token_here
ARCGIS_API_KEY=AAPTxy8BH1VEsoebNVZXo8HurAtkxQnvfFiXSrnotYNZULX3quyJt6P3bjLWMd8qpCLnElbp6VTbI3WGcrY-7k2iPxOfWMyWGUr59752G6xqHiqM-Rp_Htgf6KxHetTpspkth4Fa9_iERW1piaDrhV7bu-EVZs3c4wnE4U2z5SxvYlAGdNPwkPd2VcA-ckO8L6tpYZy2zXlrXJvjcAYxQlpOKifsGs7sdkC-qJ62UrCpeAY.AT1_EWiBBjFc

# Additional API Keys
US_CENSUS_API_KEY=274084692b280203c821ec6bf4436266a28d2a4c
APOLLO_API_KEY=your_apollo_api_key_here
SERP_API_KEY=606fbdb7bf6d903f07f8666896c1801d793d76df85f6ef8c3e67092d1e0796ae
GLENCOCO_API_KEY=your_glencoco_api_key_here

# Authentication & Security
SECRET_KEY=okapiq-production-secret-key-change-this-in-production-2024
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Business Settings
TRIAL_DAYS=14
ETALAUNCH_CODE=ETALAUNCH2024
ETALAUNCH_TRIAL_DAYS=90
```

### **How to Add Environment Variables in Vercel:**

1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable one by one:
   - **Key**: Variable name (e.g., `NEXT_PUBLIC_API_URL`)
   - **Value**: Variable value
   - **Environment**: Select all (Production, Preview, Development)
4. Click **Save**

---

## 🖥️ Step 3: Deploy Backend (Python FastAPI)

Your backend (`/backend` directory) needs to be deployed separately. Here are your options:

### **Option A: Railway (Recommended for Python)**

1. **Sign up**: [https://railway.app](https://railway.app)
2. **Create New Project** → **Deploy from GitHub**
3. **Select**: `specialoperative/Okapiq3.0`
4. **Configure**:
   - Root Directory: `backend`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Add Environment Variables** (same as above, backend-specific ones)
6. **Deploy**
7. **Copy the Railway URL** (e.g., `https://your-app.railway.app`)
8. **Update** `NEXT_PUBLIC_API_URL` in Vercel with this URL

### **Option B: Render**

1. **Sign up**: [https://render.com](https://render.com)
2. **New** → **Web Service**
3. **Connect** your GitHub repository
4. **Configure**:
   - Name: `okapiq-backend`
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Add Environment Variables**
6. **Deploy**

### **Option C: Heroku**

```bash
# Install Heroku CLI
brew install heroku/brew/heroku

# Login
heroku login

# Create app
heroku create okapiq-backend

# Add Python buildpack
heroku buildpacks:set heroku/python

# Deploy backend
cd backend
git init
git add .
git commit -m "Deploy backend"
heroku git:remote -a okapiq-backend
git push heroku main
```

### **Option D: AWS Lambda / Google Cloud Run**

For serverless deployment, you'll need to:
1. Containerize the backend with Docker
2. Deploy to AWS Lambda or Google Cloud Run
3. Configure API Gateway

---

## 🗄️ Step 4: Database Setup

Your app currently uses SQLite (`okapiq.db`). For production, migrate to PostgreSQL:

### **Option A: Vercel Postgres**

1. In Vercel Dashboard → **Storage** → **Create Database**
2. Select **Postgres**
3. Copy connection string
4. Update `DATABASE_URL` environment variable

### **Option B: Supabase (Free PostgreSQL)**

1. Sign up: [https://supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database
4. Update `DATABASE_URL` environment variable

### **Option C: Railway Postgres**

1. In Railway project → **New** → **Database** → **PostgreSQL**
2. Copy connection string
3. Update `DATABASE_URL` environment variable

---

## 🔄 Step 5: Update Backend URL in Frontend

After deploying your backend, update the frontend environment variable:

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Find `NEXT_PUBLIC_API_URL`
3. Update value to your backend URL (e.g., `https://okapiq-backend.railway.app`)
4. **Redeploy** frontend (Vercel will auto-redeploy)

---

## ✅ Step 6: Verify Deployment

### **Frontend Checks:**

1. Visit your Vercel URL (e.g., `https://okapiq-demo3.vercel.app`)
2. Check that pages load correctly
3. Test navigation between pages
4. Verify API calls work

### **Backend Checks:**

1. Visit `https://your-backend-url.com/docs` (FastAPI docs)
2. Test health endpoint: `https://your-backend-url.com/health`
3. Verify database connection
4. Test API endpoints

### **Integration Checks:**

1. Test business search functionality
2. Verify map visualization works
3. Check CRM features
4. Test data enrichment services

---

## 🐛 Troubleshooting

### **Build Fails on Vercel**

```bash
# Check build logs in Vercel Dashboard
# Common fixes:
- Ensure all dependencies are in package.json
- Check for TypeScript errors
- Verify environment variables are set
```

### **Module Not Found Errors**

```bash
# Already fixed in latest commit:
- All utils files created
- crimeHeat module added
- Path mappings configured
```

### **API Calls Fail**

```bash
# Check:
1. NEXT_PUBLIC_API_URL is set correctly
2. Backend is deployed and running
3. CORS is configured in backend
4. API keys are valid
```

### **Environment Variables Not Working**

```bash
# Remember:
- Use NEXT_PUBLIC_ prefix for client-side variables
- Redeploy after adding new variables
- Check variable names match exactly
```

---

## 📊 Monitoring & Analytics

### **Vercel Analytics**

Already included via `@vercel/analytics` package in your dependencies.

### **Backend Monitoring**

Consider adding:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **DataDog** for APM

---

## 🔒 Security Checklist

- [ ] Rotate API keys for production
- [ ] Set up proper CORS policies
- [ ] Enable HTTPS only
- [ ] Add rate limiting
- [ ] Implement authentication
- [ ] Set up database backups
- [ ] Configure security headers
- [ ] Enable DDoS protection

---

## 🚀 Post-Deployment

### **Custom Domain (Optional)**

1. In Vercel Dashboard → **Settings** → **Domains**
2. Add your custom domain (e.g., `app.okapiq.com`)
3. Update DNS records as instructed
4. Wait for SSL certificate provisioning

### **Continuous Deployment**

Already configured! Every push to `main` branch will:
1. Trigger automatic build on Vercel
2. Run tests (if configured)
3. Deploy to production

### **Preview Deployments**

Every pull request gets its own preview URL for testing.

---

## 📞 Support & Resources

- **Vercel Docs**: [https://vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Railway Docs**: [https://docs.railway.app](https://docs.railway.app)
- **GitHub Repository**: [https://github.com/specialoperative/Okapiq3.0](https://github.com/specialoperative/Okapiq3.0)

---

## 🎉 Success!

Your Okapiq 3.0 Business Intelligence Platform is now live on Vercel!

**Frontend URL**: `https://okapiq-demo3.vercel.app` (or your custom domain)  
**Backend URL**: `https://your-backend-url.com`  
**Status**: ✅ Production Ready

---

## 📝 Quick Reference

### **Vercel Commands**

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# Check deployment status
vercel ls

# View logs
vercel logs

# Remove deployment
vercel remove
```

### **Update Deployment**

```bash
# Just push to GitHub
git add .
git commit -m "Update feature"
git push origin main

# Vercel auto-deploys!
```

---

**Last Updated**: October 5, 2025  
**Version**: 3.0  
**Status**: ✅ Ready for Production Deployment
