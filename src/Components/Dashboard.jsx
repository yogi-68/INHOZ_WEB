import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import PatientDetails from './PatientDetails';
import Vitals from './Vitals';
import PatientHistory from './PatientHistory';
import DoctorDashboard from './DoctorDashboard';
import Settings from './Settings';
import { useLanguage } from '../context/LanguageContext';
// Import other components as needed

const Dashboard = ({ onLogout }) => {
  const { translate } = useLanguage();
  const [activeTab, setActiveTab] = useState('patients');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // This effect ensures we redirect back to patients tab if vitals is selected without a patient
  useEffect(() => {
    if (activeTab === 'vitals' && !selectedPatient) {
      setActiveTab('patients');
    }
  }, [activeTab, selectedPatient]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Safe navigation to vitals - ensures a patient is selected
  const navigateToVitals = () => {
    if (selectedPatient) {
      setActiveTab('vitals');
    } else {
      // If no patient is selected, stay on patients tab
      setActiveTab('patients');
      // You could also add a notification here to inform the user
      alert(translate('selectPatientFirst'));
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'patients':
        return <PatientDetails 
          setActiveTab={setActiveTab} 
          setSelectedPatient={setSelectedPatient}
          isDarkMode={isDarkMode} 
        />;
      case 'vitals':
        // Only show vitals if a patient is selected
        if (!selectedPatient) {
          return <PatientDetails 
            setActiveTab={setActiveTab} 
            setSelectedPatient={setSelectedPatient}
            isDarkMode={isDarkMode} 
          />;
        }
        return <Vitals isDarkMode={isDarkMode} selectedPatient={selectedPatient} />;
      case 'history':
        return <PatientHistory />;
      case 'doctors':
        return <DoctorDashboard />;
      case 'settings':
        return <Settings onLogout={onLogout} />;
      default:
        return <div>{translate('selectTab')}</div>;
    }
  };

  const getTabTranslation = (tab) => {
    switch (tab) {
      case 'patients':
        return translate('patients');
      case 'vitals':
        return translate('vitals');
      case 'history':
        return translate('patientHistory');
      case 'doctors':
        return translate('doctorDashboard');
      case 'settings':
        return translate('settings');
      default:
        return tab;
    }
  };

  return (
    <div className={`flex min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode}
        navigateToVitals={navigateToVitals}
        hasSelectedPatient={!!selectedPatient}
      />
      <div className="flex-1 ml-20 p-6">
        <h1 className="text-3xl font-bold mb-6">
          {getTabTranslation(activeTab)} {translate('dashboard')}
          {activeTab === 'vitals' && selectedPatient ? `: ${selectedPatient.name}` : ''}
        </h1>
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;
