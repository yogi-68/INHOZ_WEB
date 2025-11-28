import React, { useState, useEffect } from 'react';
import { FaUserInjured, FaSearch, FaEye, FaUserMd, FaPlus, FaTimes } from 'react-icons/fa';
import apiClient from '../../utils/api';

const ManagePatients = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [newPatient, setNewPatient] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    age: '',
    gender: 'male',
    roomNo: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });
  const [assignDoctorId, setAssignDoctorId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [patientsRes, doctorsRes] = await Promise.all([
        apiClient.getAdminPatients(),
        apiClient.getDoctors()
      ]);
      
      if (patientsRes.success) setPatients(patientsRes.data || []);
      if (doctorsRes.success) setDoctors(doctorsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.createPatient(newPatient);
      if (response.success) {
        await fetchData();
        setShowAddModal(false);
        setNewPatient({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          phone: '',
          age: '',
          gender: 'male',
          roomNo: '',
          emergencyContactName: '',
          emergencyContactPhone: ''
        });
      }
    } catch (error) {
      console.error('Error adding patient:', error);
      alert('Failed to add patient');
    }
  };

  const handleAssignDoctor = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.assignDoctor({
        patientId: selectedPatient._id,
        doctorId: assignDoctorId
      });
      if (response.success) {
        await fetchData();
        setShowAssignModal(false);
        setSelectedPatient(null);
        setAssignDoctorId('');
      }
    } catch (error) {
      console.error('Error assigning doctor:', error);
      alert('Failed to assign doctor');
    }
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.userId?.profile?.firstName} ${patient.userId?.profile?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.hospitalId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Manage Patients</h1>
            <p className="text-blue-100 text-lg">Total: {patients.length} patients</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center space-x-2"
          >
            <FaPlus />
            <span>Add Patient</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="mb-6">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or hospital ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hospital ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age/Gender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr key={patient._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {patient.hospitalId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.userId?.profile?.firstName} {patient.userId?.profile?.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.age} / {patient.gender}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.roomNo || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.assignedDoctorId?.userId?.profile?.firstName} {patient.assignedDoctorId?.userId?.profile?.lastName || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      patient.status === 'admitted' ? 'bg-green-100 text-green-800' :
                      patient.status === 'monitoring' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => {
                        setSelectedPatient(patient);
                        setShowAssignModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      <FaUserMd className="inline mr-1" />
                      Assign Doctor
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Add New Patient</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes size={24} />
              </button>
            </div>
            <form onSubmit={handleAddPatient} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={newPatient.email}
                  onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                  className="px-4 py-2 border rounded-lg"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newPatient.password}
                  onChange={(e) => setNewPatient({...newPatient, password: e.target.value})}
                  className="px-4 py-2 border rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="First Name"
                  value={newPatient.firstName}
                  onChange={(e) => setNewPatient({...newPatient, firstName: e.target.value})}
                  className="px-4 py-2 border rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={newPatient.lastName}
                  onChange={(e) => setNewPatient({...newPatient, lastName: e.target.value})}
                  className="px-4 py-2 border rounded-lg"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                  className="px-4 py-2 border rounded-lg"
                  required
                />
                <input
                  type="number"
                  placeholder="Age"
                  value={newPatient.age}
                  onChange={(e) => setNewPatient({...newPatient, age: e.target.value})}
                  className="px-4 py-2 border rounded-lg"
                  required
                />
                <select
                  value={newPatient.gender}
                  onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <input
                  type="text"
                  placeholder="Room No"
                  value={newPatient.roomNo}
                  onChange={(e) => setNewPatient({...newPatient, roomNo: e.target.value})}
                  className="px-4 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Emergency Contact Name"
                  value={newPatient.emergencyContactName}
                  onChange={(e) => setNewPatient({...newPatient, emergencyContactName: e.target.value})}
                  className="px-4 py-2 border rounded-lg"
                />
                <input
                  type="tel"
                  placeholder="Emergency Contact Phone"
                  value={newPatient.emergencyContactPhone}
                  onChange={(e) => setNewPatient({...newPatient, emergencyContactPhone: e.target.value})}
                  className="px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Doctor Modal */}
      {showAssignModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Assign Doctor</h2>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes size={24} />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Patient: {selectedPatient.userId?.profile?.firstName} {selectedPatient.userId?.profile?.lastName}
            </p>
            <form onSubmit={handleAssignDoctor} className="space-y-4">
              <select
                value={assignDoctorId}
                onChange={(e) => setAssignDoctorId(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                required
              >
                <option value="">Select a doctor...</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    Dr. {doctor.userId?.profile?.firstName} {doctor.userId?.profile?.lastName} - {doctor.specialty}
                  </option>
                ))}
              </select>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePatients;
