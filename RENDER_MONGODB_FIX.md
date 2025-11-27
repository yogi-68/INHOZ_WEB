# 🚨 Render Deployment Error - SOLVED

## Error Encountered:
```
✗ MongoDB connection failed: querySrv ENOTFOUND _mongodb._tcp.cluster.mongodb.net
```

## Root Cause:
The `MONGODB_URI` environment variable in Render is incorrect or missing the actual cluster name.

---

## ✅ SOLUTION - Fix MongoDB Connection

### Step 1: Get Correct MongoDB Connection String

1. **Go to MongoDB Atlas Dashboard**: https://cloud.mongodb.com
2. **Click "Connect" on your cluster**
3. **Choose "Connect your application"**
4. **Copy the connection string** - it should look like:
   ```
   mongodb+srv://yogi:<db_password>@inhoz.vfbo653.mongodb.net/?appName=INHOZ
   ```
   **Note**: `cluster0.xxxxx` - your actual cluster name with unique identifier

### Step 2: Format Your Connection String Correctly

Replace placeholders:
```
mongodb+srv://<username>:<password>@<cluster-name>.<unique-id>.mongodb.net/<database-name>?retryWrites=true&w=majority
```

**Example (YOURS WILL BE DIFFERENT)**:
```
mongodb+srv://inhoz-admin:MySecurePassword123@cluster0.abc123.mongodb.net/inhoz?retryWrites=true&w=majority
```

### Step 3: Update Render Environment Variable

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Select your service**: `inhoz-backend`
3. **Click "Environment" tab** (left sidebar)
4. **Find `MONGODB_URI`** and click "Edit"
5. **Paste your CORRECT connection string**
6. **Important**: Make sure you:
   - ✅ Replaced `<password>` with your actual password
   - ✅ Replaced `<username>` with your actual username
   - ✅ Added database name `/inhoz` before the `?`
   - ✅ Used YOUR actual cluster name (not `cluster.mongodb.net`)
7. **Click "Save Changes"**
8. Service will **auto-redeploy** (takes 2-3 minutes)

---

## 🔍 How to Find Your Cluster Name

If you're not sure of your cluster name:

1. **MongoDB Atlas Dashboard**
2. **Look at your cluster** - it will show name like:
   - `Cluster0`
   - `inhoz-cluster`
   - Or whatever name you gave it
3. **Click "Connect" button**
4. **Select "Connect your application"**
5. **Driver**: Node.js
6. **Version**: 4.1 or later
7. **Copy the connection string shown**

---

## ✅ Complete MongoDB Setup Checklist

### If This is Your First Time:

1. **Create MongoDB Atlas Account** (if not done)
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Sign up (free)

2. **Create Cluster** (if not done)
   - Click "Build a Database"
   - Choose **FREE (M0)** tier
   - Select region closest to your Render backend
   - Cluster Name: `inhoz-cluster` (or any name)
   - Click "Create"

3. **Create Database User**
   - Left sidebar: **Security** → **Database Access**
   - Click "Add New Database User"
   - Authentication Method: **Password**
   - Username: `inhoz-admin` (or any name)
   - Password: **Auto-generate secure password** (SAVE THIS!)
   - Database User Privileges: **Atlas admin** (or "Read and write to any database")
   - Click "Add User"

4. **Whitelist All IPs** (Required for Render)
   - Left sidebar: **Security** → **Network Access**
   - Click "Add IP Address"
   - Click "**Allow Access from Anywhere**" (0.0.0.0/0)
   - This is required because Render uses dynamic IPs
   - Click "Confirm"
   - Wait for status to change to "Active"

5. **Get Connection String**
   - Go back to **Database** → **Clusters**
   - Click "**Connect**" button
   - Choose "**Connect your application**"
   - Driver: Node.js / Version: 4.1 or later
   - **Copy connection string**
   - Replace `<password>` with your saved password
   - Add `/inhoz` before the `?` to specify database name

---

## 📋 Correct Environment Variables for Render

In Render Dashboard → Environment tab, you should have:

```env
NODE_ENV = production
PORT = 3001
MONGODB_URI = mongodb+srv://inhoz-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/inhoz?retryWrites=true&w=majority
JWT_SECRET = your-super-secret-jwt-key-min-32-characters-long-change-this-now
JWT_REFRESH_SECRET = your-super-secret-refresh-key-min-32-chars-different-from-above
JWT_EXPIRES_IN = 15m
JWT_REFRESH_EXPIRES_IN = 7d
CORS_ORIGIN = *
```

**⚠️ IMPORTANT**:
- `MONGODB_URI`: Use YOUR actual connection string (not the example above)
- `JWT_SECRET`: Change to a random 32+ character string
- `JWT_REFRESH_SECRET`: Different random 32+ character string
- `CORS_ORIGIN`: Set to `*` for now, update to Vercel URL after frontend deployment

---

## 🔐 Generate Strong JWT Secrets

Use one of these methods:

### Option 1: Node.js (in terminal)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Option 2: OpenSSL
```bash
openssl rand -hex 32
```

### Option 3: Online Generator
- Visit: https://randomkeygen.com/
- Use "Fort Knox Passwords" or "CodeIgniter Encryption Keys"

---

## ✅ After Fixing MongoDB URI

1. **Save changes in Render**
2. **Wait for auto-redeploy** (2-3 minutes)
3. **Check logs**:
   - Render Dashboard → Logs tab
   - Should see: `✓ MongoDB connected successfully`
   - Should see: `🚀 INHOZ Backend Server running on port 3001`

4. **Test your backend**:
   - Open: `https://YOUR-SERVICE-NAME.onrender.com/api/v1/health`
   - Should return:
     ```json
     {
       "status": "ok",
       "service": "INHOZ API",
       "timestamp": "2025-11-28T..."
     }
     ```

---

## 🐛 Still Not Working? Common Issues:

### Issue 1: "Authentication failed"
**Cause**: Wrong username or password
**Solution**: 
- Go to Atlas → Security → Database Access
- Reset password for your user
- Update `MONGODB_URI` in Render with new password

### Issue 2: "IP not whitelisted"
**Cause**: Network Access not configured
**Solution**:
- Atlas → Security → Network Access
- Add 0.0.0.0/0 (Allow from anywhere)
- Wait for status to become "Active"

### Issue 3: "Database name not specified"
**Cause**: Missing database name in connection string
**Solution**:
- Add `/inhoz` before the `?` in your connection string
- Correct: `...mongodb.net/inhoz?retryWrites=...`
- Wrong: `...mongodb.net/?retryWrites=...`

### Issue 4: "Connection timeout"
**Cause**: MongoDB Atlas cluster is paused (free tier)
**Solution**:
- Atlas Dashboard → Check cluster status
- If paused, click "Resume"
- Free clusters auto-pause after 60 days of inactivity

---

## 📊 Expected Successful Deployment Logs

After fixing, you should see in Render Logs:

```
==> Running 'node src/server.js'
✓ MongoDB connected successfully
⚠️  Redis disabled (not needed for development)
info: ✅ Socket.IO initialized with room-based subscriptions
info: 🚀 INHOZ Backend Server running on port 3001
info: Environment: production
info: API Base: /api/v1
```

---

## 🎯 Quick Fix Summary

1. Get CORRECT MongoDB connection string from Atlas
2. Make sure it has YOUR cluster name (not generic `cluster.mongodb.net`)
3. Replace password placeholder with actual password
4. Add `/inhoz` database name
5. Update MONGODB_URI in Render
6. Save → Auto-redeploys → Check logs
7. Test `/api/v1/health` endpoint

---

## 🆘 Need More Help?

If still not working:

1. **Check Render Logs**: Copy and share the exact error message
2. **Check MongoDB Atlas**: 
   - Cluster status (should be green/active)
   - Network Access (should have 0.0.0.0/0)
   - Database Access (user should exist with correct permissions)
3. **Connection String Format**: Make sure no extra spaces or characters
4. **Password Special Characters**: If password has special chars, URL-encode them

---

**Once fixed, your backend will deploy successfully and you can proceed to deploy the frontend to Vercel!** 🚀
