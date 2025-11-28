import React, { useState, useEffect } from 'react';
import {
  FaChartLine, FaHeartbeat, FaExclamationTriangle, FaPrescriptionBottleAlt,
  FaMoneyBillWave, FaUser, FaSignOutAlt, FaBell, FaCog, FaHospital,
  FaThermometerHalf, FaTint, FaLungs, FaClock, FaCheckCircle, FaFilePdf
} from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiClient from '../utils/api';

const PatientDashboardNew = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    patientId: 'H-001'
  });
  
  // Data states
  const [vitals, setVitals] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [latestVitals, setLatestVitals] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    try {
      setLoading(true);

      // Fetch patient profile
      const profileResponse = await apiClient.getPatientProfile();
      if (profileResponse.success && profileResponse.data) {
        const patient = profileResponse.data;
        setUserInfo({
          name: `${patient.userId?.profile?.firstName || ''} ${patient.userId?.profile?.lastName || ''}`.trim() || 'Patient',
          email: patient.userId?.email || '',
          patientId: patient.hospitalId || 'N/A'
        });
      }

      // Fetch vitals
      const vitalsResponse = await apiClient.getPatientOwnVitals({ limit: 50 });
      if (vitalsResponse.success && vitalsResponse.data) {
        setVitals(vitalsResponse.data);
        if (vitalsResponse.data.length > 0) {
          setLatestVitals(vitalsResponse.data[0]);
        }
      }

      // Fetch alerts
      const alertsResponse = await apiClient.getPatientAlerts();
      if (alertsResponse.success && alertsResponse.data) {
        setAlerts(alertsResponse.data);
      }

      // Fetch prescriptions
      const prescriptionsResponse = await apiClient.getPatientPrescriptionsOwn();
      if (prescriptionsResponse.success && prescriptionsResponse.data) {
        setPrescriptions(prescriptionsResponse.data);
      }

      // Fetch invoices
      const invoicesResponse = await apiClient.getPatientInvoices();
      if (invoicesResponse.success && invoicesResponse.data) {
        setInvoices(invoicesResponse.data);
      }

    } catch (error) {
      console.error('Error fetching patient data:', error);
    } finally {
      setLoading(false);
    }
  };

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
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your health data...</p>
          </div>
        </div>
      );
    }

    switch(activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl shadow-xl p-8 text-white">
              <h1 className="text-4xl font-bold mb-2">Welcome, {userInfo.name}</h1>
              <p className="text-teal-100 text-lg">Your health information at a glance</p>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                <div className="flex items-center justify-between mb-2">
                  <FaHeartbeat className="text-3xl text-red-500" />
                  <span className="text-sm text-gray-600">Latest</span>
                </div>
                <p className="text-3xl font-bold text-gray-800">{latestVitals?.heartRate || '--'}</p>
                <p className="text-sm text-gray-600">Heart Rate (bpm)</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between mb-2">
                  <FaTint className="text-3xl text-blue-500" />
                  <span className="text-sm text-gray-600">Latest</span>
                </div>
                <p className="text-3xl font-bold text-gray-800">{latestVitals?.spO2 || '--'}%</p>
                <p className="text-sm text-gray-600">Blood Oxygen</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
                <div className="flex items-center justify-between mb-2">
                  <FaThermometerHalf className="text-3xl text-orange-500" />
                  <span className="text-sm text-gray-600">Latest</span>
                </div>
                <p className="text-3xl font-bold text-gray-800">{latestVitals?.temperature?.toFixed(1) || '--'}°C</p>
                <p className="text-sm text-gray-600">Temperature</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <FaExclamationTriangle className="text-yellow-500 mr-2" />
                  Recent Alerts
                </h3>
                {alerts.length === 0 ? (
                  <p className="text-gray-500">No recent alerts</p>
                ) : (
                  <div className="space-y-3">
                    {alerts.slice(0, 3).map((alert) => (
                      <div key={alert._id} className="border-l-4 border-yellow-500 pl-3 py-2">
                        <p className="font-semibold text-gray-800">{alert.type}</p>
                        <p className="text-sm text-gray-600">{alert.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <FaPrescriptionBottleAlt className="text-green-500 mr-2" />
                  Active Prescriptions
                </h3>
                {prescriptions.length === 0 ? (
                  <p className="text-gray-500">No active prescriptions</p>
                ) : (
                  <p className="text-gray-700">You have <span className="font-bold text-teal-600">{prescriptions.length}</span> active prescription(s)</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'vitals':
        const chartData = vitals.slice(0, 24).reverse().map((v) => ({
          time: new Date(v.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          heartRate: v.heartRate,
          spO2: v.spO2,
          temp: v.temperature
        }));

        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FaHeartbeat className="text-red-500 mr-3" />
                Vitals History
              </h2>

              {vitals.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No vitals data available</p>
              ) : (
                <>
                  {/* Charts */}
                  <div className="space-y-8 mb-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">Heart Rate (bpm)</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis domain={[40, 120]} />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="heartRate" stroke="#ef4444" name="Heart Rate" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">Blood Oxygen (%)</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis domain={[90, 100]} />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="spO2" stroke="#3b82f6" name="SpO2" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Recent Vitals Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Heart Rate</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SpO2</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Temperature</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">BP</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {vitals.slice(0, 10).map((vital, idx) => (
                          <tr key={idx}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(vital.timestamp).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vital.heartRate} bpm</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vital.spO2}%</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vital.temperature?.toFixed(1)}°C</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {vital.bloodPressure?.systolic}/{vital.bloodPressure?.diastolic}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case 'alerts':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FaExclamationTriangle className="text-yellow-500 mr-3" />
                My Alerts ({alerts.length})
              </h2>

              {alerts.length === 0 ? (
                <div className="text-center py-12">
                  <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
                  <p className="text-xl text-gray-600">No alerts - You're doing great!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => {
                    const severityColors = {
                      critical: 'border-red-500 bg-red-50',
                      warning: 'border-yellow-500 bg-yellow-50',
                      info: 'border-blue-500 bg-blue-50'
                    };

                    return (
                      <div key={alert._id} className={`border-l-4 ${severityColors[alert.severity] || severityColors.info} p-4 rounded`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-gray-800">{alert.type}</h3>
                              <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${
                                alert.severity === 'critical' ? 'bg-red-200 text-red-800' :
                                alert.severity === 'warning' ? 'bg-yellow-200 text-yellow-800' :
                                'bg-blue-200 text-blue-800'
                              }`}>
                                {alert.severity}
                              </span>
                            </div>
                            <p className="text-gray-700">{alert.message}</p>
                            <p className="text-sm text-gray-500 mt-2 flex items-center">
                              <FaClock className="mr-1" />
                              {new Date(alert.createdAt).toLocaleString()}
                            </p>
                          </div>
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
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FaPrescriptionBottleAlt className="text-green-500 mr-3" />
                My Prescriptions
              </h2>

              {prescriptions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No prescriptions available</p>
              ) : (
                <div className="space-y-6">
                  {prescriptions.map((prescription) => (
                    <div key={prescription._id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Prescription by Dr. {prescription.doctorId?.userId?.profile?.firstName} {prescription.doctorId?.userId?.profile?.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Issued: {new Date(prescription.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                          Active
                        </span>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Medications:</h4>
                          <div className="space-y-2">
                            {prescription.medicines?.map((med, idx) => (
                              <div key={idx} className="bg-gray-50 p-3 rounded">
                                <p className="font-medium text-gray-800">{med.name} - {med.dose}</p>
                                <p className="text-sm text-gray-600">{med.frequency} for {med.durationDays} days</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {prescription.tests && prescription.tests.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Tests:</h4>
                            <ul className="list-disc list-inside text-gray-600">
                              {prescription.tests.map((test, idx) => (
                                <li key={idx}>{test}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {prescription.notes && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Notes:</h4>
                            <p className="text-gray-600">{prescription.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FaMoneyBillWave className="text-green-500 mr-3" />
                Billing & Invoices
              </h2>

              {invoices.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No invoices available</p>
              ) : (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice._id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">Invoice #{invoice._id.slice(-6)}</h3>
                          <p className="text-sm text-gray-500">
                            Issued: {new Date(invoice.issuedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {invoice.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        {invoice.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-gray-700">
                            <span>{item.label}</span>
                            <span className="font-medium">${item.amount.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex justify-between text-xl font-bold text-gray-800">
                          <span>Total:</span>
                          <span className="text-teal-600">${invoice.total.toFixed(2)}</span>
                        </div>
                      </div>

                      {invoice.attachmentUrl && (
                        <button className="mt-4 flex items-center text-teal-600 hover:text-teal-700 font-semibold">
                          <FaFilePdf className="mr-2" />
                          Download Invoice
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FaUser className="text-teal-500 mr-3" />
                My Profile
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-lg text-gray-900">{userInfo.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-lg text-gray-900">{userInfo.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient ID</label>
                  <p className="text-lg text-gray-900">{userInfo.patientId}</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
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
                {tab.id === 'alerts' && alerts.length > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {alerts.length}
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
              {alerts.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {alerts.length}
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
