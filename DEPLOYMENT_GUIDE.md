# INHOZ Hospital Management System - Deployment Guide

Complete guide to deploy Backend on Render and Frontend on Vercel.

---

## 🚀 Part 1: Deploy Backend to Render

### Prerequisites
- GitHub repository pushed (✅ Done)
- MongoDB Atlas database (create one if not already)
- Render account (free tier available)

### Step 1: Prepare Backend Environment Variables

Create a list of environment variables you'll need:

```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/inhoz?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

### Step 2: Create Render Web Service

1. **Go to Render Dashboard**
   - Visit: https://render.com
   - Sign up or login with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `yogi-68/INHOZ_WEB`
   - Give it permission to access the repo

3. **Configure Web Service**
   ```
   Name: inhoz-backend
   Region: Oregon (US West) or closest to you
   Branch: master
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: node src/server.js
   Instance Type: Free (or upgrade for production)
   ```

4. **Add Environment Variables**
   - Click "Environment" tab
   - Add all variables from Step 1 above
   - **Important**: Set `CORS_ORIGIN` to `*` temporarily (we'll update after deploying frontend)

5. **Advanced Settings**
   - Auto-Deploy: Yes
   - Health Check Path: `/api/v1/health` (optional)

6. **Deploy**
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment
   - Copy your backend URL: `https://inhoz-backend.onrender.com`

### Step 3: Test Backend Deployment

Open in browser:
```
https://inhoz-backend.onrender.com/api/v1/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "INHOZ API",
  "timestamp": "2025-11-28T..."
}
```

---

## 🎨 Part 2: Deploy Frontend to Vercel

### Step 1: Prepare Frontend for Deployment

1. **Update API URL**
   - The `.env` file in `INHOZ_WEB` should point to your Render backend
   - Create/update `.env.production`:

```bash
cd INHOZ_WEB
```

Create `.env.production`:
```env
VITE_API_URL=https://inhoz-backend.onrender.com/api/v1
```

2. **Commit the changes**:
```bash
git add .env.production
git commit -m "Add production environment config"
git push origin main
```

### Step 2: Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended for first-time)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com
   - Sign up or login with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Select your GitHub repository: `yogi-68/INHOZ_WEB`
   - Click "Import"

3. **Configure Project**
   ```
   Framework Preset: Vite
   Root Directory: ./ (or INHOZ_WEB if it's a submodule)
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Environment Variables**
   - Click "Environment Variables"
   - Add:
     ```
     VITE_API_URL = https://inhoz-backend.onrender.com/api/v1
     ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Copy your frontend URL: `https://inhoz-web.vercel.app`

#### Option B: Via Vercel CLI (Faster for experienced users)

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend directory
cd INHOZ_WEB

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name? inhoz-web
# - Directory? ./
# - Override settings? N

# Add environment variable
vercel env add VITE_API_URL production
# Enter: https://inhoz-backend.onrender.com/api/v1
```

### Step 3: Update Backend CORS

1. **Go back to Render Dashboard**
   - Open your backend service
   - Click "Environment" tab
   - Update `CORS_ORIGIN`:
     ```
     CORS_ORIGIN=https://inhoz-web.vercel.app
     ```
   - Click "Save Changes"
   - Service will auto-redeploy

---

## 🔄 Part 3: Connect Mobile App to Deployed Backend

### Update Mobile App API Configuration

1. **Edit Mobile App Config**:
```bash
cd inhoz-app
```

2. **Update API URL in `app/utils/api.js`**:
```javascript
// Change this line:
const API_BASE_URL = 'https://inhoz-backend.onrender.com/api/v1';

// Or use environment-based config:
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3001/api/v1'  // Local development
  : 'https://inhoz-backend.onrender.com/api/v1';  // Production
```

3. **Update Socket.IO URL in `app/utils/socket.js`**:
```javascript
const SOCKET_URL = __DEV__
  ? 'http://localhost:3001'
  : 'https://inhoz-backend.onrender.com';
```

4. **Test Mobile App**:
```bash
npx expo start
```

---

## ✅ Part 4: Verify Full Deployment

### Test Checklist:

#### Backend (Render)
- [ ] Health endpoint: `https://inhoz-backend.onrender.com/api/v1/health`
- [ ] Login endpoint: POST to `/api/v1/auth/login`
- [ ] Socket.IO connection working
- [ ] MongoDB connection successful (check Render logs)

#### Frontend (Vercel)
- [ ] Website loads: `https://inhoz-web.vercel.app`
- [ ] Login page displays correctly
- [ ] Can login with test credentials
- [ ] Dashboard loads after login
- [ ] Real-time updates work (Socket.IO)

#### Mobile App
- [ ] Connects to production API
- [ ] Login works
- [ ] Dashboards load data
- [ ] Real-time updates work

---

## 🔧 Troubleshooting

### Common Issues:

#### 1. **Backend: "Cannot connect to MongoDB"**
**Solution**: 
- Check MongoDB Atlas whitelist (allow all IPs: `0.0.0.0/0` for Render)
- Verify `MONGODB_URI` in Render environment variables
- Check Render logs: Dashboard → Logs

#### 2. **Frontend: "Network Error" or CORS**
**Solution**:
- Verify `VITE_API_URL` in Vercel environment variables
- Check backend `CORS_ORIGIN` matches frontend URL exactly
- Redeploy both if needed

#### 3. **Backend: Cold Start Delay**
**Render Free Tier**: Services sleep after 15 minutes of inactivity
- First request takes 30-60 seconds to wake up
- **Solution**: Upgrade to paid tier ($7/month) for always-on service

#### 4. **Frontend: Environment Variables Not Working**
**Solution**:
- Ensure variables start with `VITE_` prefix
- Redeploy after adding environment variables
- Check Vercel dashboard → Settings → Environment Variables

#### 5. **Socket.IO Not Connecting**
**Solution**:
- Enable WebSocket support in Render (enabled by default)
- Check CORS settings include frontend URL
- Verify Socket.IO client uses correct URL

---

## 📊 Monitoring & Logs

### Render (Backend)
- **Logs**: Dashboard → Your Service → Logs
- **Metrics**: Dashboard → Metrics tab
- **Health Checks**: Configure under Settings

### Vercel (Frontend)
- **Deployments**: Dashboard → Deployments
- **Logs**: Click on any deployment → View Function Logs
- **Analytics**: Dashboard → Analytics (paid feature)

---

## 🔄 Continuous Deployment

Both platforms support auto-deployment:

### Render
- Automatically deploys on push to `master` branch
- Configure: Settings → Auto-Deploy: Yes

### Vercel
- Automatically deploys on push to `main` branch
- Configure: Settings → Git → Production Branch

### Workflow:
1. Make changes locally
2. Commit and push to GitHub
3. Render and Vercel auto-deploy
4. Check deployment status in dashboards

---

## 💰 Cost Breakdown

### Free Tier (Perfect for Testing)
- **Render**: Free (750 hours/month, sleeps after 15 min inactivity)
- **Vercel**: Free (100GB bandwidth, unlimited deployments)
- **MongoDB Atlas**: Free (512MB storage, shared cluster)
- **Total**: $0/month

### Production Tier (Recommended)
- **Render**: $7/month (always-on, 512MB RAM)
- **Vercel**: Free or $20/month (Pro tier for team features)
- **MongoDB Atlas**: $9/month (shared M2 cluster, 2GB)
- **Total**: ~$16-36/month

---

## 🎯 Quick Start Commands

### Deploy Backend to Render
```bash
# Already done via dashboard, but for updates:
git add .
git commit -m "Update backend"
git push origin master
# Render auto-deploys
```

### Deploy Frontend to Vercel
```bash
cd INHOZ_WEB
vercel --prod
# Or push to GitHub, Vercel auto-deploys
```

### Update Mobile App Config
```bash
cd inhoz-app
# Edit app/utils/api.js and app/utils/socket.js
# Then test:
npx expo start
```

---

## 🔐 Security Best Practices

1. **Change JWT Secrets**: Use strong random strings (32+ characters)
2. **Update MongoDB Password**: Use strong password in Atlas
3. **Enable HTTPS**: Both Render and Vercel provide free SSL
4. **Restrict CORS**: Set `CORS_ORIGIN` to your exact frontend URL
5. **Environment Variables**: Never commit `.env` files to GitHub
6. **API Rate Limiting**: Implement rate limiting for production
7. **MongoDB IP Whitelist**: Restrict to Render IPs if possible

---

## 📞 Support & Resources

### Documentation
- **Render**: https://render.com/docs
- **Vercel**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com

### Getting Help
- **Render Support**: https://render.com/support
- **Vercel Support**: https://vercel.com/support
- **Community**: Stack Overflow with tags [render], [vercel], [mongodb-atlas]

---

## ✨ Success!

Once deployed, your URLs will be:
- **Backend API**: `https://inhoz-backend.onrender.com`
- **Web Frontend**: `https://inhoz-web.vercel.app`
- **Mobile App**: Connect to production backend

**Test Credentials**:
- Admin: `admin@inhoz.com` / `admin123`
- Doctor: `dr.smith@inhoz.com` / `doctor123`
- Patient: `john.doe@inhoz.com` / `patient123`

---

## 🚀 Next Steps After Deployment

1. **Custom Domain**: Add your own domain in Vercel/Render settings
2. **Monitoring**: Set up uptime monitoring (UptimeRobot, Pingdom)
3. **Backups**: Configure MongoDB Atlas automatic backups
4. **Analytics**: Add Google Analytics or Mixpanel
5. **Mobile App Stores**: Build and submit to App Store/Play Store

---

**Need help?** Check the troubleshooting section or review platform logs!
