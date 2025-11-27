# INHOZ Mobile App 

A cross-platform mobile application for hospital patient monitoring built with React Native and Expo. Provides doctors and nurses with on-the-go access to patient vitals, history, and real-time monitoring capabilities.

##  Features

###  Authentication
- Secure login system for healthcare professionals
- Role-based access control
- Session management and secure storage

###  Patient Dashboard
- **Real-Time Vitals Monitoring**: Track heart rate, blood pressure, temperature, SpO2, respiratory rate, and more
- **Multiple Patient Management**: Monitor several patients simultaneously
- **Quick Access Cards**: Instant view of critical patient information
- **Visual Status Indicators**: Color-coded alerts for abnormal readings

###  Comprehensive Vitals Tracking
- Heart Rate monitoring
- Blood Pressure (Systolic/Diastolic)
- Body Temperature
- Oxygen Saturation (SpO2)
- Respiratory Rate
- IV Fluid Levels
- Glucose Levels
- Pain Scale assessment

###  Danger Detection & Alerts
- **Real-Time Monitoring**: Continuous patient safety surveillance
- **Automatic Alerts**: Instant notifications for critical conditions
  - High fever detection (>39C)
  - Abnormal pulse/heart rate
  - Low blood oxygen levels (<90%)
  - Hypertensive crisis
  - Hypotension detection
  - IV level warnings
- **Visual Indicators**: Color-coded status cards (Stable/Requires Attention)

###  Patient History
- Detailed medical history tracking
- **Chronological Timeline**: View patient data over time
- **Historical Vitals**: Track trends and patterns
- **Visit Records**: Complete history of all measurements
- **Search & Filter**: Quickly find specific records

###  Reports & Documentation
- **PDF Report Generation**: Export patient vitals and history
- **Shareable Reports**: Share via email or other apps using Expo Sharing
- **Formatted Documents**: Professional medical reports
- **Print Support**: Generate printable patient summaries using Expo Print

###  Doctor Profile
- Personal profile management
- Quick access to assigned patients
- Professional credentials display

###  Settings & Customization
- User preferences
- Notification settings
- App configuration
- Logout and security options

###  Cross-Platform Support
- **iOS**: Native iOS experience
- **Android**: Native Android experience
- **Web**: Progressive Web App support
- Consistent UI/UX across all platforms

###  Modern UI/UX
- **Bottom Tab Navigation**: Easy access to main features
- **Drawer Navigation**: Extended menu options
- **Smooth Animations**: React Native Reanimated for fluid transitions
- **Haptic Feedback**: Tactile responses using Expo Haptics
- **Vector Icons**: Professional icon set with React Native Vector Icons
- **Charts & Graphs**: Visual data representation with React Native Chart Kit

##  Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Expo Go app (for testing on physical devices)
- Android Studio (for Android development)
- Xcode (for iOS development - macOS only)

### Installation

1. Install dependencies:
```
npm install
```

2. Start the development server:
```
npm start
```

3. Run on your preferred platform:

**iOS Simulator:**
```
npm run ios
```

**Android Emulator:**
```
npm run android
```

**Web Browser:**
```
npm run web
```

**Physical Device:**
- Scan the QR code with Expo Go (Android)
- Scan the QR code with Camera app (iOS)

##  Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run in web browser
- `npm test` - Run tests with Jest
- `npm run lint` - Lint code with ESLint

##  Tech Stack

### Core Framework
- **React Native 0.76.7** - Cross-platform mobile framework
- **Expo SDK ~52** - Development platform and tools
- **Expo Router** - File-based navigation

### Navigation
- **React Navigation 7.x** - Navigation library
- **Bottom Tabs** - Tab-based navigation

### UI Components
- **React Native Elements** - UI toolkit
- **React Native Vector Icons** - Icon library
- **React Native Chart Kit** - Data visualization
- **React Native SVG** - SVG rendering

### Features
- **Expo Print** - PDF and document printing
- **Expo File System** - File management
- **Expo Sharing** - Content sharing
- **Expo Haptics** - Tactile feedback
- **React Native Gesture Handler** - Touch gestures
- **React Native Reanimated** - Advanced animations

##  Vital Signs Monitored

-  Heart Rate (BPM)
-  Blood Pressure (mmHg)
-  Temperature (C/F)
-  Respiratory Rate (breaths/min)
-  SpO2 (%)
-  IV Fluid Level (ml)
-  Blood Glucose (mg/dL)
-  Pain Scale (0-10)

##  Author

**Yogi**
- GitHub: [@yogi-68](https://github.com/yogi-68)

---

** Important**: This application is designed for healthcare monitoring. Always ensure compliance with local healthcare regulations (HIPAA, GDPR, etc.) and proper data security.
