import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaHospital, FaUserMd, FaEdit, FaSave, FaUserPlus, FaGraduationCap, FaBriefcase, FaTimes, FaLanguage } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

const Settings = ({ onLogout }) => {
  const { language, translate, changeLanguage } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: '', problem: '' });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState({
    name: 'Dr. John Doe',
    email: 'john.doe@hospital.com',
    phone: '+1 (555) 123-4567',
    hospital: 'General Hospital',
    specialization: 'Cardiologist',
    education: 'MD from Harvard Medical School',
    experience: '15 years',
    profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg'
  });
  const [editedInfo, setEditedInfo] = useState({...doctorInfo});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedInfo(prevInfo => ({
      ...prevInfo,
      [name]: value
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setDoctorInfo(editedInfo);
    setIsEditing(false);
    // Here you would typically send the updated info to your backend
    console.log('Updated doctor info:', editedInfo);
  };

  const handleAddPatient = () => {
    setIsAddingPatient(true);
  };

  const handleNewPatientChange = (e) => {
    const { name, value } = e.target;
    setNewPatient(prevPatient => ({
      ...prevPatient,
      [name]: value
    }));
  };

  const handleAddNewPatient = () => {
    // Here you would typically send the new patient info to your backend
    console.log('New patient added:', newPatient);
    setIsAddingPatient(false);
    setNewPatient({ name: '', problem: '' });
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const languages = [
    { code: 'english', name: 'English' },
    { code: 'tamil', name: 'தமிழ் (Tamil)' },
    { code: 'hindi', name: 'हिंदी (Hindi)' },
    { code: 'kannada', name: 'ಕನ್ನಡ (Kannada)' },
    { code: 'urdu', name: 'اردو (Urdu)' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">{translate('doctorProfile')}</h2>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
            onClick={handleAddPatient}
          >
            <FaUserPlus className="mr-2" /> {translate('addNewPatient')}
          </button>
        </div>
        
        {/* Language Selection */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold mb-3 flex items-center">
            <FaLanguage className="mr-2 text-blue-500" /> {translate('languagePreference')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`py-2 px-3 rounded-md transition-colors ${
                  language === lang.code
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-1/3 mb-6 lg:mb-0">
            <img
              src={doctorInfo.profilePicture}
              alt="Doctor's profile"
              className="w-48 h-48 rounded-full mx-auto mb-4 border-4 border-blue-500"
            />
            {isEditing && (
              <div className="text-center">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="profilePicture">
                  {translate('profilePictureUrl')}
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="profilePicture"
                  type="text"
                  name="profilePicture"
                  value={editedInfo.profilePicture}
                  onChange={handleInputChange}
                />
              </div>
            )}
          </div>
          <div className="lg:w-2/3 lg:pl-6">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  <FaUser className="inline mr-2" /> {translate('name')}
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="name"
                  type="text"
                  name="name"
                  value={isEditing ? editedInfo.name : doctorInfo.name}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  <FaEnvelope className="inline mr-2" /> {translate('email')}
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="email"
                  type="email"
                  name="email"
                  value={isEditing ? editedInfo.email : doctorInfo.email}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
                  <FaPhone className="inline mr-2" /> {translate('phone')}
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="phone"
                  type="tel"
                  name="phone"
                  value={isEditing ? editedInfo.phone : doctorInfo.phone}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="hospital">
                  <FaHospital className="inline mr-2" /> {translate('hospital')}
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="hospital"
                  type="text"
                  name="hospital"
                  value={isEditing ? editedInfo.hospital : doctorInfo.hospital}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="specialization">
                  <FaUserMd className="inline mr-2" /> {translate('specialization')}
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="specialization"
                  type="text"
                  name="specialization"
                  value={isEditing ? editedInfo.specialization : doctorInfo.specialization}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="education">
                  <FaGraduationCap className="inline mr-2" /> {translate('education')}
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="education"
                  type="text"
                  name="education"
                  value={isEditing ? editedInfo.education : doctorInfo.education}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="experience">
                  <FaBriefcase className="inline mr-2" /> {translate('experience')}
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="experience"
                  type="text"
                  name="experience"
                  value={isEditing ? editedInfo.experience : doctorInfo.experience}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                />
              </div>
              <div className="flex items-center justify-between">
                {isEditing ? (
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
                    onClick={handleSave}
                  >
                    <FaSave className="mr-2" /> {translate('saveChanges')}
                  </button>
                ) : (
                  <button
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
                    onClick={handleEdit}
                  >
                    <FaEdit className="mr-2" /> {translate('editProfile')}
                  </button>
                )}
                <button
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="button"
                  onClick={onLogout}
                >
                  {translate('logout')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Add Patient Modal */}
      {isAddingPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">{translate('addNewPatient')}</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setIsAddingPatient(false)}
              >
                <FaTimes size={24} />
              </button>
            </div>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="patientName">
                  {translate('patientName')}
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="patientName"
                  type="text"
                  name="name"
                  value={newPatient.name}
                  onChange={handleNewPatientChange}
                  placeholder={translate('patientName')}
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="patientProblem">
                  {translate('patientProblem')}
                </label>
                <textarea
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="patientProblem"
                  name="problem"
                  value={newPatient.problem}
                  onChange={handleNewPatientChange}
                  placeholder={translate('patientProblem')}
                  rows="4"
                ></textarea>
              </div>
              <div className="flex justify-end">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="button"
                  onClick={handleAddNewPatient}
                >
                  {translate('submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {translate('patientAdded')}
        </div>
      )}
    </div>
  );
};

export default Settings;