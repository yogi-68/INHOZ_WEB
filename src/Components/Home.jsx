import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserInjured, FaHeartbeat, FaHistory, FaUserMd, FaCalendarAlt, FaBell } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

const QuickAccessCard = ({ icon: Icon, title, description, link, color }) => (
  <Link to={link} className="block">
    <div className={`bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 ${color}`}>
      <div className="flex items-center">
        <Icon className={`text-4xl mr-4 ${color.replace('border', 'text')}`} />
        <div>
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  </Link>
);

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

const Home = () => {
  const { translate } = useLanguage();

  // This would typically come from an API
  const stats = {
    totalPatients: 150,
    currentPatients: 12,
    appointmentsToday: 8,
    pendingReports: 5
  };

  const quickAccess = [
    {
      icon: FaUserInjured,
      title: translate('patients'),
      description: translate('managePatients'),
      link: '/patients',
      color: 'border-blue-500'
    },
    {
      icon: FaHeartbeat,
      title: translate('vitals'),
      description: translate('monitorVitals'),
      link: '/vitals',
      color: 'border-green-500'
    },
    {
      icon: FaHistory,
      title: translate('patientHistory'),
      description: translate('viewHistory'),
      link: '/history',
      color: 'border-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FaUserInjured}
          title={translate('totalPatients')}
          value={stats.totalPatients}
          color="border-blue-500"
        />
        <StatCard
          icon={FaHeartbeat}
          title={translate('currentPatients')}
          value={stats.currentPatients}
          color="border-green-500"
        />
        <StatCard
          icon={FaCalendarAlt}
          title={translate('appointmentsToday')}
          value={stats.appointmentsToday}
          color="border-purple-500"
        />
        <StatCard
          icon={FaBell}
          title={translate('pendingReports')}
          value={stats.pendingReports}
          color="border-yellow-500"
        />
      </div>

      {/* Quick Access Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-4">{translate('quickAccess')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickAccess.map((item, index) => (
            <QuickAccessCard key={index} {...item} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">{translate('recentActivity')}</h2>
        <div className="space-y-4">
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <div>
              <p className="font-medium">{translate('patientAdmitted')}: John Doe</p>
              <p className="text-sm text-gray-600">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <div>
              <p className="font-medium">{translate('vitalsUpdated')}: Jane Smith</p>
              <p className="text-sm text-gray-600">3 hours ago</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
            <div>
              <p className="font-medium">{translate('appointmentScheduled')}: Alice Johnson</p>
              <p className="text-sm text-gray-600">5 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 