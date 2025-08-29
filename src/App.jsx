import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LogoSplash from './Components/LogoSplash';
import LoginForm from './Components/LoginForm';
import Layout from './Components/Layout';
import Home from './Components/Home';
import PatientDetails from './Components/PatientDetails';
import Vitals from './Components/Vitals';
import PatientHistory from './Components/PatientHistory';
import DoctorDashboard from './Components/DoctorDashboard';
import Settings from './Components/Settings';
import { LanguageProvider } from './context/LanguageContext';
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Auto hide splash screen after 5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Show splash screen first
  if (showSplash) {
    return (
      <LanguageProvider>
        <LogoSplash onFinished={() => setShowSplash(false)} />
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/patients" element={<PatientDetails />} />
                    <Route path="/vitals" element={<Vitals isDarkMode={isDarkMode} />} />
                    <Route path="/history" element={<PatientHistory />} />
                    <Route path="/doctor-profile" element={<DoctorDashboard />} />
                    <Route path="/settings" element={<Settings onLogout={handleLogout} />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
