import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUserInjured, FaHeartbeat, FaHistory, FaUserMd, FaCog, FaChevronRight, FaChevronLeft, FaSun, FaMoon, FaBell, FaSearch } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

const Navbar = ({ isDarkMode, toggleDarkMode }) => {
  const { translate } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { id: 'home', label: translate('home'), icon: FaUserInjured, path: '/' },
    { id: 'patients', label: translate('patients'), icon: FaUserInjured, path: '/patients' },
    { id: 'vitals', label: translate('vitals'), icon: FaHeartbeat, path: '/vitals' },
    { id: 'history', label: translate('patientHistory'), icon: FaHistory, path: '/history' },
    { id: 'doctor', label: translate('doctor'), icon: FaUserMd, path: '/doctor-profile' },
    { id: 'settings', label: translate('settings'), icon: FaCog, path: '/settings' }
  ];

  const notifications = [
    { id: 1, title: translate('newPatient'), message: 'John Doe admitted', time: '2h ago' },
    { id: 2, title: translate('vitalsAlert'), message: 'Jane Smith - High BP', time: '3h ago' },
    { id: 3, title: translate('appointmentReminder'), message: 'Alice Johnson - Tomorrow 10:00 AM', time: '5h ago' }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className={`h-screen transition-all duration-300 ${isExpanded ? 'w-64' : 'w-20'} ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-lg flex flex-col`}>
      {/* Profile Section */}
      <div className="p-4 text-center border-b border-gray-700">
        <div className="relative inline-block">
          <img 
            src="https://randomuser.me/api/portraits/men/1.jpg" 
            alt="Doctor" 
            className="w-16 h-16 rounded-full mx-auto border-4 border-blue-500"
          />
          {isExpanded && (
            <div className="mt-2">
              <p className="font-semibold text-lg">Dr. John Doe</p>
              <p className="text-sm text-gray-400">{translate('cardiologist')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {isExpanded && (
        <div className="px-4 py-2">
          <div className="relative">
            <input
              type="text"
              placeholder={translate('search')}
              className={`w-full p-2 pl-8 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
              }`}
            />
            <FaSearch className={`absolute left-3 top-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-2 py-4">
          {tabs.map((tab) => {
            const isActive = isActivePath(tab.path);
            return (
              <button
                key={tab.id}
                onClick={() => handleNavigation(tab.path)}
                className={`w-full flex items-center p-3 mb-1 rounded-lg transition-colors ${
                  isActive
                    ? isDarkMode 
                      ? 'bg-blue-900 text-blue-100' 
                      : 'bg-blue-50 text-blue-600'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className={`text-xl ${isActive ? 'text-blue-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                {isExpanded && (
                  <span className="ml-3 font-medium">{tab.label}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Section */}
      <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-4`}>
        {/* Notifications */}
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className={`w-full flex items-center p-2 mb-2 rounded-lg ${
            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
        >
          <FaBell className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          {isExpanded && (
            <span className={`ml-3 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {translate('notifications')}
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {notifications.length}
              </span>
            </span>
          )}
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className={`w-full flex items-center p-2 mb-2 rounded-lg ${
            isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-700'
          } hover:opacity-90`}
        >
          {isDarkMode ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
          {isExpanded && (
            <span className="ml-3 font-medium">
              {isDarkMode ? translate('lightMode') : translate('darkMode')}
            </span>
          )}
        </button>

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full flex items-center justify-center p-2 ${
            isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          {isExpanded ? <FaChevronLeft /> : <FaChevronRight />}
        </button>
      </div>

      {/* Notifications Panel */}
      {showNotifications && isExpanded && (
        <div className={`absolute left-64 bottom-32 w-80 rounded-lg shadow-xl border p-4 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {translate('notifications')}
          </h3>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className={`p-3 rounded-lg ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <p className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {notification.title}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {notification.message}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                  {notification.time}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
