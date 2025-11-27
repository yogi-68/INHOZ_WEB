import React from 'react';
import { FaHospital } from 'react-icons/fa';

const DeviceManagement = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Device Management</h1>
        <p className="text-indigo-100 text-lg">Monitor and manage medical devices</p>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <FaHospital className="text-6xl text-indigo-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Device Monitoring</h2>
        <p className="text-gray-600">Device management system coming soon...</p>
      </div>
    </div>
  );
};

export default DeviceManagement;
