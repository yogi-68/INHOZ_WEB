# Quick Deployment Checklist

Follow these steps in order:

## ☑️ Prerequisites (5 minutes)
- [ ] GitHub repository pushed ✅
- [ ] Create MongoDB Atlas account: https://www.mongodb.com/cloud/atlas/register
- [ ] Create Render account: https://render.com (Sign up with GitHub)
- [ ] Create Vercel account: https://vercel.com (Sign up with GitHub)

---

## 🗄️ Step 1: MongoDB Atlas Setup (5 minutes)

1. **Create Cluster**:
   - Click "Build a Database"
   - Choose "Free" (M0)
   - Select region closest to you
   - Cluster name: `inhoz-cluster`
   - Click "Create"

2. **Create Database User**:
   - Security → Database Access → Add New User
   - Username: `inhoz-admin`
   - Password: Generate secure password (save it!)
   - User Privileges: "Read and write to any database"
   - Add User

3. **Whitelist IPs**:
   - Security → Network Access → Add IP Address
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Confirm

4. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy connection string:
   ```
   mongodb+srv://inhoz-admin:<password>@inhoz-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   - Replace `<password>` with your actual password
   - Add database name: `/inhoz` before the `?`
   - Final: `mongodb+srv://inhoz-admin:yourpassword@inhoz-cluster.xxxxx.mongodb.net/inhoz?retryWrites=true&w=majority`

---

## 🔧 Step 2: Deploy Backend to Render (10 minutes)

1. **Go to Render**: https://dashboard.render.com

2. **New Web Service**:
   - Click "New +" → "Web Service"
   - "Connect a repository"
   - Select: `yogi-68/INHOZ_WEB`
   - Click "Connect"

3. **Configure Service**:
   ```
   Name: inhoz-backend
   Region: Oregon (US West)
   Branch: master
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: node src/server.js
   Instance Type: Free
   ```

4. **Add Environment Variables** (Click "Add Environment Variable" for each):
   ```
   NODE_ENV = production
   PORT = 3001
   MONGODB_URI = [paste your MongoDB connection string from Step 1]
   JWT_SECRET = your-super-secret-jwt-key-min-32-chars-change-this
   JWT_REFRESH_SECRET = your-super-secret-refresh-key-min-32-chars-change
   JWT_EXPIRES_IN = 15m
   JWT_REFRESH_EXPIRES_IN = 7d
   CORS_ORIGIN = *
   ```

5. **Create Web Service** (Click button at bottom)
   - Wait 5-10 minutes for deployment
   - Status will change to "Live"
   - **Copy your backend URL**: `https://inhoz-backend.onrender.com` (or similar)

6. **Test Backend**:
   - Open: `https://YOUR-BACKEND-URL.onrender.com/api/v1/health`
   - Should see: `{"status":"ok",...}`

---

## 🎨 Step 3: Deploy Frontend to Vercel (5 minutes)

1. **Go to Vercel**: https://vercel.com/dashboard

2. **Import Project**:
   - Click "Add New..." → "Project"
   - Import Git Repository: `yogi-68/INHOZ_WEB`
   - Click "Import"

3. **Configure Project**:
   ```
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   ```

4. **Add Environment Variable**:
   - Click "Environment Variables" (expand section)
   - Add:
     ```
     Name: VITE_API_URL
     Value: https://YOUR-BACKEND-URL.onrender.com/api/v1
     ```
     (Replace with your actual Render backend URL)

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes
   - **Copy your frontend URL**: `https://inhoz-web.vercel.app` (or similar)

6. **Test Frontend**:
   - Open your Vercel URL
   - Should see login page
   - Try logging in with test credentials:
     - Admin: `admin@inhoz.com` / `admin123`

---

## 🔗 Step 4: Update CORS (2 minutes)

1. **Go back to Render Dashboard**
2. **Select your backend service**
3. **Environment tab**
4. **Edit `CORS_ORIGIN`**:
   - Change from `*` to your Vercel URL: `https://YOUR-FRONTEND-URL.vercel.app`
5. **Save Changes**
   - Service will auto-redeploy (1-2 minutes)

---

## 📱 Step 5: Configure Mobile App (Optional - 3 minutes)

If you want to connect mobile app to production:

1. **Edit API URL**:
```bash
cd inhoz-app
# Edit app/utils/api.js
# Change line 2 to:
const API_BASE_URL = 'https://YOUR-BACKEND-URL.onrender.com/api/v1';
```

2. **Edit Socket URL**:
```bash
# Edit app/utils/socket.js
# Change SOCKET_URL to:
const SOCKET_URL = 'https://YOUR-BACKEND-URL.onrender.com';
```

3. **Test**:
```bash
npx expo start
```

---

## ✅ Final Verification (3 minutes)

### Test Login Flow:
1. Open frontend URL: `https://YOUR-FRONTEND-URL.vercel.app`
2. Click "Login"
3. Use test credentials:
   - **Admin**: `admin@inhoz.com` / `admin123`
   - **Doctor**: `dr.smith@inhoz.com` / `doctor123`
   - **Patient**: `john.doe@inhoz.com` / `patient123`
4. Verify dashboard loads

### If Login Fails:
- Check Render logs: Dashboard → Logs
- Check MongoDB connection: Should see "MongoDB Connected" in Render logs
- Check CORS: Make sure `CORS_ORIGIN` matches your Vercel URL exactly
- Wait for cold start: First request may take 30-60 seconds (Render free tier)

---

## 🎯 Your Deployed URLs

Save these for reference:

```
MongoDB Atlas: [your cluster URL]
Backend (Render): https://[your-service].onrender.com
Frontend (Vercel): https://[your-project].vercel.app
```

---

## 🚨 Common Issues & Quick Fixes

### Issue 1: "Cannot connect to backend"
- **Check**: Is backend URL in Vercel environment variables correct?
- **Fix**: Vercel Dashboard → Settings → Environment Variables → Update `VITE_API_URL`
- **Redeploy**: Vercel Dashboard → Deployments → Three dots → Redeploy

### Issue 2: "CORS Error"
- **Check**: Does `CORS_ORIGIN` in Render match your Vercel URL exactly?
- **Fix**: Render Dashboard → Environment → Update `CORS_ORIGIN` → Save
- **Wait**: Auto-redeploys in 1-2 minutes

### Issue 3: "Backend slow or timeout"
- **Cause**: Render free tier sleeps after 15 minutes
- **First request**: Takes 30-60 seconds to wake up
- **Solution**: Upgrade to paid tier ($7/month) for always-on service

### Issue 4: "MongoDB connection failed"
- **Check**: Is IP whitelist set to 0.0.0.0/0?
- **Check**: Is password correct in connection string?
- **Fix**: Atlas → Network Access → Add 0.0.0.0/0

---

## 🎊 Success!

Once all steps complete, you have:
- ✅ Production backend on Render
- ✅ Production frontend on Vercel  
- ✅ MongoDB database on Atlas
- ✅ Full deployment pipeline (auto-deploys on git push)

**Total Time**: ~30 minutes

**Cost**: $0/month (all free tiers)

---

## 📈 Next Steps (Optional)

1. **Custom Domain**: 
   - Vercel: Settings → Domains → Add
   - Render: Settings → Custom Domain

2. **Initialize Database**:
```bash
cd database
node init-db-simple.js
# Creates test users and sample data
```

3. **Monitor Uptime**:
   - Use UptimeRobot (free): https://uptimerobot.com
   - Monitor both backend and frontend URLs

4. **Mobile App Deployment**:
   - Build: `eas build --platform all`
   - Submit to App Store / Play Store

---

## 📞 Need Help?

- **Render Issues**: Check Logs tab in dashboard
- **Vercel Issues**: Check Function Logs in deployment
- **MongoDB Issues**: Check Atlas dashboard → Metrics
- **Full Guide**: See DEPLOYMENT_GUIDE.md for detailed troubleshooting

---

**Ready to deploy? Start with Step 1 above!** 🚀
