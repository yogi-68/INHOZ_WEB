# INHOZ Mobile App - Setup Instructions

## 📱 Mobile App Status

The mobile app has been **fully updated** with the same comprehensive features as the web application, including:

✅ Real API integration with backend (port 3001)  
✅ Socket.IO for real-time updates  
✅ Role-based authentication and routing  
✅ Admin, Doctor, and Patient dashboards  
✅ Complete feature parity with web app  

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd inhoz-app

# Install new dependencies
npm install

# This will install: axios, socket.io-client, @react-native-async-storage/async-storage
```

### 2. Update API Configuration

Edit `app/utils/api.js` and `app/utils/socket.js` to set the correct backend URL:

**For Android Emulator:**
```javascript
const API_URL = 'http://10.0.2.2:3001/api/v1';
const SOCKET_URL = 'http://10.0.2.2:3001';
```

**For iOS Simulator:**
```javascript
const API_URL = 'http://localhost:3001/api/v1';
const SOCKET_URL = 'http://localhost:3001';
```

**For Physical Device:**
```javascript
const API_URL = 'http://YOUR_COMPUTER_IP:3001/api/v1';
const SOCKET_URL = 'http://YOUR_COMPUTER_IP:3001';
```

To find your computer's IP:
- **Windows:** `ipconfig` (look for IPv4 Address)
- **Mac/Linux:** `ifconfig` or `ip addr`

### 3. Start the Backend Server

```bash
cd ../backend
node src/server.js
```

Ensure backend is running on port **3001**.

### 4. Start the Mobile App

```bash
cd ../inhoz-app
npm start
```

Then choose your platform:
- Press `a` for Android
- Press `i` for iOS
- Press `w` for Web
- Scan QR code with Expo Go app (physical device)

---

## 📋 What Was Updated

### ✅ New Files Created

1. **`app/utils/api.js`** - Complete API client
   - Axios instance with interceptors
   - Token management (AsyncStorage)
   - Automatic token refresh
   - All endpoints (auth, admin, doctor, patient)

2. **`app/utils/socket.js`** - Socket.IO client
   - Real-time connection management
   - Room subscriptions
   - Event handlers
   - Auto-reconnection

3. **`app/admin.jsx`** - Admin Dashboard ✅ COMPLETE
   - 6 KPI cards with real-time stats
   - Recent alerts feed
   - Quick actions
   - Tab navigation (Overview/Doctors/Patients)
   - Pull-to-refresh
   - Socket.IO subscriptions
   - Modern slate UI theme

4. **`app/doctor.jsx`** - Doctor Dashboard ✅ COMPLETE
   - Patient cards with vitals monitoring
   - Color-coded vital status indicators
   - Alerts inbox with acknowledgment
   - Prescription creation modal (multi-medication)
   - Socket.IO real-time updates
   - Tab navigation (Patients/Alerts)
   - Modern slate UI theme

5. **`app/patient.jsx`** - Patient Dashboard ✅ COMPLETE
   - Vitals snapshot cards with color-coded status
   - Emergency contact card (direct call)
   - Prescriptions list with expandable details
   - "Mark as taken" medication tracking
   - Invoices list with download/pay buttons
   - Alerts feed
   - Tab navigation (Vitals/Meds/Bills/Alerts)
   - Socket.IO real-time updates
   - Modern slate UI theme

### ✅ Updated Files

1. **`app/Components/LoginForm.jsx`**
   - Real API authentication
   - Role-based routing (admin/doctor/patient)
   - Socket.IO initialization
   - Better error handling
   - Loading indicator

2. **`app/_layout.jsx`** ✅ UPDATED
   - Added `/admin` route
   - Added `/doctor` route
   - Added `/patient` route

---

## 🔧 Dependencies Added

```json
{
  "axios": "^1.6.0",
  "socket.io-client": "^4.7.0",
  "@react-native-async-storage/async-storage": "^1.21.0"
}
```

---

## 📱 Features Implemented

### Admin Dashboard ✅
- ✅ Real-time KPI cards (patients, alerts, doctors, revenue, devices)
- ✅ Critical alerts feed with severity indicators
- ✅ Socket.IO real-time updates
- ✅ Tab navigation (Overview/Doctors/Patients)
- ✅ Pull-to-refresh
- ✅ Logout functionality
- ✅ Modern slate UI theme (#1e293b, #f8fafc, #64748b)

### Doctor Dashboard ✅
- ✅ Patient cards with real-time vitals (HR, SpO₂, Temp, BP)
- ✅ Color-coded vital status (critical/warning/normal)
- ✅ Alert badges on patient cards
- ✅ Alerts inbox with acknowledge button
- ✅ Prescription creation modal (multi-medication support)
- ✅ Socket.IO subscriptions (vitals:update, alert:new)
- ✅ Tab navigation (Patients/Alerts)
- ✅ Pull-to-refresh
- ✅ Modern slate UI theme

### Patient Dashboard ✅
- ✅ Vitals snapshot cards with status badges
- ✅ Emergency contact card with direct call
- ✅ Prescriptions list (expandable details)
- ✅ Medication tracking ("mark as taken" buttons)
- ✅ Invoices list (download/pay functionality)
- ✅ Alerts feed with severity styling
- ✅ Socket.IO subscriptions (vitals:update, alert:new, prescription:created)
- ✅ Tab navigation (Vitals/Meds/Bills/Alerts)
- ✅ Pull-to-refresh
- ✅ Modern slate UI theme

### Login System ✅
- ✅ JWT authentication
- ✅ Token storage (AsyncStorage)
- ✅ Automatic token refresh
- ✅ Role-based routing (admin→/admin, doctor→/doctor, patient→/patient)
- ✅ Error handling with retry attempts

### Real-time Updates ✅
- ✅ Socket.IO connection
- ✅ Room-based subscriptions (admin, doctor:{id}, patient:{id})
- ✅ Auto-reconnection
- ✅ Event listeners (vitals:update, alert:new, device:offline, prescription:created)

---

## 🧪 Test Accounts

**Admin:**
- Email: `admin@inhoz.com`
- Password: (your configured password)
- Route: `/admin`

**Doctor:**
- Email: `doctor@inhoz.com`
- Password: (your configured password)
- Route: `/doctor`

**Patient:**
- Email: `patient@inhoz.com`
- Password: (your configured password)
- Route: `/patient`

---

## 🔄 How It Works

1. **User logs in** → API validates credentials
2. **JWT tokens saved** → AccessToken + RefreshToken stored
3. **Role detected** → Routes to appropriate dashboard
4. **Socket.IO connects** → Real-time updates start
5. **Room subscribed** → User joins role-specific room
6. **Data fetched** → Dashboard loads with API data
7. **Updates received** → Socket.IO pushes live changes

---

## 📊 API Integration

All mobile app components now connect to the same backend as the web app:

- **Backend:** `http://localhost:3001`
- **Database:** MongoDB Atlas (shared)
- **Real-time:** Socket.IO (shared)
- **Authentication:** JWT (shared)

---

## 🎯 Ready to Run!

### ✅ All Components Complete!

All three role-based dashboards are complete with full feature parity to the web app. To run:

1. **Install dependencies:**
   ```bash
   cd inhoz-app
   npm install
   ```

2. **Update API URLs** in `app/utils/api.js` and `app/utils/socket.js`:
   - Android Emulator: `http://10.0.2.2:3001`
   - iOS Simulator: `http://localhost:3001`
   - Physical Device: `http://YOUR_IP:3001`

3. **Start backend:**
   ```bash
   cd ../backend
   node src/server.js
   ```

4. **Start mobile app:**
   ```bash
   cd ../inhoz-app
   npm start
   ```

5. **Test with accounts:**
   - Admin: `admin@inhoz.com`
   - Doctor: `doctor@inhoz.com`
   - Patient: `patient@inhoz.com`

### Optional Enhancements:

- Push notifications (Expo Notifications)
- Offline data sync
- Biometric authentication
- Camera integration for patient monitoring
- Dark mode
- Multi-language support

---

## 🐛 Troubleshooting

**Connection Refused Error:**
- Check backend is running on port 3001
- Update API_URL to correct IP address
- For Android emulator, use `10.0.2.2` instead of `localhost`

**Socket.IO Not Connecting:**
- Verify backend Socket.IO is initialized
- Check CORS settings allow mobile app origin
- Ensure token is valid

**Token Expired:**
- App automatically refreshes tokens
- If refresh fails, user is logged out
- Check refresh token is still valid (7 days)

---

## ✅ Summary

The mobile app is now **fully complete** with:
- ✅ Backend API integration (port 3001)
- ✅ MongoDB database (shared with web)
- ✅ Socket.IO real-time updates (shared with web)
- ✅ JWT authentication (shared with web)
- ✅ 3 role-based dashboards (Admin, Doctor, Patient)
- ✅ Modern UI design (slate color palette)
- ✅ Complete feature parity with web app

**One backend, one database, multiple clients (web + mobile)!** 🎉

### 📊 System Overview

```
Backend (Port 3001)
    ↓
MongoDB Atlas
    ↓
┌──────────────────────────────────┐
│   Web App (Port 5173)            │
│   - AdminDashboard.jsx           │
│   - DoctorDashboard.jsx          │
│   - PatientDashboard.jsx         │
└──────────────────────────────────┘
    ↓
┌──────────────────────────────────┐
│   Mobile App (Expo)              │
│   - app/admin.jsx                │
│   - app/doctor.jsx               │
│   - app/patient.jsx              │
└──────────────────────────────────┘
```

---

**Last Updated:** January 2025  
**Version:** 2.0.0  
**Status:** ✅ Complete & Ready for Testing

---

**Need help?** Check the troubleshooting section above or contact the development team.
