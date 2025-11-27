# 🚀 QUICK START GUIDE - INHOZ Mobile App

## ⚡ 3-Minute Setup

Your mobile app is **100% complete**! Just follow these steps:

---

## Step 1: Install Dependencies (1 min)

```powershell
cd c:\Users\yoges\OneDrive\Desktop\INHOZ\inhoz-app
npm install
```

This installs:
- `axios` - HTTP client for API calls
- `socket.io-client` - Real-time updates
- `@react-native-async-storage/async-storage` - Token storage

---

## Step 2: Configure API URL (30 seconds)

Choose based on your testing platform:

### Option A: Android Emulator
Edit `app/utils/api.js` and `app/utils/socket.js`:
```javascript
const API_URL = 'http://10.0.2.2:3001/api/v1';
const SOCKET_URL = 'http://10.0.2.2:3001';
```

### Option B: iOS Simulator
```javascript
const API_URL = 'http://localhost:3001/api/v1';
const SOCKET_URL = 'http://localhost:3001';
```

### Option C: Physical Device
First, find your computer's IP:
```powershell
ipconfig
```
Look for "IPv4 Address" (e.g., 192.168.1.100)

Then update:
```javascript
const API_URL = 'http://192.168.1.100:3001/api/v1';
const SOCKET_URL = 'http://192.168.1.100:3001';
```

---

## Step 3: Start Backend (30 seconds)

Open a **new terminal**:

```powershell
cd c:\Users\yoges\OneDrive\Desktop\INHOZ\backend
node src/server.js
```

You should see:
```
✓ Connected to MongoDB Atlas
✓ Socket.IO initialized
✓ Server running on port 3001
```

**Keep this terminal running!**

---

## Step 4: Start Mobile App (30 seconds)

Open **another new terminal**:

```powershell
cd c:\Users\yoges\OneDrive\Desktop\INHOZ\inhoz-app
npm start
```

Then choose:
- Press **`a`** for Android emulator
- Press **`i`** for iOS simulator
- **Scan QR code** with Expo Go app (physical device)

---

## Step 5: Test Login (30 seconds)

Login with these test accounts:

### Admin Account
- **Email:** `admin@inhoz.com`
- **Password:** (your password)
- **Dashboard:** 6 KPI cards, alerts feed, quick actions

### Doctor Account
- **Email:** `doctor@inhoz.com`
- **Password:** (your password)
- **Dashboard:** Patient cards, vitals monitoring, prescriptions

### Patient Account
- **Email:** `patient@inhoz.com`
- **Password:** (your password)
- **Dashboard:** Vitals, medications, invoices, emergency contact

---

## 🎯 What to Test

### Admin Dashboard
✅ KPI cards showing live data  
✅ Alerts feed with severity colors  
✅ Tab navigation works  
✅ Pull-down to refresh  
✅ Logout button  

### Doctor Dashboard
✅ Patient cards with vitals  
✅ Color-coded vital status (green/yellow/red)  
✅ Alerts tab with acknowledge button  
✅ Create prescription modal  
✅ Real-time vitals updates  

### Patient Dashboard
✅ Emergency contact card (tap to call)  
✅ Vitals cards with status badges  
✅ Prescriptions with "mark taken" buttons  
✅ Invoices with pay/download buttons  
✅ Alerts feed  
✅ Tab navigation (Vitals/Meds/Bills/Alerts)  

---

## 🐛 Quick Troubleshooting

### "Network Error" or "Connection Refused"

**Problem:** App can't reach backend

**Solution:**
1. Check backend is running (Step 3)
2. Verify API_URL is correct:
   - Android Emulator: Use `10.0.2.2:3001` (not localhost)
   - iOS Simulator: Use `localhost:3001`
   - Physical Device: Use your computer's IP
3. Ensure firewall allows connections on port 3001

### "Socket.IO not connecting"

**Problem:** Real-time updates not working

**Solution:**
1. Check SOCKET_URL matches API_URL
2. Verify backend shows "Socket.IO initialized"
3. Look for Socket connection logs in backend terminal

### "Token expired"

**Problem:** Login fails or logs out immediately

**Solution:**
1. The app auto-refreshes tokens
2. If refresh fails, just login again
3. Check backend is connected to MongoDB

### "Can't find module 'axios'"

**Problem:** Dependencies not installed

**Solution:**
```powershell
cd inhoz-app
npm install
```

---

## 📱 Device-Specific Notes

### Android Emulator
- Must use `10.0.2.2` instead of `localhost`
- Enable internet in AVD settings
- May need to restart emulator after IP change

### iOS Simulator
- Can use `localhost`
- Requires Xcode installed (Mac only)
- Shake device to open developer menu

### Physical Device
- Must be on same WiFi network as computer
- Computer firewall must allow port 3001
- Use Expo Go app from App Store/Play Store

---

## 🎉 Success Checklist

✅ Backend running on port 3001  
✅ Mobile app started with `npm start`  
✅ Login successful (no errors)  
✅ Redirected to correct dashboard (admin/doctor/patient)  
✅ Data loads (KPIs, patients, vitals, etc.)  
✅ Pull-to-refresh works  
✅ Tab navigation works  
✅ Real-time updates working (check Socket.IO logs)  

---

## 📚 Documentation

- **Complete Setup:** `MOBILE_APP_SETUP.md`
- **Features List:** `MOBILE_APP_COMPLETE.md`
- **API Reference:** `app/utils/api.js`
- **Socket.IO:** `app/utils/socket.js`

---

## 🎊 You're Done!

You now have a **fully functional mobile app** with:

✅ Real backend integration  
✅ 3 role-based dashboards  
✅ Real-time Socket.IO updates  
✅ Modern UI design  
✅ Complete feature parity with web app  

**Total setup time: 3 minutes!** ⚡

---

Need help? Check the troubleshooting section above or see `MOBILE_APP_SETUP.md` for detailed instructions.

**Happy Testing! 🚀**
