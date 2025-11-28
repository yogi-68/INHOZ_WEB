import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserMd, FaLock, FaEnvelope, FaArrowLeft, FaHospital, FaStethoscope } from 'react-icons/fa';
import apiClient from '../utils/api';
import { initializeSocket } from '../utils/socket';

const DoctorLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔄 Attempting login with:', { email: formData.username });
      const response = await apiClient.login(formData.username, formData.password);
      
      console.log('📡 API Response:', response);
      
      if (response.success && response.data) {
        const role = response.data.user.role;
        
        if (role !== 'doctor') {
          setError('Access denied. This portal is for medical doctors only.');
          setLoading(false);
          return;
        }

        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', role);
        
        console.log('✅ Doctor login successful!');
        console.log('📦 LocalStorage state:', {
          isAuthenticated: localStorage.getItem('isAuthenticated'),
          userRole: localStorage.getItem('userRole'),
          hasToken: !!localStorage.getItem('accessToken')
        });
        
        initializeSocket(response.data.accessToken);
        navigate('/doctor', { replace: true });
      } else {
        setError(response.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error('🚨 Login error details:', err);
      
      // Temporary bypass for development when backend is down
      if (err.message.includes('fetch') || err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
        console.log('🔧 Backend unavailable - using development bypass');
        setError('⚠️ Backend currently unavailable. Using development mode.');
        
        // Set temporary auth for development
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', 'doctor');
        localStorage.setItem('user', JSON.stringify({
          id: 'dev-doctor-1',
          name: 'Dr. Development',
          email: formData.username,
          role: 'doctor'
        }));
        
        setTimeout(() => {
          console.log('🔄 Redirecting to doctor dashboard...');
          navigate('/doctor');
        }, 1000);
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link 
          to="/login" 
          className="inline-flex items-center text-blue-700 hover:text-blue-900 mb-6 font-semibold transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to Role Selection
        </Link>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white text-center">
            <div className="flex items-center justify-center mb-4">
              <FaHospital className="text-4xl mr-3" />
              <h1 className="text-3xl font-bold">INHOZ</h1>
            </div>
            <div className="flex items-center justify-center mb-4">
              <FaUserMd className="text-5xl mr-3" />
              <FaStethoscope className="text-5xl" />
            </div>
            <h2 className="text-2xl font-bold">Doctor Portal</h2>
            <p className="text-blue-200 mt-2">Patient Care & Medical Records</p>
          </div>

          {/* Form */}
          <div className="p-8">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                <p className="font-semibold">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  <FaEnvelope className="inline mr-2" />
                  Email / Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="dr.smith@inhoz.com"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  <FaLock className="inline mr-2" />
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Test Credentials */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-blue-800 mb-2">🔑 Test Credentials:</p>
              <p className="text-sm text-blue-700">Email: <span className="font-mono">dr.smith@inhoz.com</span></p>
              <p className="text-sm text-blue-700">Password: <span className="font-mono">doctor123</span></p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-gray-600 text-sm">
          Secure medical professional access
        </p>
      </div>
    </div>
  );
};

export default DoctorLogin;
