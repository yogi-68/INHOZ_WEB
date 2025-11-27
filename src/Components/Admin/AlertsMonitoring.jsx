import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const AlertsMonitoring = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl shadow-xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Alerts Monitoring</h1>
        <p className="text-red-100 text-lg">Real-time system-wide alert monitoring</p>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Alert System</h2>
        <p className="text-gray-600">Alert monitoring dashboard coming soon...</p>
      </div>
    </div>
  );
};

export default AlertsMonitoring;
