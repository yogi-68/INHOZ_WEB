import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaClock, FaUserMd, FaCheckCircle } from 'react-icons/fa';
import apiClient from '../../utils/api';

const AlertsMonitoring = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('all');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      // Fetch all alerts from all doctors (admin view)
      const response = await apiClient.getDoctorAlerts();
      if (response.success) {
        setAlerts(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAlerts = alerts.filter(alert => 
    filterSeverity === 'all' || alert.severity === filterSeverity
  );

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl shadow-xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Alerts Monitoring</h1>
        <p className="text-red-100 text-lg">Real-time system-wide alert monitoring</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Alerts</h3>
          <p className="text-3xl font-bold text-red-600">{alerts.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Critical</h3>
          <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Warnings</h3>
          <p className="text-3xl font-bold text-yellow-600">{warningCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">All Alerts</h2>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
          >
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
        </div>

        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12">
            <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No alerts - All systems normal!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => {
              const severityColors = {
                critical: 'border-red-500 bg-red-50',
                warning: 'border-yellow-500 bg-yellow-50',
                info: 'border-blue-500 bg-blue-50'
              };

              const patientName = `${alert.patientId?.userId?.profile?.firstName || 'Unknown'} ${alert.patientId?.userId?.profile?.lastName || 'Patient'}`;

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
                      <p className="text-gray-700 mb-2">{alert.message}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span><FaUserMd className="inline mr-1" />Patient: {patientName}</span>
                        <span><FaClock className="inline mr-1" />{new Date(alert.createdAt).toLocaleString()}</span>
                      </div>
                      {alert.vitalSnapshot && (
                        <div className="mt-2 text-sm text-gray-600 bg-white p-2 rounded">
                          {alert.vitalSnapshot.heartRate && `HR: ${alert.vitalSnapshot.heartRate} bpm | `}
                          {alert.vitalSnapshot.spO2 && `SpO2: ${alert.vitalSnapshot.spO2}% | `}
                          {alert.vitalSnapshot.temperature && `Temp: ${alert.vitalSnapshot.temperature}°C`}
                        </div>
                      )}
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
};

export default AlertsMonitoring;
