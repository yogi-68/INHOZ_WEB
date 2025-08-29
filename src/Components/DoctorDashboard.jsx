import React, { useState, useEffect, useCallback } from 'react';
import { FaUserInjured, FaBed, FaUserCheck, FaFilePdf, FaUserPlus, FaTimes, FaPrescription, FaArrowLeft } from 'react-icons/fa';
import PrescriptionGenerator from './PrescriptionGenerator';

const StatCard = ({ icon: Icon, title, value, color }) => (
  <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${color}`}>
    <div className="flex items-center">
      <Icon className={`text-4xl mr-4 ${color.replace('border', 'text')}`} />
      <div>
        <h3 className="text-xl font-semibold text-gray-600">{title}</h3>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);

const PatientTable = ({ patients, onViewReport, onGeneratePrescription }) => (
  <div className="bg-white p-6 rounded-lg shadow-md mt-6">
    <h3 className="text-2xl font-semibold mb-4">Recent Patients</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-blue-500 text-white text-lg leading-normal">
            <th className="py-3 px-6 text-left">Name</th>
            <th className="py-3 px-6 text-left">Date Joined</th>
            <th className="py-3 px-6 text-left">Treatment</th>
            <th className="py-3 px-6 text-left">Status</th>
            <th className="py-3 px-6 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-base">
          {patients.map((patient, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
              <td className="py-3 px-6 text-left whitespace-nowrap">{patient.name}</td>
              <td className="py-3 px-6 text-left">{patient.dateJoined}</td>
              <td className="py-3 px-6 text-left">{patient.treatment}</td>
              <td className="py-3 px-6 text-left">
                <span className={`bg-${patient.status === 'Active' ? 'green' : 'blue'}-200 text-${patient.status === 'Active' ? 'green' : 'blue'}-600 py-1 px-3 rounded-full text-sm`}>
                  {patient.status}
                </span>
              </td>
              <td className="py-3 px-6 text-left space-x-2">
                <button
                  onClick={() => onViewReport(patient)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center transition duration-300"
                >
                  <FaFilePdf className="mr-2" />
                  View Report
                </button>
                <button
                  onClick={() => onGeneratePrescription(patient)}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded inline-flex items-center transition duration-300"
                >
                  <FaPrescription className="mr-2" />
                  Prescribe
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ReportModal = ({ patient, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
      <h2 className="text-2xl font-bold mb-4">Patient Report: {patient.name}</h2>
      <p className="mb-2"><strong>Date Joined:</strong> {patient.dateJoined}</p>
      <p className="mb-2"><strong>Treatment:</strong> {patient.treatment}</p>
      <p className="mb-2"><strong>Status:</strong> {patient.status}</p>
      <div className="mt-4">
        <h3 className="text-xl font-semibold mb-2">Medical History</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      </div>
      <div className="mt-4">
        <h3 className="text-xl font-semibold mb-2">Treatment Plan</h3>
        <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
      </div>
      <button
        onClick={onClose}
        className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
      >
        Close
      </button>
    </div>
  </div>
);

const AddPatientModal = ({ onClose, onAddPatient }) => {
  const [newPatient, setNewPatient] = useState({ name: '', dateJoined: '', treatment: '', status: 'Active' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddPatient(newPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Add New Patient</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={newPatient.name}
              onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dateJoined">
              Date Joined
            </label>
            <input
              type="date"
              id="dateJoined"
              value={newPatient.dateJoined}
              onChange={(e) => setNewPatient({...newPatient, dateJoined: e.target.value})}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="treatment">
              Treatment
            </label>
            <input
              type="text"
              id="treatment"
              value={newPatient.treatment}
              onChange={(e) => setNewPatient({...newPatient, treatment: e.target.value})}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Add Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DoctorDashboard = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);

  // This would typically come from an API or database
  const [doctorStats, setDoctorStats] = useState({
    totalPatients: 150,
    currentPatients: 12,
    dischargedPatients: 138,
  });

  const [recentPatients, setRecentPatients] = useState([
    { name: "John Doe", dateJoined: "2023-05-01", treatment: "Cardiac Care", status: "Active" },
    { name: "Jane Smith", dateJoined: "2023-04-28", treatment: "Orthopedic Surgery", status: "Discharged" },
    { name: "Alice Johnson", dateJoined: "2023-05-03", treatment: "Respiratory Therapy", status: "Active" },
    { name: "Bob Brown", dateJoined: "2023-04-25", treatment: "Neurology Consult", status: "Discharged" },
    { name: "Eva Williams", dateJoined: "2023-05-02", treatment: "Oncology Treatment", status: "Active" },
  ]);

  const handleViewReport = (patient) => {
    setSelectedPatient(patient);
  };

  const handleGeneratePrescription = (patient) => {
    setSelectedPatient(patient);
    setShowPrescription(true);
  };

  const handleAddPatient = (newPatient) => {
    setRecentPatients([newPatient, ...recentPatients]);
    setDoctorStats(prev => ({
      ...prev,
      totalPatients: prev.totalPatients + 1,
      currentPatients: prev.currentPatients + 1
    }));
  };

  const handleClosePrescription = useCallback(() => {
    setShowPrescription(false);
    setSelectedPatient(null);
  }, []);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && showPrescription) {
        handleClosePrescription();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showPrescription, handleClosePrescription]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Doctor's Dashboard</h2>
        <button
          onClick={() => setIsAddingPatient(true)}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded inline-flex items-center transition duration-300"
        >
          <FaUserPlus className="mr-2" />
          Add Patient
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={FaUserInjured} title="Total Patients" value={doctorStats.totalPatients} color="border-blue-500" />
        <StatCard icon={FaBed} title="Current Patients" value={doctorStats.currentPatients} color="border-green-500" />
        <StatCard icon={FaUserCheck} title="Discharged Patients" value={doctorStats.dischargedPatients} color="border-purple-500" />
      </div>
      <PatientTable 
        patients={recentPatients} 
        onViewReport={handleViewReport}
        onGeneratePrescription={handleGeneratePrescription}
      />
      {selectedPatient && !showPrescription && (
        <ReportModal patient={selectedPatient} onClose={() => setSelectedPatient(null)} />
      )}
      {selectedPatient && showPrescription && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto"
          onClick={handleClosePrescription}
        >
          <div 
            className="bg-white rounded-lg shadow-lg m-4 max-w-4xl w-full relative"
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
          >
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10 rounded-t-lg">
              <h2 className="text-2xl font-bold">Prescription for {selectedPatient.name}</h2>
              <button
                onClick={handleClosePrescription}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 text-xl p-2 rounded-full"
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              <PrescriptionGenerator patient={selectedPatient} />
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-between rounded-b-lg">
              <button
                onClick={handleClosePrescription}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center transition duration-300"
              >
                <FaArrowLeft className="mr-2" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
      {isAddingPatient && (
        <AddPatientModal onClose={() => setIsAddingPatient(false)} onAddPatient={handleAddPatient} />
      )}
    </div>
  );
};

export default DoctorDashboard;