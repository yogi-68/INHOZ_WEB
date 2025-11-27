import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserShield, FaUserMd, FaUser, FaHospital } from 'react-icons/fa';

const RoleSelector = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'admin',
      title: 'Administrator',
      description: 'System management and oversight',
      icon: FaUserShield,
      color: 'from-purple-600 to-purple-800',
      hoverColor: 'hover:from-purple-700 hover:to-purple-900',
      path: '/login/admin'
    },
    {
      id: 'doctor',
      title: 'Doctor',
      description: 'Patient care and medical records',
      icon: FaUserMd,
      color: 'from-blue-600 to-blue-800',
      hoverColor: 'hover:from-blue-700 hover:to-blue-900',
      path: '/login/doctor'
    },
    {
      id: 'patient',
      title: 'Patient',
      description: 'Access your health information',
      icon: FaUser,
      color: 'from-teal-600 to-teal-800',
      hoverColor: 'hover:from-teal-700 hover:to-teal-900',
      path: '/login/patient'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <FaHospital className="text-6xl text-blue-600 mr-4" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              INHOZ
            </h1>
          </div>
          <h2 className="text-3xl font-semibold text-gray-800 mb-2">Hospital Management System</h2>
          <p className="text-gray-600 text-lg">Select your role to continue</p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => navigate(role.path)}
              className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
            >
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-transparent hover:border-blue-400 transition-all duration-300">
                <div className={`bg-gradient-to-r ${role.color} ${role.hoverColor} p-8 transition-all duration-300`}>
                  <role.icon className="text-6xl text-white mx-auto mb-4" />
                </div>
                <div className="p-8 text-center">
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">{role.title}</h3>
                  <p className="text-gray-600 mb-6">{role.description}</p>
                  <button className={`w-full bg-gradient-to-r ${role.color} text-white py-3 px-6 rounded-lg font-semibold transform transition-all duration-300 group-hover:shadow-lg`}>
                    Sign In as {role.title}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>© 2024 INHOZ Hospital Management System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;
