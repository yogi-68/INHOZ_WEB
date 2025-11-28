import React, { useState, useEffect } from 'react';
import {
  FaUserInjured, FaUserMd, FaExclamationTriangle, FaHospital,
  FaMoneyBillWave, FaChartLine, FaArrowUp, FaArrowDown,
  FaHeartbeat, FaThermometerHalf, FaTint, FaLungs
} from 'react-icons/fa';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import apiClient from '../../utils/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DashboardOverview = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    activeMonitoring: 0,
    criticalAlerts: 0,
    devicesOnline: 156,
    devicesOffline: 12,
    revenueToday: 0,
    revenueMonth: 0,
    admissionsToday: 0,
    dischargesPending: 0
  });

  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats, invoices, and alerts in parallel
      const [dashboardResponse, invoicesResponse, alertsResponse] = await Promise.all([
        apiClient.getAdminDashboard(),
        apiClient.getInvoices(),
        apiClient.getDoctorAlerts()
      ]);

      // Process dashboard stats
      if (dashboardResponse.success) {
        const { patients, doctors, alerts } = dashboardResponse.data;
        
        // Calculate revenue from invoices
        let revenueToday = 0;
        let revenueMonth = 0;
        let admissionsToday = 0;
        
        if (invoicesResponse.success && invoicesResponse.data) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          
          invoicesResponse.data.forEach(invoice => {
            const invoiceDate = new Date(invoice.issuedAt);
            
            // Today's revenue (only paid invoices)
            if (invoiceDate >= today && invoice.status === 'paid') {
              revenueToday += invoice.total;
            }
            
            // This month's revenue (only paid invoices)
            if (invoiceDate >= firstDayOfMonth && invoice.status === 'paid') {
              revenueMonth += invoice.total;
            }
            
            // Count today's admissions (new invoices)
            if (invoiceDate >= today) {
              admissionsToday++;
            }
          });
        }

        // Count critical alerts
        let criticalCount = 0;
        if (alertsResponse.success && alertsResponse.data) {
          criticalCount = alertsResponse.data.filter(alert => 
            alert.severity === 'critical' && !alert.acknowledgedAt
          ).length;
        }

        setStats({
          totalPatients: patients.total,
          totalDoctors: doctors.total,
          activeMonitoring: patients.active,
          criticalAlerts: criticalCount,
          devicesOnline: 156, // TODO: Replace with real device data
          devicesOffline: 12, // TODO: Replace with real device data
          revenueToday,
          revenueMonth,
          admissionsToday,
          dischargesPending: 0 // TODO: Calculate from patient status
        });

        // Process recent alerts
        if (alertsResponse.success && alertsResponse.data) {
          const formattedAlerts = alertsResponse.data.slice(0, 5).map(alert => {
            const timeAgo = getTimeAgo(new Date(alert.createdAt));
            const patientName = alert.patientId?.userId?.profile 
              ? `${alert.patientId.userId.profile.firstName} ${alert.patientId.userId.profile.lastName}`
              : 'Unknown Patient';
            
            return {
              id: alert._id,
              patient: patientName,
              type: alert.type,
              severity: alert.severity,
              time: timeAgo,
              value: formatAlertValue(alert)
            };
          });
          setRecentAlerts(formattedAlerts);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return `${seconds} secs ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const formatAlertValue = (alert) => {
    if (alert.vitalSnapshot) {
      if (alert.type.includes('Heart Rate')) return `${alert.vitalSnapshot.heartRate} bpm`;
      if (alert.type.includes('SpO2')) return `${alert.vitalSnapshot.spo2}%`;
      if (alert.type.includes('Temperature')) return `${alert.vitalSnapshot.temperature}°C`;
      if (alert.type.includes('Blood Pressure')) {
        return `${alert.vitalSnapshot.systolic}/${alert.vitalSnapshot.diastolic} mmHg`;
      }
    }
    return alert.message || 'N/A';
  };

  // Chart Data
  const admissionData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Admissions',
        data: [12, 19, 15, 25, 22, 18, 20],
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Discharges',
        data: [8, 15, 12, 18, 16, 14, 15],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const alertsData = {
    labels: ['Critical', 'Warning', 'Info'],
    datasets: [
      {
        data: [7, 23, 45],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(59, 130, 246, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  };

  const departmentData = {
    labels: ['Cardiology', 'Neurology', 'Orthopedics', 'General', 'ICU', 'Emergency'],
    datasets: [
      {
        label: 'Patients',
        data: [45, 32, 28, 65, 18, 24],
        backgroundColor: 'rgba(147, 51, 234, 0.7)',
        borderRadius: 8
      }
    ]
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color, trend }) => (
    <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${color} transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color.replace('border', 'bg').replace('500', '100')}`}>
          <Icon className={`text-2xl ${color.replace('border', 'text')}`} />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? <FaArrowUp /> : <FaArrowDown />}
            <span className="text-sm font-semibold">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-3xl font-bold text-gray-800 mb-1">
        {loading ? '...' : value}
      </h3>
      <p className="text-sm text-gray-600 font-medium">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );

  const AlertItem = ({ alert }) => {
    const severityColors = {
      critical: 'bg-red-100 border-red-500 text-red-800',
      warning: 'bg-yellow-100 border-yellow-500 text-yellow-800',
      info: 'bg-blue-100 border-blue-500 text-blue-800'
    };

    return (
      <div className={`p-4 rounded-lg border-l-4 ${severityColors[alert.severity]} mb-3 hover:shadow-md transition-shadow`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <FaExclamationTriangle className="text-lg" />
              <h4 className="font-bold">{alert.type}</h4>
            </div>
            <p className="text-sm opacity-90">Patient: <span className="font-semibold">{alert.patient}</span></p>
            <p className="text-sm opacity-90">Value: <span className="font-semibold">{alert.value}</span></p>
          </div>
          <div className="text-right">
            <span className="text-xs opacity-75">{alert.time}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-purple-100 text-lg">System-wide monitoring and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FaUserInjured}
          title="Total Patients"
          value={stats.totalPatients}
          subtitle={`${stats.activeMonitoring} actively monitored`}
          color="border-blue-500"
          trend={5.2}
        />
        <StatCard
          icon={FaUserMd}
          title="Active Doctors"
          value={stats.totalDoctors}
          subtitle="On duty today"
          color="border-green-500"
          trend={2.1}
        />
        <StatCard
          icon={FaExclamationTriangle}
          title="Critical Alerts"
          value={stats.criticalAlerts}
          subtitle="Require immediate attention"
          color="border-red-500"
          trend={-15}
        />
        <StatCard
          icon={FaHospital}
          title="Devices Online"
          value={stats.devicesOnline}
          subtitle={`${stats.devicesOffline} offline`}
          color="border-purple-500"
          trend={3.5}
        />
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          icon={FaMoneyBillWave}
          title="Today's Revenue"
          value={`$${stats.revenueToday.toLocaleString()}`}
          subtitle={`From ${stats.admissionsToday} admission${stats.admissionsToday !== 1 ? 's' : ''}`}
          color="border-yellow-500"
          trend={8.3}
        />
        <StatCard
          icon={FaChartLine}
          title="Monthly Revenue"
          value={`$${(stats.revenueMonth / 1000).toFixed(1)}K`}
          subtitle={`Target: $1.5M (${Math.round((stats.revenueMonth / 1500000) * 100)}% achieved)`}
          color="border-indigo-500"
          trend={12.7}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Admissions Trend */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FaChartLine className="mr-2 text-purple-600" />
            Patient Admissions & Discharges
          </h3>
          <div style={{ height: '280px', width: '100%' }}>
            <Line
              data={admissionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } },
                  tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                  y: { 
                    beginAtZero: true, 
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    suggestedMax: Math.max(...admissionData.datasets[0].data, ...admissionData.datasets[1].data) * 1.2,
                    ticks: {
                      stepSize: Math.ceil(Math.max(...admissionData.datasets[0].data, ...admissionData.datasets[1].data) / 5)
                    }
                  },
                  x: { grid: { display: false } }
                }
              }}
            />
          </div>
        </div>

        {/* Alerts Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FaExclamationTriangle className="mr-2 text-red-600" />
            Alerts Distribution
          </h3>
          <div style={{ height: '280px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Doughnut
              data={alertsData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom', labels: { font: { size: 11 } } }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Department Overview & Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Overview */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FaHospital className="mr-2 text-blue-600" />
            Patients by Department
          </h3>
          <div style={{ height: '320px', width: '100%' }}>
            <Bar
              data={departmentData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: { 
                    beginAtZero: true, 
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    suggestedMax: Math.max(...departmentData.datasets[0].data) * 1.2,
                    ticks: {
                      stepSize: Math.ceil(Math.max(...departmentData.datasets[0].data) / 5)
                    }
                  },
                  x: { grid: { display: false } }
                }
              }}
            />
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <FaExclamationTriangle className="mr-2 text-orange-600" />
              Recent Alerts
            </h3>
            <button 
              onClick={() => onNavigate?.('alerts')}
              className="text-sm text-purple-600 hover:text-purple-800 font-semibold"
            >
              View All →
            </button>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading alerts...</div>
            ) : recentAlerts.length > 0 ? (
              recentAlerts.map(alert => (
                <AlertItem key={alert.id} alert={alert} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">No recent alerts</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => onNavigate?.('patients')}
            className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
          >
            <FaUserInjured className="text-3xl mb-2" />
            <span className="font-semibold">Add Patient</span>
          </button>
          <button 
            onClick={() => onNavigate?.('doctors')}
            className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg"
          >
            <FaUserMd className="text-3xl mb-2" />
            <span className="font-semibold">Add Doctor</span>
          </button>
          <button 
            onClick={() => onNavigate?.('devices')}
            className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
          >
            <FaHospital className="text-3xl mb-2" />
            <span className="font-semibold">Add Device</span>
          </button>
          <button 
            onClick={() => onNavigate?.('billing')}
            className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all transform hover:scale-105 shadow-lg"
          >
            <FaMoneyBillWave className="text-3xl mb-2" />
            <span className="font-semibold">Create Bill</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
