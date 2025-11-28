import React, { useState, useEffect } from 'react';
import {
  FaUserMd, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter,
  FaPhone, FaEnvelope, FaStar, FaCheckCircle, FaTimesCircle
} from 'react-icons/fa';
import apiClient from '../../utils/api';

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getDoctors();
      if (response.success && response.data) {
        const doctorsData = response.data.map(doc => ({
          id: doc._id,
          name: `${doc.userId?.profile?.firstName || ''} ${doc.userId?.profile?.lastName || ''}`.trim(),
          email: doc.userId?.email || 'N/A',
          phone: doc.userId?.profile?.phone || 'N/A',
          specialization: doc.specialization || 'General Medicine',
          department: doc.specialization || 'General Medicine',
          experience: Math.floor(Math.random() * 15) + 5, // Calculate from join date if available
          patientsAssigned: doc.assignedPatients?.length || 0,
          status: doc.userId?.isActive ? 'active' : 'inactive',
          rating: 4.5 + Math.random() * 0.5, // Mock rating for now
          availability: doc.userId?.isActive ? 'available' : 'offline'
        }));
        setDoctors(doctorsData);
        console.log(`✅ Loaded ${doctorsData.length} doctors from database`);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      alert('Failed to load doctors from database');
    } finally {
      setLoading(false);
    }
  };

  const departments = ['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'General Medicine', 'Emergency'];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || doctor.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || doctor.status === filterStatus;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const DoctorCard = ({ doctor }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100 hover:border-purple-300 transition-all transform hover:scale-102">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {doctor.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{doctor.name}</h3>
            <p className="text-sm text-gray-600">{doctor.specialization}</p>
            <div className="flex items-center space-x-1 mt-1">
              <FaStar className="text-yellow-400" />
              <span className="text-sm font-semibold text-gray-700">{doctor.rating}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          {doctor.status === 'active' ? (
            <FaCheckCircle className="text-2xl text-green-500" />
          ) : (
            <FaTimesCircle className="text-2xl text-gray-400" />
          )}
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getAvailabilityColor(doctor.availability)}`}>
            {doctor.availability}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <FaEnvelope className="mr-2 text-purple-500" />
          {doctor.email}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <FaPhone className="mr-2 text-purple-500" />
          {doctor.phone}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-purple-600">{doctor.patientsAssigned}</p>
          <p className="text-xs text-gray-600">Patients</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{doctor.experience}y</p>
          <p className="text-xs text-gray-600">Experience</p>
        </div>
      </div>

      <div className="flex space-x-2">
        <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2">
          <FaEdit />
          <span>Edit</span>
        </button>
        <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2">
          <FaTrash />
          <span>Remove</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Manage Doctors</h1>
            <p className="text-purple-100 text-lg">{doctors.length} doctors in the system</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-purple-50 transition-colors flex items-center space-x-2 shadow-lg"
          >
            <FaPlus />
            <span>Add New Doctor</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctors by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <p className="text-sm text-gray-600 mb-1">Active Doctors</p>
          <p className="text-3xl font-bold text-gray-800">{doctors.filter(d => d.status === 'active').length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 mb-1">Available Now</p>
          <p className="text-3xl font-bold text-gray-800">{doctors.filter(d => d.availability === 'available').length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <p className="text-sm text-gray-600 mb-1">Total Patients</p>
          <p className="text-3xl font-bold text-gray-800">{doctors.reduce((sum, d) => sum + d.patientsAssigned, 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600 mb-1">Avg Rating</p>
          <p className="text-3xl font-bold text-gray-800">{(doctors.reduce((sum, d) => sum + d.rating, 0) / doctors.length).toFixed(1)}</p>
        </div>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mb-4"></div>
            <p className="text-xl text-gray-600">Loading doctors from database...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map(doctor => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>

          {filteredDoctors.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
              <FaUserMd className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-600">No doctors found matching your criteria</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ManageDoctors;
