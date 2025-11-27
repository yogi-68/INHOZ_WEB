import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LogoSplash from './Components/LogoSplash';
import RoleSelector from './Components/RoleSelector';
import AdminLogin from './Components/AdminLogin';
import DoctorLogin from './Components/DoctorLogin';
import PatientLogin from './Components/PatientLogin';
import Layout from './Components/Layout';
import Home from './Components/Home';
import PatientDetails from './Components/PatientDetails';
import Vitals from './Components/Vitals';
import PatientHistory from './Components/PatientHistory';
import DoctorDashboardNew from './Components/DoctorDashboardNew';
import AdminDashboardNew from './Components/AdminDashboardNew';
import PatientDashboardNew from './Components/PatientDashboardNew';
import Settings from './Components/Settings';
import { LanguageProvider } from './context/LanguageContext';
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userRole = localStorage.getItem('userRole');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};

// Role-based dashboard redirect
const DashboardRedirect = () => {
  const userRole = localStorage.getItem('userRole');
  
  switch(userRole) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'doctor':
      return <Navigate to="/doctor" replace />;
    case 'patient':
      return <Navigate to="/patient" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <LanguageProvider>
      <Router>
        <Routes>
          {/* Role Selection & Login Routes */}
          <Route path="/login" element={<RoleSelector />} />
          <Route path="/login/admin" element={<AdminLogin />} />
          <Route path="/login/doctor" element={<DoctorLogin />} />
          <Route path="/login/patient" element={<PatientLogin />} />
          
          {/* Admin Dashboard - Admin only */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardNew />
              </ProtectedRoute>
            }
          />
          
          {/* Doctor Dashboard - Doctor only */}
          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorDashboardNew />
              </ProtectedRoute>
            }
          />
          
          {/* Patient Dashboard - Patient only */}
          <Route
            path="/patient"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboardNew />
              </ProtectedRoute>
            }
          />
          
          {/* Legacy routes for backward compatibility */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
                  <Routes>
                    <Route path="/" element={<DashboardRedirect />} />
                    <Route path="/patients" element={<PatientDetails />} />
                    <Route path="/vitals" element={<Vitals isDarkMode={isDarkMode} />} />
                    <Route path="/history" element={<PatientHistory />} />
                    <Route path="/doctor-profile" element={<DoctorDashboard />} />
                    <Route path="/settings" element={<Settings onLogout={handleLogout} />} />
                    <Route path="/unauthorized" element={
                      <div className="p-6 text-center">
                        <h2 className="text-2xl font-bold text-red-600">Unauthorized Access</h2>
                        <p className="mt-4">You don't have permission to access this page.</p>
                      </div>
                    } />
                    <Route path="*" element={<DashboardRedirect />} />
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
