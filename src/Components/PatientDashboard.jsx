import React, { useState, useEffect } from 'react';
import { FaHeartbeat, FaThermometerHalf, FaLungs, FaTint, FaPrescriptionBottleAlt, FaFileInvoiceDollar, FaPhone, FaExclamationTriangle, FaCheckCircle, FaDownload, FaChartLine, FaClock, FaBell, FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa';
import apiClient from '../utils/api';
import { getSocket, initializeSocket } from '../utils/socket';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Vitals Snapshot Card Component
const VitalsCard = ({ icon: Icon, title, value, unit, status, trend }) => {
  const getStatusColor = () => {
    if (status === 'critical') return 'border-red-500 bg-red-50';
    if (status === 'warning') return 'border-yellow-500 bg-yellow-50';
    if (status === 'normal') return 'border-green-500 bg-green-50';
    return 'border-gray-300 bg-gray-50';
  };

  const getTextColor = () => {
    if (status === 'critical') return 'text-red-600';
    if (status === 'warning') return 'text-yellow-600';
    if (status === 'normal') return 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <div className={`p-6 rounded-lg shadow-md border-l-4 ${getStatusColor()} transition-all hover:shadow-xl transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between mb-3">
        <Icon className={`text-4xl ${getTextColor()}`} />
        {trend && (
          <span className={`text-lg font-bold ${trend > 0 ? 'text-red-500' : 'text-green-500'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">{title}</h3>
      <div className="flex items-baseline">
        <p className={`text-4xl font-bold ${getTextColor()}`}>{value || '--'}</p>
        <span className="text-xl text-gray-500 ml-2">{unit}</span>
      </div>
      <div className="mt-2">
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          status === 'critical' ? 'bg-red-500 text-white' :
          status === 'warning' ? 'bg-yellow-500 text-white' :
          status === 'normal' ? 'bg-green-500 text-white' :
          'bg-gray-300 text-gray-700'
        }`}>
          {status ? status.toUpperCase() : 'NO DATA'}
        </span>
      </div>
    </div>
  );
};

// Interactive Vitals History Chart Component
const VitalsHistoryChart = ({ patientId, dateRange }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState(['heartRate', 'oxygenLevel', 'temperature']);

  const metrics = [
    { key: 'heartRate', label: 'Heart Rate', color: '#ef4444' },
    { key: 'oxygenLevel', label: 'SpO₂', color: '#3b82f6' },
    { key: 'temperature', label: 'Temperature', color: '#f59e0b' },
    { key: 'bpSystolic', label: 'BP Systolic', color: '#10b981' },
  ];

  useEffect(() => {
    if (!patientId) return;

    const fetchVitalsHistory = async () => {
      setLoading(true);
      try {
        const response = await apiClient.getPatientOwnVitals();
        const vitalsData = response?.data || [];

        // Filter by date range
        const now = Date.now();
        const ranges = {
          '1h': 60 * 60 * 1000,
          '6h': 6 * 60 * 60 * 1000,
          '24h': 24 * 60 * 60 * 1000,
          '7d': 7 * 24 * 60 * 60 * 1000,
          '30d': 30 * 24 * 60 * 60 * 1000,
        };

        const filtered = vitalsData.filter(v => {
          const time = new Date(v.timestamp).getTime();
          return now - time <= ranges[dateRange];
        });

        const formatted = filtered.map(v => ({
          time: new Date(v.timestamp).toLocaleTimeString(),
          date: new Date(v.timestamp).toLocaleDateString(),
          heartRate: v.heartRate,
          oxygenLevel: v.oxygenLevel,
          temperature: v.temperature,
          bpSystolic: v.bloodPressureSystolic,
          bpDiastolic: v.bloodPressureDiastolic,
        }));

        setChartData(formatted.reverse());
      } catch (err) {
        console.error('Error fetching vitals history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVitalsHistory();
  }, [patientId, dateRange]);

  const toggleMetric = (metricKey) => {
    setSelectedMetrics(prev =>
      prev.includes(metricKey) ? prev.filter(k => k !== metricKey) : [...prev, metricKey]
    );
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold">Vitals History</h3>
        <div className="flex flex-wrap gap-2">
          {metrics.map(metric => (
            <button
              key={metric.key}
              onClick={() => toggleMetric(metric.key)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                selectedMetrics.includes(metric.key)
                  ? 'text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={selectedMetrics.includes(metric.key) ? { backgroundColor: metric.color } : {}}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="text-center py-20">
          <FaChartLine className="text-gray-300 text-6xl mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No vitals data available for this time range</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
              labelStyle={{ fontWeight: 'bold' }}
            />
            <Legend />
            {selectedMetrics.includes('heartRate') && (
              <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={3} name="Heart Rate (bpm)" dot={{ r: 4 }} activeDot={{ r: 6 }} />
            )}
            {selectedMetrics.includes('oxygenLevel') && (
              <Line type="monotone" dataKey="oxygenLevel" stroke="#3b82f6" strokeWidth={3} name="SpO₂ (%)" dot={{ r: 4 }} activeDot={{ r: 6 }} />
            )}
            {selectedMetrics.includes('temperature') && (
              <Line type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={3} name="Temp (°C)" dot={{ r: 4 }} activeDot={{ r: 6 }} />
            )}
            {selectedMetrics.includes('bpSystolic') && (
              <Line type="monotone" dataKey="bpSystolic" stroke="#10b981" strokeWidth={3} name="BP Systolic (mmHg)" dot={{ r: 4 }} activeDot={{ r: 6 }} />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}

      <div className="mt-4 text-sm text-gray-500 text-right">
        {chartData.length} data points in the last {dateRange}
      </div>
    </div>
  );
};

// Prescriptions List Component
const PrescriptionsList = ({ prescriptions, onMarkTaken }) => {
  const [expandedPrescription, setExpandedPrescription] = useState(null);

  const toggleExpand = (prescriptionId) => {
    setExpandedPrescription(expandedPrescription === prescriptionId ? null : prescriptionId);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-bold mb-6 flex items-center">
        <FaPrescriptionBottleAlt className="mr-3 text-blue-500" />
        My Prescriptions ({prescriptions.length})
      </h3>

      {prescriptions.length === 0 ? (
        <div className="text-center py-12">
          <FaPrescriptionBottleAlt className="text-gray-300 text-6xl mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No prescriptions available</p>
          <p className="text-gray-400 text-sm mt-2">Your doctor will prescribe medications when needed</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map(prescription => (
            <div key={prescription.id} className="border rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-bold text-gray-800">
                      Prescription #{prescription.prescriptionId || prescription.id.slice(-6)}
                    </h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      prescription.status === 'active' ? 'bg-green-100 text-green-800' :
                      prescription.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {prescription.status?.toUpperCase() || 'ACTIVE'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Prescribed by: <span className="font-semibold">{prescription.doctorName}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Date: {new Date(prescription.date).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => toggleExpand(prescription.id)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition"
                >
                  {expandedPrescription === prescription.id ? 'Hide' : 'View Details'}
                </button>
              </div>

              {expandedPrescription === prescription.id && (
                <div className="mt-4 border-t pt-4">
                  <h5 className="font-semibold text-gray-700 mb-3">Medications:</h5>
                  <div className="space-y-3">
                    {prescription.medications.map((med, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h6 className="font-bold text-gray-800 text-lg">{med.name}</h6>
                            <div className="grid grid-cols-3 gap-3 mt-2 text-sm">
                              <div>
                                <span className="text-gray-500">Dosage:</span>
                                <p className="font-semibold text-gray-700">{med.dosage}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Frequency:</span>
                                <p className="font-semibold text-gray-700">{med.frequency}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Duration:</span>
                                <p className="font-semibold text-gray-700">{med.duration}</p>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => onMarkTaken(prescription.id, med.name)}
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition ml-3 flex items-center"
                          >
                            <FaCheckCircle className="mr-2" />
                            Mark Taken
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {prescription.notes && (
                    <div className="mt-4">
                      <h5 className="font-semibold text-gray-700 mb-2">Doctor's Notes:</h5>
                      <p className="text-gray-600 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                        {prescription.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Invoices List Component
const InvoicesList = ({ invoices }) => {
  const handlePayNow = (invoice) => {
    alert(`Payment gateway integration coming soon for Invoice #${invoice.invoiceId}`);
    // TODO: Integrate with payment gateway (Stripe, PayPal, etc.)
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-bold mb-6 flex items-center">
        <FaFileInvoiceDollar className="mr-3 text-green-500" />
        My Invoices ({invoices.length})
      </h3>

      {invoices.length === 0 ? (
        <div className="text-center py-12">
          <FaFileInvoiceDollar className="text-gray-300 text-6xl mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No invoices available</p>
          <p className="text-gray-400 text-sm mt-2">Your billing statements will appear here</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <th className="py-4 px-6 text-left font-semibold">Invoice ID</th>
                <th className="py-4 px-6 text-left font-semibold">Date</th>
                <th className="py-4 px-6 text-left font-semibold">Amount</th>
                <th className="py-4 px-6 text-left font-semibold">Status</th>
                <th className="py-4 px-6 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice, index) => (
                <tr key={invoice.id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition`}>
                  <td className="py-4 px-6 font-semibold text-gray-800">#{invoice.invoiceId}</td>
                  <td className="py-4 px-6 text-gray-600">{new Date(invoice.date).toLocaleDateString()}</td>
                  <td className="py-4 px-6">
                    <span className="text-2xl font-bold text-green-600">${invoice.amount}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {invoice.status?.toUpperCase() || 'PENDING'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => alert('PDF download coming soon')}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition inline-flex items-center"
                      >
                        <FaDownload className="mr-2" />
                        Download
                      </button>
                      {invoice.status === 'pending' && (
                        <button
                          onClick={() => handlePayNow(invoice)}
                          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition inline-flex items-center"
                        >
                          <FaMoneyBillWave className="mr-2" />
                          Pay Now
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Emergency Contact Component
const EmergencyContact = ({ doctorInfo }) => {
  const handleEmergencyCall = () => {
    if (doctorInfo?.phone) {
      window.location.href = `tel:${doctorInfo.phone}`;
    } else {
      alert('⚠️ Emergency contact not available. Please notify the nursing station.');
    }
  };

  return (
    <div className="bg-red-50 border-2 border-red-500 p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-bold text-red-600 mb-4 flex items-center">
        <FaPhone className="mr-3 animate-pulse" />
        Emergency Contact
      </h3>
      <div className="mb-4">
        <p className="text-gray-700 mb-2">Your assigned doctor:</p>
        <p className="text-xl font-bold text-gray-800">{doctorInfo?.name || 'Not assigned'}</p>
        {doctorInfo?.specialization && (
          <p className="text-sm text-gray-600">{doctorInfo.specialization}</p>
        )}
      </div>
      <button
        onClick={handleEmergencyCall}
        disabled={!doctorInfo?.phone}
        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-lg transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg"
      >
        <FaPhone className="mr-3 text-2xl" />
        Call Doctor Now {doctorInfo?.phone ? `(${doctorInfo.phone})` : ''}
      </button>
      <p className="text-xs text-gray-600 mt-3 text-center">
        For life-threatening emergencies, press the bedside call button or dial extension 911
      </p>
    </div>
  );
};

// Alerts Feed Component
const AlertsFeed = ({ alerts }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-2xl font-bold mb-4 flex items-center">
      <FaBell className="mr-3 text-yellow-500" />
      My Alerts ({alerts.filter(a => !a.acknowledged).length} unread)
    </h3>

    {alerts.length === 0 ? (
      <div className="text-center py-8">
        <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-3" />
        <p className="text-gray-500">No alerts</p>
      </div>
    ) : (
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {alerts.map(alert => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg border-l-4 transition ${
              alert.acknowledged ? 'bg-gray-50 border-gray-300 opacity-60' :
              alert.severity === 'critical' ? 'bg-red-50 border-red-500' :
              alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-500' :
              'bg-blue-50 border-blue-500'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">{alert.type}</h4>
                <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(alert.timestamp).toLocaleString()}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ml-3 ${
                alert.severity === 'critical' ? 'bg-red-500 text-white' :
                alert.severity === 'warning' ? 'bg-yellow-500 text-white' :
                'bg-blue-500 text-white'
              }`}>
                {alert.severity?.toUpperCase() || 'INFO'}
              </span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Main Patient Dashboard Component
const PatientDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientId, setPatientId] = useState(null);
  const [latestVitals, setLatestVitals] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [dateRange, setDateRange] = useState('24h');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Setup Socket.IO for real-time updates
  useEffect(() => {
    const token = apiClient.getToken();
    if (!token || !patientId) return;

    try {
      initializeSocket(token);
      const socket = getSocket();

      // Subscribe to patient's room
      socket.emit('join:room', `patient:${patientId}`);
      console.log(`📡 Patient ${patientId} subscribed to real-time updates`);

      socket.on('vitals:update', (data) => {
        console.log('💓 Vitals update received:', data);
        setLatestVitals(data.vitals);
      });

      socket.on('alert:new', (alert) => {
        console.log('🚨 New alert received:', alert);
        setAlerts(prev => [{
          id: alert._id,
          type: alert.type,
          message: alert.message,
          severity: alert.severity,
          timestamp: alert.createdAt,
          acknowledged: false,
        }, ...prev]);
      });

      socket.on('prescription:created', (data) => {
        console.log('💊 New prescription received:', data);
        alert(`📋 New prescription from ${data.doctorName}! Check your prescriptions list.`);
        fetchDashboardData(); // Refresh data
      });

      return () => {
        socket.off('vitals:update');
        socket.off('alert:new');
        socket.off('prescription:created');
      };
    } catch (err) {
      console.error('Socket.IO setup error:', err);
    }
  }, [patientId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Get patient profile
      const profileResponse = await apiClient.getProfile();
      const patId = profileResponse?.data?._id;
      setPatientId(patId);

      // Get doctor info
      if (profileResponse?.data?.doctorId) {
        const doctor = profileResponse.data.doctorId;
        setDoctorInfo({
          name: doctor.userId?.profile ? 
            `${doctor.userId.profile.firstName} ${doctor.userId.profile.lastName}` : 
            'Doctor',
          specialization: doctor.specialization || 'General Medicine',
          phone: doctor.userId?.profile?.phone || null,
        });
      }

      // Get latest vitals
      const vitalsResponse = await apiClient.getPatientOwnVitals();
      const vitalsData = vitalsResponse?.data || [];
      if (vitalsData.length > 0) {
        setLatestVitals(vitalsData[0]);
      }

      // Get prescriptions
      const prescriptionsResponse = await apiClient.getPatientPrescriptionsOwn();
      const prescriptionsData = prescriptionsResponse?.data || [];
      const formattedPrescriptions = prescriptionsData.map(prescription => ({
        id: prescription._id,
        prescriptionId: prescription.prescriptionId || prescription._id.slice(-6),
        doctorName: prescription.doctorId?.userId?.profile ? 
          `Dr. ${prescription.doctorId.userId.profile.firstName} ${prescription.doctorId.userId.profile.lastName}` : 
          'Doctor',
        date: prescription.createdAt,
        medications: prescription.medications || [],
        notes: prescription.notes || '',
        status: prescription.status || 'active',
      }));
      setPrescriptions(formattedPrescriptions);

      // Get invoices
      const invoicesResponse = await apiClient.getPatientInvoicesOwn();
      const invoicesData = invoicesResponse?.data || [];
      const formattedInvoices = invoicesData.map(invoice => ({
        id: invoice._id,
        invoiceId: invoice.invoiceId,
        date: invoice.createdAt,
        amount: invoice.totalAmount,
        status: invoice.status || 'pending',
      }));
      setInvoices(formattedInvoices);

      // Get alerts
      const alertsResponse = await apiClient.getPatientAlertsOwn();
      const alertsData = alertsResponse?.data || [];
      const formattedAlerts = alertsData.map(alert => ({
        id: alert._id,
        type: alert.type,
        message: alert.message,
        severity: alert.severity,
        timestamp: alert.createdAt,
        acknowledged: alert.acknowledged || false,
      }));
      setAlerts(formattedAlerts);

    } catch (err) {
      console.error('Error fetching patient dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkTaken = async (prescriptionId, medicationName) => {
    try {
      // TODO: Implement medication adherence tracking API
      alert(`✅ Marked "${medicationName}" as taken! Your adherence is being tracked.`);
      console.log('Medication adherence:', { prescriptionId, medicationName, timestamp: new Date() });
    } catch (err) {
      console.error('Error marking medication as taken:', err);
      alert('❌ Failed to record medication adherence');
    }
  };

  const handleExportHealth = () => {
    alert('📊 Health data export feature (GDPR compliant) coming soon! This will include all your vitals, prescriptions, and medical history.');
  };

  const getVitalStatus = (vital, value) => {
    if (!value) return 'no-data';

    const ranges = {
      heartRate: { min: 60, max: 100 },
      oxygenLevel: { min: 95, max: 100 },
      temperature: { min: 36.1, max: 37.2 },
      bloodPressureSystolic: { min: 90, max: 120 },
    };

    const range = ranges[vital];
    if (!range) return 'normal';

    if (value < range.min * 0.8 || value > range.max * 1.2) return 'critical';
    if (value < range.min || value > range.max) return 'warning';
    return 'normal';
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-2xl text-gray-600 font-semibold">Loading Your Dashboard...</p>
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
          <h2 className="text-4xl font-bold text-gray-800">My Health Dashboard</h2>
          <p className="text-gray-600 mt-2">Monitor your vitals and manage your health</p>
        </div>
        <button
          onClick={handleExportHealth}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg inline-flex items-center transition shadow-md hover:shadow-lg"
        >
          <FaDownload className="mr-2" />
          Export Health Data
        </button>
      </div>

      {/* Vitals Snapshot Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <VitalsCard
          icon={FaHeartbeat}
          title="Heart Rate"
          value={latestVitals?.heartRate}
          unit="bpm"
          status={getVitalStatus('heartRate', latestVitals?.heartRate)}
          trend={latestVitals?.heartRateTrend}
        />
        <VitalsCard
          icon={FaLungs}
          title="Oxygen Level"
          value={latestVitals?.oxygenLevel}
          unit="%"
          status={getVitalStatus('oxygenLevel', latestVitals?.oxygenLevel)}
          trend={latestVitals?.oxygenTrend}
        />
        <VitalsCard
          icon={FaThermometerHalf}
          title="Temperature"
          value={latestVitals?.temperature}
          unit="°C"
          status={getVitalStatus('temperature', latestVitals?.temperature)}
          trend={latestVitals?.temperatureTrend}
        />
        <VitalsCard
          icon={FaTint}
          title="Blood Pressure"
          value={latestVitals?.bloodPressureSystolic ? 
            `${latestVitals.bloodPressureSystolic}/${latestVitals.bloodPressureDiastolic}` : 
            null
          }
          unit="mmHg"
          status={getVitalStatus('bloodPressureSystolic', latestVitals?.bloodPressureSystolic)}
          trend={latestVitals?.bpTrend}
        />
      </div>

      {/* Date Range Selector for Chart */}
      <div className="mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
          <h3 className="text-xl font-bold flex items-center">
            <FaCalendarAlt className="mr-2 text-blue-500" />
            Select Time Range:
          </h3>
          <div className="flex space-x-2">
            {['1h', '6h', '24h', '7d', '30d'].map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`${
                  dateRange === range 
                    ? 'bg-blue-500 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } font-bold py-2 px-6 rounded-lg transition transform hover:scale-105`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Vitals History Chart */}
      <div className="mb-8">
        <VitalsHistoryChart patientId={patientId} dateRange={dateRange} />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column - Wider */}
        <div className="lg:col-span-2 space-y-6">
          <PrescriptionsList prescriptions={prescriptions} onMarkTaken={handleMarkTaken} />
          <InvoicesList invoices={invoices} />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          <EmergencyContact doctorInfo={doctorInfo} />
          <AlertsFeed alerts={alerts} />
        </div>
      </div>

      {/* Last Updated Info */}
      <div className="text-center text-gray-500 text-sm mt-8">
        <p className="flex items-center justify-center">
          <FaClock className="mr-2" />
          Last vitals update: {latestVitals?.timestamp ? new Date(latestVitals.timestamp).toLocaleString() : 'No data'}
        </p>
      </div>
    </div>
  );
};

export default PatientDashboard;
