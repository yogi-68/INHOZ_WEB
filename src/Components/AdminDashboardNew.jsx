import React, { useState, useEffect } from 'react';
import { 
  FaChartLine, FaUserMd, FaUserInjured, FaHospital, 
  FaMoneyBillWave, FaExclamationTriangle, FaHistory, 
  FaCog, FaSignOutAlt, FaBell, FaSearch
} from 'react-icons/fa';
import DashboardOverview from './Admin/DashboardOverview';
import ManageDoctors from './Admin/ManageDoctors';
import ManagePatients from './Admin/ManagePatients';
import BillingManagement from './Admin/BillingManagement';
import DeviceManagement from './Admin/DeviceManagement';
import AlertsMonitoring from './Admin/AlertsMonitoring';
import AuditLogs from './Admin/AuditLogs';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [userInfo, setUserInfo] = useState({
    name: 'Admin User',
    email: 'admin@inhoz.com',
    role: 'Administrator'
  });

  const tabs = [
    { id: 'overview', name: 'Dashboard', icon: FaChartLine },
    { id: 'doctors', name: 'Doctors', icon: FaUserMd },
    { id: 'patients', name: 'Patients', icon: FaUserInjured },
    { id: 'billing', name: 'Billing', icon: FaMoneyBillWave },
    { id: 'devices', name: 'Devices', icon: FaHospital },
    { id: 'alerts', name: 'Alerts', icon: FaExclamationTriangle },
    { id: 'logs', name: 'Audit Logs', icon: FaHistory }
  ];

  const handleLogout = () => {
    // Clear all auth-related items
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview onNavigate={setActiveTab} />;
      case 'doctors':
        return <ManageDoctors />;
      case 'patients':
        return <ManagePatients />;
      case 'billing':
        return <BillingManagement />;
      case 'devices':
        return <DeviceManagement />;
      case 'alerts':
        return <AlertsMonitoring />;
      case 'logs':
        return <AuditLogs />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      {/* Sidebar */}
      <aside className="w-72 bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 text-white shadow-2xl flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-purple-700">
          <div className="flex items-center space-x-3">
            <FaHospital className="text-4xl text-purple-200" />
            <div>
              <h1 className="text-2xl font-bold">INHOZ</h1>
              <p className="text-xs text-purple-300">Hospital Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
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
                    ? 'bg-white text-purple-900 shadow-lg transform scale-105'
                    : 'text-purple-100 hover:bg-purple-700 hover:text-white'
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

        {/* User Profile */}
        <div className="p-4 border-t border-purple-700">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-xl font-bold">
              {userInfo.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{userInfo.name}</p>
              <p className="text-xs text-purple-300">{userInfo.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-purple-700 hover:bg-purple-600 px-4 py-2 rounded-lg transition-colors"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-md px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-xl">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients, doctors, devices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-3 hover:bg-gray-100 rounded-lg transition-colors">
              <FaBell className="text-2xl text-gray-600" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {notifications}
                </span>
              )}
            </button>

            {/* Settings */}
            <button className="p-3 hover:bg-gray-100 rounded-lg transition-colors">
              <FaCog className="text-2xl text-gray-600" />
            </button>

            {/* Current Date/Time */}
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-xs text-gray-500">
                {new Date().toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
