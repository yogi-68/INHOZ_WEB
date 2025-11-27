import React, { useState, useEffect } from 'react';
import {
  FaChartLine, FaUserInjured, FaHeartbeat, FaExclamationTriangle,
  FaPrescriptionBottleAlt, FaHistory, FaUser, FaSignOutAlt,
  FaBell, FaCog, FaSearch, FaHospital, FaUserMd, FaCalendarAlt
} from 'react-icons/fa';
import apiClient from '../utils/api';

const DoctorDashboardNew = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Real data from API
  const [patients, setPatients] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [userInfo, setUserInfo] = useState({
    name: 'Loading...',
    email: '',
    specialization: ''
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

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch current user info
      const userResponse = await apiClient.getCurrentUser();
      if (userResponse.success) {
        const user = userResponse.data;
        setUserInfo({
          name: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() || 'Doctor',
          email: user.email || '',
          specialization: user.doctorProfile?.specialty || 'General Medicine'
        });
      }

      // Fetch patients
      const patientsResponse = await apiClient.getDoctorPatients();
      if (patientsResponse.success) {
        setPatients(patientsResponse.data || []);
      }

      // Fetch alerts
      const alertsResponse = await apiClient.getDoctorAlerts({ status: 'pending' });
      if (alertsResponse.success) {
        setAlerts(alertsResponse.data || []);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await apiClient.acknowledgeAlert(alertId);
      // Refresh alerts
      const alertsResponse = await apiClient.getDoctorAlerts({ status: 'pending' });
      if (alertsResponse.success) {
        setAlerts(alertsResponse.data || []);
      }
    } catch (err) {
      console.error('Error acknowledging alert:', err);
    }
  };

  const handleLogout = () => {
    apiClient.logout();
    window.location.href = '/login';
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-xl p-8 text-white">
              <h1 className="text-4xl font-bold mb-2">Dashboard Overview</h1>
              <p className="text-blue-100 text-lg">Patient care and monitoring</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Total Patients</h3>
                  <FaUserMd className="text-3xl text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{patients.length}</p>
                <p className="text-sm text-gray-600 mt-2">Assigned to you</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Critical Alerts</h3>
                  <FaBell className="text-3xl text-red-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{alerts.filter(a => a.severity === 'critical').length}</p>
                <p className="text-sm text-red-600 mt-2">Requires attention</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Total Alerts</h3>
                  <FaExclamationTriangle className="text-3xl text-yellow-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{alerts.length}</p>
                <p className="text-sm text-gray-600 mt-2">Pending review</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Active Monitoring</h3>
                  <FaHeartbeat className="text-3xl text-pink-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{patients.filter(p => p.status === 'monitoring').length}</p>
                <p className="text-sm text-gray-600 mt-2">patients monitored</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome, {userInfo.name}</h2>
              <p className="text-gray-600">{userInfo.specialization}</p>
              <p className="text-sm text-gray-500 mt-2">{userInfo.email}</p>
            </div>
          </div>
        );

      case 'patients':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">My Patients ({patients.length})</h2>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading patients...</div>
              ) : patients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No patients assigned yet</div>
              ) : (
                <div className="space-y-4">
                  {patients.map((patient) => (
                    <div key={patient._id} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors">
                      <div className="flex items-center space-x-4">
                        <FaUserMd className="text-3xl text-blue-500" />
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {patient.userId?.profile?.firstName} {patient.userId?.profile?.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Room: {patient.roomNo} | Age: {patient.age} | {patient.gender}
                          </p>
                          <p className="text-xs text-gray-400">Hospital ID: {patient.hospitalId}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          patient.status === 'monitoring' ? 'bg-green-100 text-green-700' :
                          patient.status === 'admitted' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {patient.status}
                        </span>
                        <button 
                          onClick={() => setActiveTab('monitoring')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'monitoring':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FaHeartbeat className="text-red-500 mr-3" />
                Live Patient Monitoring
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border-2 border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Patient: John Doe</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Heart Rate:</span>
                      <span className="font-bold text-pink-600">72 bpm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Blood Pressure:</span>
                      <span className="font-bold text-blue-600">120/80 mmHg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Temperature:</span>
                      <span className="font-bold text-orange-600">98.6°F</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">SpO2:</span>
                      <span className="font-bold text-green-600">98%</span>
                    </div>
                  </div>
                </div>
                <div className="border-2 border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Patient: Jane Smith</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Heart Rate:</span>
                      <span className="font-bold text-pink-600">68 bpm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Blood Pressure:</span>
                      <span className="font-bold text-blue-600">118/76 mmHg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Temperature:</span>
                      <span className="font-bold text-orange-600">98.4°F</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">SpO2:</span>
                      <span className="font-bold text-green-600">99%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'alerts':
        const getSeverityColor = (severity) => {
          switch(severity) {
            case 'critical': return { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-800', subtext: 'text-red-700', btn: 'bg-red-600 hover:bg-red-700' };
            case 'warning': return { bg: 'bg-yellow-50', border: 'border-yellow-500', text: 'text-yellow-800', subtext: 'text-yellow-700', btn: 'bg-yellow-600 hover:bg-yellow-700' };
            default: return { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-800', subtext: 'text-blue-700', btn: 'bg-blue-600 hover:bg-blue-700' };
          }
        };

        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FaBell className="text-red-500 mr-3" />
                Alerts ({alerts.length})
              </h2>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading alerts...</div>
              ) : alerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No pending alerts</div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => {
                    const colors = getSeverityColor(alert.severity);
                    const patientName = `${alert.patientId?.userId?.profile?.firstName || 'Unknown'} ${alert.patientId?.userId?.profile?.lastName || 'Patient'}`;
                    const timeAgo = new Date(alert.createdAt).toLocaleString();
                    
                    return (
                      <div key={alert._id} className={`${colors.bg} border-l-4 ${colors.border} p-4 rounded`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className={`font-semibold ${colors.text}`}>{alert.type}</h3>
                              <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${colors.bg} ${colors.text} border ${colors.border}`}>
                                {alert.severity}
                              </span>
                            </div>
                            <p className={`text-sm ${colors.subtext} mt-1`}>
                              Patient: {patientName}
                            </p>
                            <p className={`text-sm ${colors.subtext}`}>{alert.message}</p>
                            {alert.vitalSnapshot && (
                              <div className="mt-2 text-xs text-gray-600">
                                {alert.vitalSnapshot.heartRate && `HR: ${alert.vitalSnapshot.heartRate} bpm  `}
                                {alert.vitalSnapshot.spo2 && `SpO2: ${alert.vitalSnapshot.spo2}%  `}
                                {alert.vitalSnapshot.systolic && alert.vitalSnapshot.diastolic && 
                                  `BP: ${alert.vitalSnapshot.systolic}/${alert.vitalSnapshot.diastolic} mmHg  `}
                                {alert.vitalSnapshot.temperature && `Temp: ${alert.vitalSnapshot.temperature}°F`}
                              </div>
                            )}
                            <p className="text-xs text-gray-400 mt-2">{timeAgo}</p>
                          </div>
                          <button 
                            onClick={() => handleAcknowledgeAlert(alert._id)}
                            className={`px-3 py-1 text-white text-sm rounded transition-colors ${colors.btn}`}
                          >
                            Acknowledge
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );

      case 'prescriptions':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Prescriptions</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  New Prescription
                </button>
              </div>
              <div className="space-y-4">
                <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">Lisinopril 10mg</h3>
                      <p className="text-sm text-gray-600 mt-1">Patient: John Doe</p>
                      <p className="text-sm text-gray-500">Take once daily for blood pressure</p>
                      <p className="text-xs text-gray-400 mt-2">Prescribed: Jan 15, 2024</p>
                    </div>
                    <button className="px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors">
                      Edit
                    </button>
                  </div>
                </div>
                <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">Metformin 500mg</h3>
                      <p className="text-sm text-gray-600 mt-1">Patient: Jane Smith</p>
                      <p className="text-sm text-gray-500">Take twice daily with meals</p>
                      <p className="text-xs text-gray-400 mt-2">Prescribed: Jan 10, 2024</p>
                    </div>
                    <button className="px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'history':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Patient History</h2>
              <div className="space-y-4">
                <div className="border-2 border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">John Doe - Consultation</h3>
                    <span className="text-sm text-gray-500">Jan 20, 2024</span>
                  </div>
                  <p className="text-sm text-gray-600">Routine checkup - Blood pressure slightly elevated</p>
                  <div className="mt-3 flex space-x-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Checkup</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Completed</span>
                  </div>
                </div>
                <div className="border-2 border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">Jane Smith - Follow-up</h3>
                    <span className="text-sm text-gray-500">Jan 18, 2024</span>
                  </div>
                  <p className="text-sm text-gray-600">Diabetes management - glucose levels stable</p>
                  <div className="mt-3 flex space-x-2">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">Follow-up</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Completed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-xl p-8">
              <div className="flex items-center space-x-6 mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                  {userInfo.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">{userInfo.name}</h2>
                  <p className="text-lg text-gray-600">{userInfo.specialization}</p>
                  <p className="text-sm text-gray-500">{userInfo.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Professional Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">License Number</label>
                      <p className="text-gray-800 font-semibold">MD-2024-12345</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Years of Experience</label>
                      <p className="text-gray-800 font-semibold">8 years</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Department</label>
                      <p className="text-gray-800 font-semibold">Cardiology</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-800 font-semibold">+1 (555) 123-4567</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Office</label>
                      <p className="text-gray-800 font-semibold">Building A, Room 204</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Working Hours</label>
                      <p className="text-gray-800 font-semibold">Mon-Fri: 9AM - 5PM</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t-2 border-gray-200">
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <FaHeartbeat className="text-6xl text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome, {userInfo.name}</h2>
              <p className="text-gray-600">Select a tab to view content</p>
            </div>
          </div>
        );
    }
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
