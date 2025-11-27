import React from 'react';
import { FaMoneyBillWave } from 'react-icons/fa';

const BillingManagement = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl shadow-xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Billing & Payments</h1>
        <p className="text-yellow-100 text-lg">Invoice generation and payment tracking</p>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <FaMoneyBillWave className="text-6xl text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Billing System</h2>
        <p className="text-gray-600">Comprehensive billing module coming soon...</p>
      </div>
    </div>
  );
};

export default BillingManagement;
