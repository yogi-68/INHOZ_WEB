import React, { useState } from 'react';
import {
  FaChartLine, FaHeartbeat, FaExclamationTriangle, FaPrescriptionBottleAlt,
  FaMoneyBillWave, FaUser, FaSignOutAlt, FaBell, FaCog, FaHospital,
  FaThermometerHalf, FaTint, FaLungs
} from 'react-icons/fa';

const PatientDashboardNew = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState(2);
  const [userInfo] = useState({
    name: 'John Doe',
    email: 'john.doe@inhoz.com',
    patientId: 'PAT000123'
  });

  const tabs = [
    { id: 'overview', name: 'Dashboard', icon: FaChartLine },
    { id: 'vitals', name: 'Vitals History', icon: FaHeartbeat },
    { id: 'alerts', name: 'My Alerts', icon: FaExclamationTriangle },
    { id: 'prescriptions', name: 'Prescriptions', icon: FaPrescriptionBottleAlt },
    { id: 'billing', name: 'Billing', icon: FaMoneyBillWave },
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
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl shadow-xl p-8 text-white">
          <h1 className="text-4xl font-bold mb-2">Patient Dashboard</h1>
          <p className="text-teal-100 text-lg">Your health information at a glance</p>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between mb-2">
              <FaHeartbeat className="text-3xl text-red-500" />
              <span className="text-sm text-gray-600">Latest</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">72</p>
            <p className="text-sm text-gray-600">Heart Rate (bpm)</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <FaTint className="text-3xl text-blue-500" />
              <span className="text-sm text-gray-600">Latest</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">98%</p>
            <p className="text-sm text-gray-600">Blood Oxygen</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <FaThermometerHalf className="text-3xl text-orange-500" />
              <span className="text-sm text-gray-600">Latest</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">36.8°C</p>
            <p className="text-sm text-gray-600">Temperature</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <FaHeartbeat className="text-6xl text-teal-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome, {userInfo.name}</h2>
          <p className="text-gray-600">Full patient dashboard with all modules coming soon...</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50">
      {/* Sidebar */}
      <aside className="w-72 bg-gradient-to-b from-teal-900 via-teal-800 to-teal-900 text-white shadow-2xl flex flex-col">
        <div className="p-6 border-b border-teal-700">
          <div className="flex items-center space-x-3">
            <FaHospital className="text-4xl text-teal-200" />
            <div>
              <h1 className="text-2xl font-bold">INHOZ</h1>
              <p className="text-xs text-teal-300">Patient Portal</p>
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
                    ? 'bg-white text-teal-900 shadow-lg transform scale-105'
                    : 'text-teal-100 hover:bg-teal-700 hover:text-white'
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

        <div className="p-4 border-t border-teal-700">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-xl font-bold">
              {userInfo.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{userInfo.name}</p>
              <p className="text-xs text-teal-300">{userInfo.patientId}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-teal-700 hover:bg-teal-600 px-4 py-2 rounded-lg transition-colors"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-md px-8 py-4 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">My Health Dashboard</h2>
            <p className="text-sm text-gray-600">Monitor your health metrics and appointments</p>
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

export default PatientDashboardNew;
