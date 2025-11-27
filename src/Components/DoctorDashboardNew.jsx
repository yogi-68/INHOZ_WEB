import React, { useState } from 'react';
import {
  FaChartLine, FaUserInjured, FaHeartbeat, FaExclamationTriangle,
  FaPrescriptionBottleAlt, FaHistory, FaUser, FaSignOutAlt,
  FaBell, FaCog, FaSearch, FaHospital
} from 'react-icons/fa';

const DoctorDashboardNew = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState(3);
  const [userInfo] = useState({
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@inhoz.com',
    specialization: 'Cardiology'
  });

  const tabs = [
    { id: 'overview', name: 'Dashboard', icon: FaChartLine },
    { id: 'patients', name: 'My Patients', icon: FaUserInjured },
    { id: 'monitoring', name: 'Live Monitor', icon: FaHeartbeat },
    { id: 'alerts', name: 'Alerts', icon: FaExclamationTriangle },
    { id: 'prescriptions', name: 'Prescriptions', icon: FaPrescriptionBottleAlt },
    { id: 'history', name: 'History', icon: FaHistory },
    { id: 'profile', name: 'Profile', icon: FaUser }
  ];

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const renderContent = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-xl p-8 text-white">
          <h1 className="text-4xl font-bold mb-2">Doctor Dashboard</h1>
          <p className="text-blue-100 text-lg">Patient care and monitoring</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <FaHeartbeat className="text-6xl text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome, {userInfo.name}</h2>
          <p className="text-gray-600">Full doctor dashboard with all modules coming soon...</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Sidebar */}
      <aside className="w-72 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white shadow-2xl flex flex-col">
        <div className="p-6 border-b border-blue-700">
          <div className="flex items-center space-x-3">
            <FaHospital className="text-4xl text-blue-200" />
            <div>
              <h1 className="text-2xl font-bold">INHOZ</h1>
              <p className="text-xs text-blue-300">Doctor Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 mb-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-blue-900 shadow-lg transform scale-105'
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }`}
              >
                <Icon className="text-xl" />
                <span className="font-semibold">{tab.name}</span>
                {tab.id === 'alerts' && notifications > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {notifications}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-blue-700">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
              {userInfo.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{userInfo.name}</p>
              <p className="text-xs text-blue-300">{userInfo.specialization}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-md px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-xl">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="relative p-3 hover:bg-gray-100 rounded-lg transition-colors">
              <FaBell className="text-2xl text-gray-600" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {notifications}
                </span>
              )}
            </button>
            <button className="p-3 hover:bg-gray-100 rounded-lg transition-colors">
              <FaCog className="text-2xl text-gray-600" />
            </button>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
              <p className="text-xs text-gray-500">
                {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboardNew;
