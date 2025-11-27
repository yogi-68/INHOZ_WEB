import React from 'react';
import { FaUserInjured } from 'react-icons/fa';

const ManagePatients = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl shadow-xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Manage Patients</h1>
        <p className="text-blue-100 text-lg">Patient management and monitoring</p>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <FaUserInjured className="text-6xl text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Patient Management</h2>
        <p className="text-gray-600">Full patient management module coming soon...</p>
      </div>
    </div>
  );
};

export default ManagePatients;
