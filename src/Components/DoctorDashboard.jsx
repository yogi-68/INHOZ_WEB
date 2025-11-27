import React, { useState, useEffect } from 'react';
import { FaUserInjured, FaExclamationTriangle, FaHeartbeat, FaThermometerHalf, FaPrescriptionBottleAlt, FaChartLine, FaCheckCircle, FaTimes, FaPlus, FaSearch, FaVideo, FaBell, FaSort, FaClock, FaDownload } from 'react-icons/fa';
import apiClient from '../utils/api';
import { getSocket, initializeSocket } from '../utils/socket';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Patient Card Component with Vitals Sparklines
const PatientCard = ({ patient, onClick, isSelected }) => {
  const getVitalStatus = (vital, value) => {
    if (!value) return 'text-gray-400';
    
    const ranges = {
      heartRate: { min: 60, max: 100 },
      oxygenLevel: { min: 95, max: 100 },
      temperature: { min: 36.1, max: 37.2 },
      bloodPressureSystolic: { min: 90, max: 120 },
    };

    const range = ranges[vital];
    if (!range) return 'text-blue-500';
    
    if (value < range.min || value > range.max) return 'text-red-500';
    return 'text-green-500';
  };

  return (
    <div 
      onClick={() => onClick(patient)}
      className={`bg-white p-5 rounded-lg shadow-md cursor-pointer transition-all transform hover:scale-105 hover:shadow-xl border-2 ${
        isSelected ? 'border-blue-500 shadow-2xl' : 'border-transparent'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{patient.name}</h3>
          <p className="text-sm text-gray-500">ID: {patient.hospitalId} | Room {patient.room}</p>
        </div>
        {patient.alertCount > 0 && (
          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center">
            <FaExclamationTriangle className="mr-1" />
            {patient.alertCount}
          </span>
        )}
      </div>

      {patient.latestVitals ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 p-3 rounded">
            <div className="flex items-center justify-between">
              <FaHeartbeat className={getVitalStatus('heartRate', patient.latestVitals.heartRate)} />
              <span className={`text-lg font-bold ${getVitalStatus('heartRate', patient.latestVitals.heartRate)}`}>
                {patient.latestVitals.heartRate || '--'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">HR (bpm)</p>
          </div>

          <div className="bg-gray-50 p-3 rounded">
            <div className="flex items-center justify-between">
              <span className={`text-lg ${getVitalStatus('oxygenLevel', patient.latestVitals.oxygenLevel)}`}>SpO₂</span>
              <span className={`text-lg font-bold ${getVitalStatus('oxygenLevel', patient.latestVitals.oxygenLevel)}`}>
                {patient.latestVitals.oxygenLevel || '--'}%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Oxygen</p>
          </div>

          <div className="bg-gray-50 p-3 rounded">
            <div className="flex items-center justify-between">
              <FaThermometerHalf className={getVitalStatus('temperature', patient.latestVitals.temperature)} />
              <span className={`text-lg font-bold ${getVitalStatus('temperature', patient.latestVitals.temperature)}`}>
                {patient.latestVitals.temperature || '--'}°C
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Temp</p>
          </div>

          <div className="bg-gray-50 p-3 rounded">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">BP</span>
              <span className={`text-lg font-bold ${getVitalStatus('bloodPressureSystolic', patient.latestVitals.bloodPressureSystolic)}`}>
                {patient.latestVitals.bloodPressureSystolic || '--'}/{patient.latestVitals.bloodPressureDiastolic || '--'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">mmHg</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-400">No vitals data</p>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500 flex justify-between items-center">
        <span>
          {patient.latestVitals?.timestamp ? 
            `Updated ${Math.floor((Date.now() - new Date(patient.latestVitals.timestamp).getTime()) / 60000)}m ago` : 
            'No recent data'
          }
        </span>
        <span className={`px-2 py-1 rounded ${patient.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {patient.status}
        </span>
      </div>
    </div>
  );
};

// Live Vitals Strip Component
const LiveVitalsStrip = ({ vitals }) => {
  const getStatusColor = (vital, value) => {
    const ranges = {
      heartRate: { min: 60, max: 100 },
      oxygenLevel: { min: 95, max: 100 },
      temperature: { min: 36.1, max: 37.2 },
      bloodPressureSystolic: { min: 90, max: 120 },
    };

    const range = ranges[vital];
    if (!range || !value) return 'bg-gray-100 text-gray-800';
    
    if (value < range.min || value > range.max) return 'bg-red-100 text-red-800 border-red-500 animate-pulse';
    return 'bg-green-100 text-green-800';
  };

  if (!vitals) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <p className="text-center text-gray-500">No real-time vitals data</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg mb-6">
      <h3 className="text-white font-bold text-lg mb-4 flex items-center">
        <FaHeartbeat className="mr-2 animate-pulse" />
        Live Vitals Monitor
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`${getStatusColor('heartRate', vitals.heartRate)} p-4 rounded-lg border-2`}>
          <div className="flex items-center justify-between">
            <FaHeartbeat className="text-2xl" />
            <span className="text-3xl font-bold">{vitals.heartRate || '--'}</span>
          </div>
          <p className="text-sm font-semibold mt-2">Heart Rate (bpm)</p>
        </div>

        <div className={`${getStatusColor('oxygenLevel', vitals.oxygenLevel)} p-4 rounded-lg border-2`}>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">SpO₂</span>
            <span className="text-3xl font-bold">{vitals.oxygenLevel || '--'}%</span>
          </div>
          <p className="text-sm font-semibold mt-2">Oxygen Level</p>
        </div>

        <div className={`${getStatusColor('temperature', vitals.temperature)} p-4 rounded-lg border-2`}>
          <div className="flex items-center justify-between">
            <FaThermometerHalf className="text-2xl" />
            <span className="text-3xl font-bold">{vitals.temperature || '--'}°C</span>
          </div>
          <p className="text-sm font-semibold mt-2">Temperature</p>
        </div>

        <div className={`${getStatusColor('bloodPressureSystolic', vitals.bloodPressureSystolic)} p-4 rounded-lg border-2`}>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">BP</span>
            <span className="text-2xl font-bold">
              {vitals.bloodPressureSystolic || '--'}/{vitals.bloodPressureDiastolic || '--'}
            </span>
          </div>
          <p className="text-sm font-semibold mt-2">Blood Pressure</p>
        </div>
      </div>
      <div className="mt-4 text-white text-sm text-right">
        Last updated: {vitals.timestamp ? new Date(vitals.timestamp).toLocaleString() : 'N/A'}
      </div>
    </div>
  );
};

// Interactive Vitals Chart Component
const InteractiveVitalsChart = ({ patientId, timeRange }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!patientId) return;
    
    const fetchVitalsHistory = async () => {
      setLoading(true);
      try {
        const response = await apiClient.getPatientVitalsHistory(patientId);
        const vitalsData = response?.data || [];
        
        // Filter by time range
        const now = Date.now();
        const ranges = {
          '1h': 60 * 60 * 1000,
          '6h': 6 * 60 * 60 * 1000,
          '24h': 24 * 60 * 60 * 1000,
          '7d': 7 * 24 * 60 * 60 * 1000,
        };
        
        const filtered = vitalsData.filter(v => {
          const time = new Date(v.timestamp).getTime();
          return now - time <= ranges[timeRange];
        });
        
        const formatted = filtered.map(v => ({
          time: new Date(v.timestamp).toLocaleTimeString(),
          heartRate: v.heartRate,
          oxygenLevel: v.oxygenLevel,
          temperature: v.temperature,
          bpSystolic: v.bloodPressureSystolic,
        }));
        
        setChartData(formatted);
      } catch (err) {
        console.error('Error fetching vitals history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVitalsHistory();
  }, [patientId, timeRange]);

  if (loading) {
    return <div className="text-center py-10"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto"></div></div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-bold mb-4">Vitals Trend ({timeRange})</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={2} name="Heart Rate" />
          <Line type="monotone" dataKey="oxygenLevel" stroke="#3b82f6" strokeWidth={2} name="SpO₂" />
          <Line type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2} name="Temp (°C)" />
          <Line type="monotone" dataKey="bpSystolic" stroke="#10b981" strokeWidth={2} name="BP Systolic" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Alerts Inbox Component
const AlertsInbox = ({ alerts, onAcknowledge, onBulkAcknowledge }) => {
  const [selectedAlerts, setSelectedAlerts] = useState([]);
  const [showCriticalModal, setShowCriticalModal] = useState(false);
  const [criticalAlert, setCriticalAlert] = useState(null);

  useEffect(() => {
    // Show modal for new critical alerts
    const newCritical = alerts.find(a => a.severity === 'critical' && !a.acknowledged);
    if (newCritical) {
      setCriticalAlert(newCritical);
      setShowCriticalModal(true);
    }
  }, [alerts]);

  const toggleSelectAlert = (alertId) => {
    setSelectedAlerts(prev => 
      prev.includes(alertId) ? prev.filter(id => id !== alertId) : [...prev, alertId]
    );
  };

  const handleBulkAck = () => {
    onBulkAcknowledge(selectedAlerts);
    setSelectedAlerts([]);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold flex items-center">
          <FaBell className="mr-2 text-yellow-500" />
          Alerts Inbox ({alerts.filter(a => !a.acknowledged).length} unread)
        </h3>
        {selectedAlerts.length > 0 && (
          <button
            onClick={handleBulkAck}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition inline-flex items-center"
          >
            <FaCheckCircle className="mr-2" />
            Acknowledge {selectedAlerts.length}
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {alerts.map(alert => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg border-l-4 cursor-pointer transition ${
              alert.acknowledged ? 'bg-gray-50 border-gray-300 opacity-60' :
              alert.severity === 'critical' ? 'bg-red-50 border-red-500' :
              alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-500' :
              'bg-blue-50 border-blue-500'
            }`}
          >
            <div className="flex items-start">
              <input
                type="checkbox"
                checked={selectedAlerts.includes(alert.id)}
                onChange={() => toggleSelectAlert(alert.id)}
                disabled={alert.acknowledged}
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-800">{alert.type}</h4>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span>Patient: {alert.patientName}</span>
                      <span>{new Date(alert.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      alert.severity === 'critical' ? 'bg-red-500 text-white' :
                      alert.severity === 'warning' ? 'bg-yellow-500 text-white' :
                      'bg-blue-500 text-white'
                    }`}>
                      {alert.severity.toUpperCase()}
                    </span>
                    {!alert.acknowledged && (
                      <button
                        onClick={() => onAcknowledge(alert.id)}
                        className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-1 px-3 rounded transition"
                      >
                        ACK
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Critical Alert Modal */}
      {showCriticalModal && criticalAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-lg w-full border-4 border-red-500 animate-pulse">
            <div className="flex items-center justify-center mb-4">
              <FaExclamationTriangle className="text-red-500 text-6xl animate-bounce" />
            </div>
            <h2 className="text-3xl font-bold text-center text-red-600 mb-4">CRITICAL ALERT</h2>
            <div className="bg-red-50 p-6 rounded-lg mb-6">
              <h3 className="font-bold text-xl text-gray-800 mb-2">{criticalAlert.type}</h3>
              <p className="text-gray-700 text-lg mb-3">{criticalAlert.message}</p>
              <div className="text-sm text-gray-600">
                <p><strong>Patient:</strong> {criticalAlert.patientName}</p>
                <p><strong>Time:</strong> {new Date(criticalAlert.timestamp).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  onAcknowledge(criticalAlert.id);
                  setShowCriticalModal(false);
                  setCriticalAlert(null);
                }}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg transition shadow-lg"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Prescription Modal Component
const PrescriptionModal = ({ patient, onClose, onSubmit }) => {
  const [prescriptionForm, setPrescriptionForm] = useState({
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    notes: '',
  });

  const templates = [
    { name: 'Pain Management', meds: [{ name: 'Paracetamol', dosage: '500mg', frequency: 'Every 6 hours', duration: '3 days' }] },
    { name: 'Antibiotic Course', meds: [{ name: 'Amoxicillin', dosage: '500mg', frequency: 'Every 8 hours', duration: '7 days' }] },
    { name: 'Blood Pressure', meds: [{ name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', duration: '30 days' }] },
  ];

  const addMedication = () => {
    setPrescriptionForm({
      ...prescriptionForm,
      medications: [...prescriptionForm.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    });
  };

  const removeMedication = (index) => {
    setPrescriptionForm({
      ...prescriptionForm,
      medications: prescriptionForm.medications.filter((_, i) => i !== index)
    });
  };

  const updateMedication = (index, field, value) => {
    const updated = [...prescriptionForm.medications];
    updated[index][field] = value;
    setPrescriptionForm({ ...prescriptionForm, medications: updated });
  };

  const applyTemplate = (template) => {
    setPrescriptionForm({ ...prescriptionForm, medications: template.meds });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(prescriptionForm);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Create Prescription for {patient?.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">
            <FaTimes />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-3">Quick Templates:</h3>
          <div className="flex flex-wrap gap-3">
            {templates.map(template => (
              <button
                key={template.name}
                onClick={() => applyTemplate(template)}
                className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold py-2 px-4 rounded-lg transition"
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-lg">Medications:</h3>
              <button
                type="button"
                onClick={addMedication}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded inline-flex items-center transition"
              >
                <FaPlus className="mr-2" />
                Add Medication
              </button>
            </div>

            {prescriptionForm.medications.map((med, index) => (
              <div key={index} className="grid grid-cols-4 gap-3 mb-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  placeholder="Medicine Name"
                  required
                  value={med.name}
                  onChange={(e) => updateMedication(index, 'name', e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Dosage (e.g., 500mg)"
                  required
                  value={med.dosage}
                  onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Frequency"
                  required
                  value={med.frequency}
                  onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Duration"
                    required
                    value={med.duration}
                    onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {prescriptionForm.medications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedication(index)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 rounded transition"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Doctor's Notes:</label>
            <textarea
              value={prescriptionForm.notes}
              onChange={(e) => setPrescriptionForm({ ...prescriptionForm, notes: e.target.value })}
              placeholder="Additional instructions or notes..."
              rows="4"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition shadow-lg"
            >
              <FaPrescriptionBottleAlt className="inline mr-2" />
              Issue Prescription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Doctor Dashboard Component
const DoctorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');
  const [doctorId, setDoctorId] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Setup Socket.IO for real-time updates
  useEffect(() => {
    const token = apiClient.getToken();
    if (!token || !doctorId) return;

    try {
      initializeSocket(token);
      const socket = getSocket();

      // Subscribe to doctor's room
      socket.emit('join:room', `doctor:${doctorId}`);
      console.log(`📡 Doctor ${doctorId} subscribed to real-time updates`);

      // Subscribe to each patient's room
      patients.forEach(patient => {
        socket.emit('join:room', `patient:${patient.id}`);
      });

      socket.on('vitals:update', (data) => {
        console.log('💓 Vitals update received:', data);
        setPatients(prev => prev.map(p => 
          p.id === data.patientId ? { ...p, latestVitals: data.vitals } : p
        ));
        
        if (selectedPatient?.id === data.patientId) {
          setSelectedPatient(prev => ({ ...prev, latestVitals: data.vitals }));
        }
      });

      socket.on('alert:new', (alert) => {
        console.log('🚨 New alert received:', alert);
        setAlerts(prev => [{
          id: alert._id,
          type: alert.type,
          message: alert.message,
          severity: alert.severity,
          patientName: 'Patient',
          timestamp: alert.createdAt,
          acknowledged: false,
        }, ...prev]);

        // Update patient alert count
        setPatients(prev => prev.map(p =>
          p.id === alert.patientId ? { ...p, alertCount: (p.alertCount || 0) + 1 } : p
        ));
      });

      socket.on('prescription:created', (data) => {
        console.log('💊 Prescription created:', data);
        alert(`✅ Prescription issued successfully for ${data.patientName}!`);
      });

      return () => {
        socket.off('vitals:update');
        socket.off('alert:new');
        socket.off('prescription:created');
      };
    } catch (err) {
      console.error('Socket.IO setup error:', err);
    }
  }, [doctorId, patients, selectedPatient]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const doctorResponse = await apiClient.getProfile();
      const docId = doctorResponse?.data?._id;
      setDoctorId(docId);

      const patientsResponse = await apiClient.getDoctorPatients();
      const patientsData = patientsResponse?.data || [];
      
      const formattedPatients = patientsData.map(patient => ({
        id: patient._id,
        name: `${patient.userId.profile.firstName} ${patient.userId.profile.lastName}`,
        hospitalId: patient.hospitalId,
        room: patient.roomNo,
        status: patient.status,
        latestVitals: patient.latestVitals || null,
        alertCount: patient.unacknowledgedAlerts || 0,
      }));

      setPatients(formattedPatients);

      // Fetch alerts
      const alertsResponse = await apiClient.getAlerts();
      const alertsData = alertsResponse?.data || [];
      const formattedAlerts = alertsData.map(alert => ({
        id: alert._id,
        type: alert.type,
        message: alert.message,
        severity: alert.severity,
        patientName: alert.patientId?.userId?.profile ? 
          `${alert.patientId.userId.profile.firstName} ${alert.patientId.userId.profile.lastName}` : 
          'Unknown Patient',
        timestamp: alert.createdAt,
        acknowledged: alert.acknowledged || false,
      }));

      setAlerts(formattedAlerts);

    } catch (err) {
      console.error('Error fetching doctor dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await apiClient.acknowledgeAlert(alertId);
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
      alert('✅ Alert acknowledged');
    } catch (err) {
      console.error('Error acknowledging alert:', err);
      alert('❌ Failed to acknowledge alert');
    }
  };

  const handleBulkAcknowledge = async (alertIds) => {
    try {
      await Promise.all(alertIds.map(id => apiClient.acknowledgeAlert(id)));
      setAlerts(prev => prev.map(a => alertIds.includes(a.id) ? { ...a, acknowledged: true } : a));
      alert(`✅ ${alertIds.length} alerts acknowledged`);
    } catch (err) {
      console.error('Error bulk acknowledging alerts:', err);
      alert('❌ Failed to acknowledge alerts');
    }
  };

  const handleCreatePrescription = async (prescriptionData) => {
    try {
      await apiClient.createPrescription({
        patientId: selectedPatient.id,
        medications: prescriptionData.medications,
        notes: prescriptionData.notes,
      });
      setShowPrescriptionModal(false);
      alert('✅ Prescription created successfully! Patient will be notified.');
    } catch (err) {
      console.error('Error creating prescription:', err);
      alert('❌ Failed to create prescription: ' + err.message);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.hospitalId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || patient.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-2xl text-gray-600 font-semibold">Loading Doctor Dashboard...</p>
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
          <h2 className="text-4xl font-bold text-gray-800">Doctor Dashboard</h2>
          <p className="text-gray-600 mt-2">Manage your patients and provide care</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setViewMode('grid')}
            className={`${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'} font-bold py-2 px-6 rounded-lg transition shadow-md hover:shadow-lg`}
          >
            Grid View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'} font-bold py-2 px-6 rounded-lg transition shadow-md hover:shadow-lg`}
          >
            List View
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative col-span-2">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients by name or hospital ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Patients</option>
          <option value="active">Active</option>
          <option value="discharged">Discharged</option>
        </select>
      </div>

      {/* Patient Detail View */}
      {selectedPatient && (
        <div className="mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold">{selectedPatient.name}</h3>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPrescriptionModal(true)}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg inline-flex items-center transition shadow-md hover:shadow-lg"
                >
                  <FaPrescriptionBottleAlt className="mr-2" />
                  New Prescription
                </button>
                <button
                  onClick={() => alert('Camera view coming soon')}
                  className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-6 rounded-lg inline-flex items-center transition shadow-md hover:shadow-lg"
                >
                  <FaVideo className="mr-2" />
                  Camera View
                </button>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-lg transition"
                >
                  Back to List
                </button>
              </div>
            </div>
            <p className="text-gray-600">ID: {selectedPatient.hospitalId} | Room: {selectedPatient.room}</p>
          </div>

          <LiveVitalsStrip vitals={selectedPatient.latestVitals} />

          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Historical Trends</h3>
              <div className="flex space-x-2">
                {['1h', '6h', '24h', '7d'].map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`${timeRange === range ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} font-bold py-2 px-4 rounded transition`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            <InteractiveVitalsChart patientId={selectedPatient.id} timeRange={timeRange} />
          </div>
        </div>
      )}

      {/* Alerts Inbox */}
      {!selectedPatient && (
        <AlertsInbox 
          alerts={alerts}
          onAcknowledge={handleAcknowledgeAlert}
          onBulkAcknowledge={handleBulkAcknowledge}
        />
      )}

      {/* Patient Cards Grid/List */}
      {!selectedPatient && (
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-4">
            My Patients ({filteredPatients.length})
          </h3>
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredPatients.map(patient => (
              <PatientCard 
                key={patient.id}
                patient={patient}
                onClick={setSelectedPatient}
                isSelected={selectedPatient?.id === patient.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <PrescriptionModal
          patient={selectedPatient}
          onClose={() => setShowPrescriptionModal(false)}
          onSubmit={handleCreatePrescription}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;
