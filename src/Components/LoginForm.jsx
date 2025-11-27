import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import apiClient from '../utils/api';
import { initializeSocket } from '../utils/socket';

const LoginForm = () => {
  const navigate = useNavigate();
  const { translate } = useLanguage();
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
      const response = await apiClient.login(formData.username, formData.password);
      
      if (response.success && response.data) {
        // Store authentication data
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', response.data.user.role);
        
        // Initialize Socket.IO connection
        initializeSocket(response.data.accessToken);
        
        // Navigate based on role
        const role = response.data.user.role;
        console.log('✅ Login successful! Role:', role);
        
        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'doctor') {
          navigate('/doctor');
        } else if (role === 'patient') {
          navigate('/patient');
        } else {
          navigate('/');
        }
      } else {
        setError(response.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || translate('invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">{translate('login')}</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              {translate('username')}
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              {translate('password')}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : translate('login')}
          </button>
          
          <div className="mt-4 text-sm text-gray-600 text-center">
            <p className="font-semibold mb-2">Test Credentials:</p>
            <p>Admin: admin@inhoz.com / admin123</p>
            <p>Doctor: dr.smith@inhoz.com / doctor123</p>
            <p>Patient: john.doe@inhoz.com / patient123</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
