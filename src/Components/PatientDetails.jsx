import React, { useState, useEffect, useRef } from 'react';
import { FaHeartbeat, FaThermometer, FaArrowRight, FaExclamationTriangle, FaBell, FaVideo, FaVideoSlash, FaUser, FaHistory } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import CustomYoloDetector from '../utils/customYoloDetector';
import { useNavigate } from 'react-router-dom';

// Replace random patient generation with specific patient data
const patientData = [
  {
    id: 1,
    name: 'John Doe',
    age: 45,
    gender: 'Male',
    room: '101',
    condition: 'Stable',
    lastCheck: '10:30 AM'
  },
  {
    id: 2,
    name: 'Jane Smith',
    age: 32,
    gender: 'Female',
    room: '203',
    condition: 'Critical',
    lastCheck: '11:15 AM'
  },
  {
    id: 3,
    name: 'Bob Johnson',
    age: 55,
    gender: 'Male',
    room: '305',
    condition: 'Stable',
    lastCheck: '09:45 AM'
  }
];

const generateRandomVitals = () => ({
  temperature: (Math.random() * (40 - 35) + 35).toFixed(1),
  heartRate: Math.floor(Math.random() * (120 - 60) + 60),
});

// Use the defined patient data array instead of generating random patients
const patients = patientData;

const PatientCard = ({ patient, onClick }) => {
  const { translate } = useLanguage();
  const navigate = useNavigate();
  
  const getConditionColor = (condition) => {
    switch (condition.toLowerCase()) {
      case 'critical':
        return 'text-red-500';
      case 'stable':
        return 'text-green-500';
      default:
        return 'text-yellow-500';
    }
  };

  const handleHistoryClick = () => {
    navigate('/history', { state: { patient } });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FaUser className="text-blue-500 text-2xl mr-3" />
          <div>
            <h3 className="text-xl font-semibold">{patient.name}</h3>
            <p className="text-gray-600">{patient.age} years, {patient.gender}</p>
          </div>
        </div>
        <span className={`font-semibold ${getConditionColor(patient.condition)}`}>
          {patient.condition}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-gray-600">{translate('room')}</p>
          <p className="font-semibold">{patient.room}</p>
        </div>
        <div>
          <p className="text-gray-600">{translate('lastCheck')}</p>
          <p className="font-semibold">{patient.lastCheck}</p>
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onClick(patient)}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center justify-center transition duration-300"
        >
          <FaHeartbeat className="mr-2" />
          {translate('viewVitals')}
        </button>
        <button
          onClick={handleHistoryClick}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center justify-center transition duration-300"
        >
          <FaHistory className="mr-2" />
          {translate('history')}
        </button>
      </div>
    </div>
  );
};

const PatientDetails = ({ isDarkMode }) => {
  const { translate } = useLanguage();
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState(null);

  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
    navigate('/vitals', { state: { patient } });
  };

  return (
    <div className={`${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold relative">
          {translate('patients')}
          <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-blue-500"></span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patientData.map(patient => (
          <PatientCard
            key={patient.id}
            patient={patient}
            onClick={handlePatientClick}
          />
        ))}
      </div>
    </div>
  );
};

export default PatientDetails;