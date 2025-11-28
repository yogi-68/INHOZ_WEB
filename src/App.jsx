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
  
  console.log('🔒 ProtectedRoute check:', { isAuthenticated, userRole, allowedRoles });
  
  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to login');
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    console.log('❌ Role not authorized, redirecting to unauthorized');
    return <Navigate to="/unauthorized" />;
  }
  
  console.log('✅ Access granted');
  return children;
};

// Role-based dashboard redirect
const DashboardRedirect = () => {
  const userRole = localStorage.getItem('userRole');
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  console.log('🔄 DashboardRedirect:', { userRole, isAuthenticated });
  
  if (!isAuthenticated) {
    console.log('🔄 Not authenticated, going to login');
    return <Navigate to="/login" replace />;
  }
  
  switch(userRole) {
    case 'admin':
      console.log('🔄 Redirecting to admin dashboard');
      return <Navigate to="/admin" replace />;
    case 'doctor':
      console.log('🔄 Redirecting to doctor dashboard');
      return <Navigate to="/doctor" replace />;
    case 'patient':
      console.log('🔄 Redirecting to patient dashboard');
      return <Navigate to="/patient" replace />;
    default:
      console.log('🔄 Unknown role, going to login');
      return <Navigate to="/login" replace />;
  }
};

// Debug component for development
const AuthDebug = () => {
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  const userRole = localStorage.getItem('userRole');
  const user = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  
  return (
    <div style={{ position: 'fixed', bottom: '10px', right: '10px', background: '#000', color: '#fff', padding: '10px', fontSize: '12px', zIndex: 9999 }}>
      <div>🔒 Auth: {isAuthenticated}</div>
      <div>👤 Role: {userRole}</div>
      <div>🎫 Token: {token ? 'Present' : 'None'}</div>
      <div>👥 User: {user ? 'Present' : 'None'}</div>
      <button onClick={() => {
        localStorage.clear();
        window.location.reload();
      }} style={{marginTop: '5px', padding: '2px 5px', fontSize: '10px'}}>Clear & Reload</button>
    </div>
  );
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
          {/* Root redirect - check auth and redirect accordingly */}
          <Route path="/" element={<DashboardRedirect />} />
          
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
          
          {/* Unauthorized Route */}
          <Route path="/unauthorized" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h2>
                <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
                <a href="/login" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded">
                  Go to Login
                </a>
              </div>
            </div>
          } />
          
          {/* Catch all - redirect to login or dashboard */}
          <Route path="*" element={<DashboardRedirect />} />
        </Routes>
        
        {/* Debug component for development - remove in production */}
        <AuthDebug />
      </Router>
    </LanguageProvider>
  );
}

export default App;
