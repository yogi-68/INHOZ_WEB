import React, { useState, useEffect } from 'react';
import { FaUsers, FaUserMd, FaBed, FaExclamationTriangle, FaMoneyBillWave, FaPlus, FaTrash, FaEdit, FaSearch, FaChartLine, FaFileInvoiceDollar, FaCog, FaHistory, FaServer, FaBrain, FaCheckCircle, FaTimesCircle, FaDownload, FaBell } from 'react-icons/fa';
import apiClient from '../utils/api';
import { getSocket, initializeSocket } from '../utils/socket';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// KPI Card Component
const KPICard = ({ icon: Icon, title, value, subtitle, color, onClick, trend }) => (
  <div 
    className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${color} cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center flex-1">
        <Icon className={`text-5xl mr-4 ${color.replace('border', 'text')}`} />
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase">{title}</h3>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
      {trend && (
        <div className={`text-sm font-semibold ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  </div>
);

// Mini Alert Feed Component
const MiniAlertFeed = ({ alerts, onAlertClick }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-xl font-bold mb-4 flex items-center">
      <FaBell className="mr-2 text-red-500" />
      Recent Critical Alerts (Last 5)
    </h3>
    {alerts.length === 0 ? (
      <div className="text-center py-8">
        <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-3" />
        <p className="text-gray-500">No critical alerts</p>
      </div>
    ) : (
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            onClick={() => onAlertClick(alert)}
            className={`p-4 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition ${
              alert.severity === 'critical' ? 'bg-red-50 border-red-500' :
              alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-500' :
              'bg-blue-50 border-blue-500'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">{alert.type}</h4>
                <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span>Patient: {alert.patientName}</span>
                  <span>Room: {alert.room}</span>
                  <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                alert.severity === 'critical' ? 'bg-red-500 text-white' :
                alert.severity === 'warning' ? 'bg-yellow-500 text-white' :
                'bg-blue-500 text-white'
              }`}>
                {alert.severity.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Revenue Chart Component
const RevenueChart = ({ data }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-xl font-bold mb-4">Revenue Trend (Last 7 Days)</h3>
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value) => `$${value}`} />
        <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

// Occupancy Chart Component
const OccupancyChart = ({ data }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-xl font-bold mb-4">Room Occupancy by Floor</h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="floor" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="occupied" fill="#3b82f6" name="Occupied" />
        <Bar dataKey="available" fill="#d1d5db" name="Available" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// Doctor Management Component
const DoctorManagement = ({ doctors, onCreateDoctor, onEditDoctor, onDeactivateDoctor }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [doctorForm, setDoctorForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    specialization: '',
    phone: '',
  });

  const specialties = ['all', ...new Set(doctors.map(d => d.specialization))];

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = filterSpecialty === 'all' || doc.specialization === filterSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingDoctor) {
      await onEditDoctor(editingDoctor.id, doctorForm);
    } else {
      await onCreateDoctor(doctorForm);
    }
    setShowModal(false);
    setEditingDoctor(null);
    setDoctorForm({ email: '', password: '', firstName: '', lastName: '', specialization: '', phone: '' });
  };

  const openEditModal = (doctor) => {
    setEditingDoctor(doctor);
    setDoctorForm({
      firstName: doctor.firstName || '',
      lastName: doctor.lastName || '',
      email: doctor.email,
      password: '',
      specialization: doctor.specialization,
      phone: doctor.phone,
    });
    setShowModal(true);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold">Doctor Management</h3>
        <div className="flex gap-3">
          <button
            onClick={() => alert('Export feature coming soon')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg inline-flex items-center transition shadow-md"
          >
            <FaDownload className="mr-2" />
            Export
          </button>
          <button
            onClick={() => {
              setEditingDoctor(null);
              setDoctorForm({ email: '', password: '', firstName: '', lastName: '', specialization: '', phone: '' });
              setShowModal(true);
            }}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg inline-flex items-center transition shadow-md hover:shadow-lg"
          >
            <FaPlus className="mr-2" />
            Add Doctor
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterSpecialty}
          onChange={(e) => setFilterSpecialty(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {specialties.map(spec => (
            <option key={spec} value={spec}>
              {spec === 'all' ? 'All Specialties' : spec}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <th className="py-4 px-6 text-left font-semibold">Name</th>
              <th className="py-4 px-6 text-left font-semibold">Specialty</th>
              <th className="py-4 px-6 text-left font-semibold">Assigned Patients</th>
              <th className="py-4 px-6 text-left font-semibold">Status</th>
              <th className="py-4 px-6 text-left font-semibold">Contact</th>
              <th className="py-4 px-6 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDoctors.map((doctor, index) => (
              <tr key={doctor.id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition`}>
                <td className="py-4 px-6">
                  <div className="font-semibold text-gray-800">{doctor.name}</div>
                  <div className="text-sm text-gray-500">{doctor.email}</div>
                </td>
                <td className="py-4 px-6">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {doctor.specialization}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className="font-bold text-lg text-gray-700">{doctor.patientCount}</span>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center w-fit ${
                    doctor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {doctor.status === 'active' ? <FaCheckCircle className="mr-1" /> : <FaTimesCircle className="mr-1" />}
                    {doctor.status || 'active'}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">{doctor.phone}</td>
                <td className="py-4 px-6">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => openEditModal(doctor)}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center transition"
                      title="Edit Doctor"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => onDeactivateDoctor(doctor.id)}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded inline-flex items-center transition"
                      title="Deactivate (Archived with Audit)"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full max-h-screen overflow-y-auto">
            <h2 className="text-3xl font-bold mb-6">{editingDoctor ? 'Edit Doctor' : 'Create New Doctor'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">First Name *</label>
                  <input
                    type="text"
                    required
                    value={doctorForm.firstName}
                    onChange={(e) => setDoctorForm({ ...doctorForm, firstName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={doctorForm.lastName}
                    onChange={(e) => setDoctorForm({ ...doctorForm, lastName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={doctorForm.email}
                  onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {!editingDoctor && (
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Password *</label>
                  <input
                    type="password"
                    required={!editingDoctor}
                    value={doctorForm.password}
                    onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Specialization *</label>
                  <input
                    type="text"
                    required
                    value={doctorForm.specialization}
                    onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                    placeholder="e.g., Cardiology"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={doctorForm.phone}
                    onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingDoctor(null);
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition"
                >
                  {editingDoctor ? 'Update Doctor' : 'Create Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Patient Management Component  
const PatientManagement = ({ patients, onAssignDoctor, doctors }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.hospitalId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || patient.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAssign = async () => {
    if (selectedPatient && selectedDoctorId) {
      await onAssignDoctor(selectedPatient.id, selectedDoctorId);
      setShowAssignModal(false);
      setSelectedPatient(null);
      setSelectedDoctorId('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h3 className="text-2xl font-bold mb-6">Patient Management (System-Wide)</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or hospital ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="discharged">Discharged</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <th className="py-4 px-6 text-left font-semibold">Patient</th>
              <th className="py-4 px-6 text-left font-semibold">Hospital ID / Room</th>
              <th className="py-4 px-6 text-left font-semibold">Assigned Doctor</th>
              <th className="py-4 px-6 text-left font-semibold">Status</th>
              <th className="py-4 px-6 text-left font-semibold">Last Vitals</th>
              <th className="py-4 px-6 text-left font-semibold">Alerts</th>
              <th className="py-4 px-6 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient, index) => (
              <tr key={patient.id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition`}>
                <td className="py-4 px-6">
                  <div className="font-semibold text-gray-800">{patient.name}</div>
                  <div className="text-sm text-gray-500">Age: {patient.age || 'N/A'}</div>
                </td>
                <td className="py-4 px-6">
                  <div className="font-medium text-gray-700">{patient.hospitalId}</div>
                  <div className="text-sm text-gray-500">Room {patient.room}</div>
                </td>
                <td className="py-4 px-6">
                  <div className="text-sm text-gray-700">{patient.doctor || 'Unassigned'}</div>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    patient.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {patient.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">
                  {patient.lastVitalsTime ? new Date(patient.lastVitalsTime).toLocaleString() : 'N/A'}
                </td>
                <td className="py-4 px-6">
                  {patient.unacknowledgedAlerts > 0 && (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold inline-flex items-center">
                      <FaExclamationTriangle className="mr-1" />
                      {patient.unacknowledgedAlerts}
                    </span>
                  )}
                </td>
                <td className="py-4 px-6">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedPatient(patient);
                        setShowAssignModal(true);
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition"
                    >
                      Assign Doctor
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAssignModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Assign Doctor to {selectedPatient.name}</h2>
            <p className="text-sm text-gray-600 mb-6">This action will be logged in the audit trail.</p>
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Select Doctor</label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choose Doctor --</option>
                {doctors.map(doc => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} - {doc.specialization} ({doc.patientCount} patients)
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedPatient(null);
                  setSelectedDoctorId('');
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedDoctorId}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign & Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Admin Dashboard Component
const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    activePatients: 0,
    criticalAlerts: 0,
    doctorsOnDuty: 0,
    revenueToday: 0,
    revenueMonth: 0,
    devicesOffline: 0,
    totalPatients: 0,
  });

  const [recentAlerts, setRecentAlerts] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [occupancyData, setOccupancyData] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Setup Socket.IO for real-time updates
  useEffect(() => {
    const token = apiClient.getToken();
    if (!token) return;

    try {
      initializeSocket(token);
      const socket = getSocket();

      // Subscribe to admin room
      socket.emit('join:room', 'admin');
      console.log('📡 Admin subscribed to real-time updates');

      socket.on('alert:new', (alert) => {
        console.log('🚨 New alert in admin room:', alert);
        if (alert.severity === 'critical') {
          setStats(prev => ({ ...prev, criticalAlerts: prev.criticalAlerts + 1 }));
          setRecentAlerts(prev => [{
            id: alert._id,
            type: alert.type,
            message: alert.message,
            severity: alert.severity,
            patientName: alert.patientId?.userId?.profile ? 
              `${alert.patientId.userId.profile.firstName} ${alert.patientId.userId.profile.lastName}` :
              'Patient',
            room: alert.patientId?.roomNo || 'N/A',
            timestamp: alert.createdAt,
          }, ...prev.slice(0, 4)]);
        }
      });

      socket.on('device:offline', (device) => {
        console.log('📴 Device offline:', device);
        setStats(prev => ({ ...prev, devicesOffline: prev.devicesOffline + 1 }));
      });

      socket.on('device:online', (device) => {
        console.log('✅ Device online:', device);
        setStats(prev => ({ ...prev, devicesOffline: Math.max(0, prev.devicesOffline - 1) }));
      });

      socket.on('revenue:updated', (data) => {
        console.log('💰 Revenue updated:', data);
        setStats(prev => ({ ...prev, revenueToday: data.today, revenueMonth: data.month }));
      });

      socket.on('assignment:created', (data) => {
        console.log('👨‍⚕️ Assignment created:', data);
        fetchDashboardData(); // Refresh data
      });

      return () => {
        socket.off('alert:new');
        socket.off('device:offline');
        socket.off('device:online');
        socket.off('revenue:updated');
        socket.off('assignment:created');
      };
    } catch (err) {
      console.error('Socket.IO setup error:', err);
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const dashboardResponse = await apiClient.getAdminDashboard();
      const dashboardData = dashboardResponse?.data || {};

      setStats({
        activePatients: dashboardData.activePatients || 0,
        criticalAlerts: dashboardData.criticalAlerts || 0,
        doctorsOnDuty: dashboardData.totalDoctors || 0,
        revenueToday: dashboardData.revenueToday || 0,
        revenueMonth: dashboardData.totalRevenue || 0,
        devicesOffline: dashboardData.devicesOffline || 0,
        totalPatients: dashboardData.totalPatients || 0,
      });

      // Fetch revenue data (last 7 days)
      try {
        const now = new Date();
        const revenueChartData = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          revenueChartData.push({
            date: date.toLocaleDateString('en-US', { weekday: 'short' }),
            revenue: Math.round(Math.random() * 5000 + 10000), // Will be replaced with actual API data
          });
        }
        setRevenueData(revenueChartData);
      } catch (err) {
        console.error('Error generating revenue data:', err);
      }

      // Fetch occupancy data from patients
      try {
        const occupancyByFloor = {};
        patientsData.forEach(patient => {
          if (patient.roomNo) {
            const floor = patient.roomNo.toString().charAt(0) || '1';
            if (!occupancyByFloor[floor]) {
              occupancyByFloor[floor] = { occupied: 0, total: 15 };
            }
            if (patient.status === 'admitted' || patient.status === 'monitoring') {
              occupancyByFloor[floor].occupied++;
            }
          }
        });

        const occupancyChartData = Object.keys(occupancyByFloor)
          .sort()
          .map(floor => ({
            floor: `${floor}${floor === '1' ? 'st' : floor === '2' ? 'nd' : floor === '3' ? 'rd' : 'th'} Floor`,
            occupied: occupancyByFloor[floor].occupied,
            available: occupancyByFloor[floor].total - occupancyByFloor[floor].occupied,
          }));

        setOccupancyData(occupancyChartData.length > 0 ? occupancyChartData : [
          { floor: '1st Floor', occupied: 0, available: 15 },
          { floor: '2nd Floor', occupied: 0, available: 15 },
          { floor: '3rd Floor', occupied: 0, available: 15 },
          { floor: '4th Floor', occupied: 0, available: 15 },
        ]);
      } catch (err) {
        console.error('Error calculating occupancy:', err);
      }

      const doctorsResponse = await apiClient.getDoctors();
      const doctorsData = doctorsResponse?.data || [];
      setDoctors(doctorsData.map(doc => ({
        id: doc._id,
        name: `${doc.userId.profile.firstName} ${doc.userId.profile.lastName}`,
        firstName: doc.userId.profile.firstName,
        lastName: doc.userId.profile.lastName,
        email: doc.userId.email,
        specialization: doc.specialization || 'General',
        phone: doc.userId.profile.phone || 'N/A',
        patientCount: doc.patientCount || 0,
        status: doc.status || 'active',
      })));

      const patientsResponse = await apiClient.getAdminPatients();
      const patientsData = patientsResponse?.data || [];
      setPatients(patientsData.map(patient => ({
        id: patient._id,
        name: `${patient.userId.profile.firstName} ${patient.userId.profile.lastName}`,
        hospitalId: patient.hospitalId,
        room: patient.roomNo,
        age: patient.userId.profile.age || 'N/A',
        doctor: patient.doctorId?.userId?.profile ? 
          `${patient.doctorId.userId.profile.firstName} ${patient.doctorId.userId.profile.lastName}` : 
          'Unassigned',
        status: patient.status,
        unacknowledgedAlerts: patient.unacknowledgedAlerts || 0,
        lastVitalsTime: patient.latestVitals?.timestamp || null,
      })));

      const invoicesResponse = await apiClient.getInvoices();
      const invoicesData = invoicesResponse?.data || [];
      setInvoices(invoicesData.map(invoice => ({
        id: invoice._id,
        invoiceId: invoice.invoiceId || `INV-${invoice._id.slice(-6).toUpperCase()}`,
        patientName: invoice.patientId?.userId?.profile ? 
          `${invoice.patientId.userId.profile.firstName} ${invoice.patientId.userId.profile.lastName}` : 
          'Unknown Patient',
        amount: invoice.totalAmount || 0,
        date: new Date(invoice.createdAt || invoice.issuedAt || Date.now()).toLocaleDateString(),
        status: invoice.status || invoice.paymentStatus || 'pending',
      })));

      // Fetch recent alerts for admin
      try {
        const alertsResponse = await apiClient.getDoctorAlerts({ limit: 5 });
        const alertsData = alertsResponse?.data || [];
        setRecentAlerts(alertsData.slice(0, 5).map(alert => ({
          id: alert._id,
          type: alert.type || 'Alert',
          message: alert.message || alert.description || 'Alert triggered',
          severity: alert.severity || 'warning',
          patientName: alert.patientId?.userId?.profile ?
            `${alert.patientId.userId.profile.firstName} ${alert.patientId.userId.profile.lastName}` :
            'Unknown Patient',
          room: alert.patientId?.roomNo || 'N/A',
          timestamp: alert.triggeredAt || alert.createdAt || new Date(),
        })));
      } catch (alertErr) {
        console.error('Error fetching alerts:', alertErr);
        setRecentAlerts([]);
      }

    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDoctor = async (doctorData) => {
    try {
      await apiClient.createDoctor(doctorData);
      await fetchDashboardData();
      alert('✅ Doctor created successfully! Action logged to audit trail.');
    } catch (err) {
      console.error('Error creating doctor:', err);
      alert('❌ Failed to create doctor: ' + err.message);
    }
  };

  const handleEditDoctor = async (doctorId, doctorData) => {
    try {
      await apiClient.updateDoctor(doctorId, doctorData);
      await fetchDashboardData();
      alert('✅ Doctor updated successfully! Action logged to audit trail.');
    } catch (err) {
      console.error('Error updating doctor:', err);
      alert('❌ Failed to update doctor: ' + err.message);
    }
  };

  const handleDeactivateDoctor = async (doctorId) => {
    if (!window.confirm('⚠️ Archive this doctor? This action will be logged in the audit trail and can be reviewed later.')) return;

    try {
      await apiClient.deleteDoctor(doctorId);
      await fetchDashboardData();
      alert('✅ Doctor archived successfully! Audit log created.');
    } catch (err) {
      console.error('Error deactivating doctor:', err);
      alert('❌ Failed to archive doctor: ' + err.message);
    }
  };

  const handleAssignDoctor = async (patientId, doctorId) => {
    try {
      await apiClient.assignDoctor({ patientId, doctorId });
      await fetchDashboardData();
      alert('✅ Doctor assigned successfully! Patient and doctor notified.');
    } catch (err) {
      console.error('Error assigning doctor:', err);
      alert('❌ Failed to assign doctor: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-2xl text-gray-600 font-semibold">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg shadow-md mb-4">
          <p className="font-bold text-lg">⚠️ Error Loading Dashboard</p>
          <p className="mt-2">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-bold text-gray-800">Admin Dashboard</h2>
          <p className="text-gray-600 mt-2">System-wide hospital management and monitoring</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
        <KPICard 
          icon={FaBed} 
          title="Active Patients" 
          value={stats.activePatients} 
          subtitle={`${stats.totalPatients} total`}
          color="border-blue-500"
        />
        <KPICard 
          icon={FaExclamationTriangle} 
          title="Critical Alerts" 
          value={stats.criticalAlerts} 
          subtitle="Requires attention"
          color="border-red-500"
        />
        <KPICard 
          icon={FaUserMd} 
          title="Doctors On Duty" 
          value={stats.doctorsOnDuty} 
          color="border-green-500"
        />
        <KPICard 
          icon={FaMoneyBillWave} 
          title="Revenue (Today)" 
          value={`$${stats.revenueToday.toLocaleString()}`} 
          color="border-yellow-500"
        />
        <KPICard 
          icon={FaChartLine} 
          title="Revenue (Month)" 
          value={`$${stats.revenueMonth.toLocaleString()}`} 
          trend={12}
          color="border-purple-500"
        />
        <KPICard 
          icon={FaServer} 
          title="Devices Offline" 
          value={stats.devicesOffline} 
          subtitle={stats.devicesOffline > 0 ? 'Check system' : 'All online'}
          color={stats.devicesOffline > 0 ? 'border-red-500' : 'border-green-500'}
        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RevenueChart data={revenueData} />
        <OccupancyChart data={occupancyData} />
      </div>
      
      {/* Alert Feed */}
      <div className="mb-6">
        <MiniAlertFeed alerts={recentAlerts} onAlertClick={(alert) => console.log('Alert clicked:', alert)} />
      </div>

      {/* Doctor Management */}
      <div className="mb-6">
        <DoctorManagement 
          doctors={doctors} 
          onCreateDoctor={handleCreateDoctor}
          onEditDoctor={handleEditDoctor}
          onDeactivateDoctor={handleDeactivateDoctor}
        />
      </div>

      {/* Patient Management */}
      <div className="mb-6">
        <PatientManagement 
          patients={patients}
          doctors={doctors}
          onAssignDoctor={handleAssignDoctor}
        />
      </div>

      {/* Invoice Management */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Invoice Management</h3>
          <button 
            onClick={() => alert('Export CSV feature coming soon')}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg inline-flex items-center transition shadow-md"
          >
            <FaDownload className="mr-2" />
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <th className="py-4 px-6 text-left font-semibold">Invoice ID</th>
                <th className="py-4 px-6 text-left font-semibold">Patient</th>
                <th className="py-4 px-6 text-left font-semibold">Amount</th>
                <th className="py-4 px-6 text-left font-semibold">Date</th>
                <th className="py-4 px-6 text-left font-semibold">Status</th>
                <th className="py-4 px-6 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice, index) => (
                <tr key={invoice.id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition`}>
                  <td className="py-4 px-6 font-medium">{invoice.invoiceId}</td>
                  <td className="py-4 px-6">{invoice.patientName}</td>
                  <td className="py-4 px-6 font-bold text-green-600">${invoice.amount}</td>
                  <td className="py-4 px-6 text-gray-600">{invoice.date}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition inline-flex items-center">
                      <FaFileInvoiceDollar className="mr-2" />
                      View PDF
                    </button>
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

export default AdminDashboard;
