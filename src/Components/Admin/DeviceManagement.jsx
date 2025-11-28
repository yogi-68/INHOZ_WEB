import React, { useState } from 'react';
import { FaHospital, FaCheckCircle, FaExclamationCircle, FaSearch } from 'react-icons/fa';

const DeviceManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock device data (replace with API call later)
  const devices = [
    { id: 'DEV-001', name: 'ECG Monitor', type: 'Cardiac', room: '301', status: 'active', lastSync: '2 min ago', battery: '85%', patient: 'John Doe' },
    { id: 'DEV-002', name: 'Pulse Oximeter', type: 'Respiratory', room: '302', status: 'active', lastSync: '1 min ago', battery: '92%', patient: 'Mary Wilson' },
    { id: 'DEV-003', name: 'BP Monitor', type: 'Cardiac', room: '303', status: 'maintenance', lastSync: '1 hour ago', battery: '45%', patient: 'N/A' },
    { id: 'DEV-004', name: 'Temperature Sensor', type: 'General', room: '304', status: 'active', lastSync: '3 min ago', battery: '78%', patient: 'Sarah Johnson' },
  ];

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         device.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         device.patient.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || device.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const activeCount = devices.filter(d => d.status === 'active').length;
  const maintenanceCount = devices.filter(d => d.status === 'maintenance').length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Device Management</h1>
        <p className="text-indigo-100 text-lg">Monitor and manage medical devices</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Devices</h3>
          <p className="text-3xl font-bold text-indigo-600">{devices.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Active</h3>
          <p className="text-3xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Maintenance</h3>
          <p className="text-3xl font-bold text-yellow-600">{maintenanceCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search devices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Battery</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Sync</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDevices.map((device) => (
                <tr key={device.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{device.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{device.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{device.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{device.room}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{device.patient}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{device.battery}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{device.lastSync}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      device.status === 'active' ? 'bg-green-100 text-green-800' :
                      device.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {device.status === 'active' ? <FaCheckCircle className="inline mr-1" /> : <FaExclamationCircle className="inline mr-1" />}
                      {device.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DeviceManagement;
