import React from 'react';
import { FaHistory } from 'react-icons/fa';

const AuditLogs = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-gray-700 to-gray-900 rounded-xl shadow-xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Audit Logs</h1>
        <p className="text-gray-300 text-lg">System activity and security logs</p>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <FaHistory className="text-6xl text-gray-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Activity Logs</h2>
        <p className="text-gray-600">Audit log viewer coming soon...</p>
      </div>
    </div>
  );
};

export default AuditLogs;
