import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import { router } from 'expo-router';
import apiClient from './utils/api';
import { getSocket, initializeSocket, joinRoom } from './utils/socket';

const { width } = Dimensions.get('window');

// Patient Card Component with Gradient Border
const PatientCard = ({ patient, onPress }) => {
  const getVitalStatus = (vital, value) => {
    const ranges = {
      heartRate: { min: 60, max: 100 },
      oxygenLevel: { min: 95, max: 100 },
      temperature: { min: 36.1, max: 37.2 },
    };
    const range = ranges[vital];
    if (!range || !value) return '#94a3b8';
    if (value < range.min || value > range.max) return '#ef4444';
    return '#10b981';
  };

  return (
    <TouchableOpacity onPress={() => onPress(patient)} style={styles.patientCardContainer}>
      <View style={styles.patientCard}>
        <View style={styles.patientHeader}>
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{patient.name}</Text>
            <Text style={styles.patientId}>ID: {patient.hospitalId} • Room {patient.room}</Text>
          </View>
          {patient.alertCount > 0 && (
            <LinearGradient
              colors={['#ef4444', '#dc2626']}
              style={styles.alertBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="exclamation-triangle" size={12} color="#fff" />
              <Text style={styles.alertCount}>{patient.alertCount}</Text>
            </LinearGradient>
          )}
        </View>

        <View style={styles.vitalsGrid}>
          <View style={styles.vitalItem}>
            <Icon name="heartbeat" size={22} color={getVitalStatus('heartRate', patient.latestVitals?.heartRate)} />
            <Text style={styles.vitalLabel}>Heart Rate</Text>
            <Text style={[styles.vitalValue, { color: getVitalStatus('heartRate', patient.latestVitals?.heartRate) }]}>
              {patient.latestVitals?.heartRate || '--'}
            </Text>
            <Text style={styles.vitalUnit}>bpm</Text>
          </View>

          <View style={styles.vitalItem}>
            <Icon name="tint" size={22} color={getVitalStatus('oxygenLevel', patient.latestVitals?.oxygenLevel)} />
            <Text style={styles.vitalLabel}>SpO₂</Text>
            <Text style={[styles.vitalValue, { color: getVitalStatus('oxygenLevel', patient.latestVitals?.oxygenLevel) }]}>
              {patient.latestVitals?.oxygenLevel || '--'}
            </Text>
            <Text style={styles.vitalUnit}>%</Text>
          </View>

          <View style={styles.vitalItem}>
            <Icon name="thermometer-half" size={22} color={getVitalStatus('temperature', patient.latestVitals?.temperature)} />
            <Text style={styles.vitalLabel}>Temperature</Text>
            <Text style={[styles.vitalValue, { color: getVitalStatus('temperature', patient.latestVitals?.temperature) }]}>
              {patient.latestVitals?.temperature || '--'}
            </Text>
            <Text style={styles.vitalUnit}>°C</Text>
          </View>
        </View>

        <View style={styles.patientFooter}>
          <Text style={styles.lastUpdate}>
            <Icon name="clock-o" size={12} color="#64748b" /> {' '}
            {patient.latestVitals?.timestamp
              ? `${Math.floor((Date.now() - new Date(patient.latestVitals.timestamp).getTime()) / 60000)}m ago`
              : 'No data'}
          </Text>
          <View style={[styles.statusBadge, patient.status === 'active' ? styles.statusActive : styles.statusInactive]}>
            <Text style={styles.statusText}>{patient.status}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Alert Item Component
const AlertItem = ({ alert, onAcknowledge }) => (
  <View style={[
    styles.alertItem,
    alert.severity === 'critical' ? styles.alertCritical :
    alert.severity === 'warning' ? styles.alertWarning :
    styles.alertInfo
  ]}>
    <View style={styles.alertContent}>
      <View style={styles.alertLeft}>
        <Text style={styles.alertType}>{alert.type}</Text>
        <Text style={styles.alertMessage}>{alert.message}</Text>
        <Text style={styles.alertTime}>
          {alert.patientName} • {new Date(alert.timestamp).toLocaleTimeString()}
        </Text>
      </View>
      {!alert.acknowledged && (
        <TouchableOpacity
          style={styles.ackButton}
          onPress={() => onAcknowledge(alert.id)}
        >
          <Icon name="check" size={16} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

// Prescription Modal Component
const PrescriptionModal = ({ visible, patient, onClose, onSubmit }) => {
  const [medications, setMedications] = useState([
    { name: '', dosage: '', frequency: '', duration: '' },
  ]);
  const [notes, setNotes] = useState('');

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const updateMedication = (index, field, value) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const handleSubmit = () => {
    if (medications[0].name && medications[0].dosage) {
      onSubmit({ medications, notes });
      setMedications([{ name: '', dosage: '', frequency: '', duration: '' }]);
      setNotes('');
    } else {
      Alert.alert('Error', 'Please fill in at least one medication');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Prescription</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="times" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.patientNameModal}>For: {patient?.name}</Text>

            <Text style={styles.sectionTitle}>Medications:</Text>
            {medications.map((med, index) => (
              <View key={index} style={styles.medInput}>
                <TextInput
                  style={styles.input}
                  placeholder="Medicine Name *"
                  value={med.name}
                  onChangeText={(value) => updateMedication(index, 'name', value)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Dosage (e.g., 500mg) *"
                  value={med.dosage}
                  onChangeText={(value) => updateMedication(index, 'dosage', value)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Frequency (e.g., Every 8 hours)"
                  value={med.frequency}
                  onChangeText={(value) => updateMedication(index, 'frequency', value)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Duration (e.g., 7 days)"
                  value={med.duration}
                  onChangeText={(value) => updateMedication(index, 'duration', value)}
                />
              </View>
            ))}

            <TouchableOpacity style={styles.addMedButton} onPress={addMedication}>
              <Icon name="plus" size={16} color="#4a90e2" />
              <Text style={styles.addMedText}>Add Another Medication</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Doctor's Notes:</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Additional instructions..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
            />
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Icon name="prescription" size={16} color="#fff" />
              <Text style={styles.submitText}>Issue Prescription</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const DoctorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [patients, setPatients] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [activeTab, setActiveTab] = useState('patients');
  const [doctorId, setDoctorId] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    setupSocketIO();

    // Poll for live vitals every 15 seconds - GLOBAL for all patients
    const vitalsInterval = setInterval(async () => {
      try {
        const liveVitals = await apiClient.getLiveVitals();
        if (liveVitals) {
          // Apply same vitals to ALL patients globally
          setPatients(prev => prev.map(p => ({
            ...p,
            latestVitals: {
              ...liveVitals,
              patientId: p.id
            }
          })));
        }
      } catch (error) {
        console.error('Live vitals update error:', error);
      }
    }, 15000);

    return () => clearInterval(vitalsInterval);
  }, []);

  const setupSocketIO = async () => {
    try {
      const profile = await apiClient.getProfile();
      const docId = profile?.data?._id;
      setDoctorId(docId);

      await initializeSocket();
      const socket = getSocket();
      if (socket) {
        joinRoom(`doctor:${docId}`);

        socket.on('vitals:update', (data) => {
          setPatients((prev) =>
            prev.map((p) => (p.id === data.patientId ? { ...p, latestVitals: data.vitals } : p))
          );
        });

        socket.on('alert:new', (alert) => {
          setAlerts((prev) => [
            {
              id: alert._id,
              type: alert.type,
              message: alert.message,
              severity: alert.severity,
              patientName: 'Patient',
              timestamp: alert.createdAt,
              acknowledged: false,
            },
            ...prev,
          ]);
        });
      }
    } catch (error) {
      console.error('Socket setup error:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const patientsResponse = await apiClient.getDoctorPatients();
      const patientsData = patientsResponse?.data || [];

      // Fetch live vitals from Matrix server
      const liveVitals = await apiClient.getLiveVitals();

      setPatients(
        patientsData.map((patient) => ({
          id: patient._id,
          name: `${patient.userId.profile.firstName} ${patient.userId.profile.lastName}`,
          hospitalId: patient.hospitalId,
          room: patient.roomNo,
          status: patient.status,
          // GLOBAL: Apply live Matrix vitals to ALL patients
          latestVitals: liveVitals ? {
            ...liveVitals,
            patientId: patient._id
          } : (patient.latestVitals || null),
          alertCount: patient.unacknowledgedAlerts || 0,
        }))
      );

      const alertsResponse = await apiClient.getAlerts();
      const alertsData = alertsResponse?.data || [];
      setAlerts(
        alertsData.map((alert) => ({
          id: alert._id,
          type: alert.type,
          message: alert.message,
          severity: alert.severity,
          patientName: alert.patientId?.userId?.profile
            ? `${alert.patientId.userId.profile.firstName} ${alert.patientId.userId.profile.lastName}`
            : 'Unknown',
          timestamp: alert.createdAt,
          acknowledged: alert.acknowledged || false,
        }))
      );
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await apiClient.acknowledgeAlert(alertId);
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)));
      Alert.alert('Success', 'Alert acknowledged');
    } catch (error) {
      Alert.alert('Error', 'Failed to acknowledge alert');
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
      setSelectedPatient(null);
      Alert.alert('Success', 'Prescription created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create prescription');
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await apiClient.logout();
          router.replace('/login');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={styles.loadingText}>Loading Doctor Dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Blue Gradient */}
      <LinearGradient
        colors={['#2563eb', '#1e40af']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Doctor Portal</Text>
            <Text style={styles.headerSubtitle}>Patient Care Management</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Icon name="sign-out" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'patients' && styles.tabActive]}
          onPress={() => setActiveTab('patients')}
        >
          <Icon name="users" size={16} color={activeTab === 'patients' ? '#2563eb' : '#94a3b8'} />
          <Text style={[styles.tabText, activeTab === 'patients' && styles.tabTextActive]}>
            Patients ({patients.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'alerts' && styles.tabActive]}
          onPress={() => setActiveTab('alerts')}
        >
          <Icon name="bell" size={16} color={activeTab === 'alerts' ? '#2563eb' : '#94a3b8'} />
          <Text style={[styles.tabText, activeTab === 'alerts' && styles.tabTextActive]}>
            Alerts ({alerts.filter((a) => !a.acknowledged).length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchDashboardData} colors={['#2563eb']} />}
      >
        {activeTab === 'patients' ? (
          <View style={styles.patientsGrid}>
            {patients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onPress={(p) => {
                  setSelectedPatient(p);
                  setShowPrescriptionModal(true);
                }}
              />
            ))}
          </View>
        ) : (
          <View style={styles.alertsList}>
            <Text style={styles.sectionTitle}>
              <Icon name="bell" size={18} color="#ef4444" /> My Alerts
            </Text>
            {alerts.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="check-circle" size={48} color="#10b981" />
                <Text style={styles.emptyText}>No alerts</Text>
              </View>
            ) : (
              alerts.map((alert) => (
                <AlertItem key={alert.id} alert={alert} onAcknowledge={handleAcknowledgeAlert} />
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Prescription Modal */}
      <PrescriptionModal
        visible={showPrescriptionModal}
        patient={selectedPatient}
        onClose={() => {
          setShowPrescriptionModal(false);
          setSelectedPatient(null);
        }}
        onSubmit={handleCreatePrescription}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#2563eb',
  },
  tabText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  patientsGrid: {
    padding: 16,
    gap: 16,
  },
  patientCardContainer: {
    marginBottom: 0,
  },
  patientCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  patientId: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  alertBadge: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  vitalsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  vitalItem: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    minWidth: 80,
  },
  vitalLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 6,
    fontWeight: '600',
  },
  vitalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  patientFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  lastUpdate: {
    fontSize: 12,
    color: '#64748b',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#dcfce7',
  },
  statusInactive: {
    backgroundColor: '#f1f5f9',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
    textTransform: 'uppercase',
  },
  alertsList: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 12,
  },
  alertItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  alertCritical: {
    borderLeftColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  alertWarning: {
    borderLeftColor: '#f59e0b',
    backgroundColor: '#fffbeb',
  },
  alertInfo: {
    borderLeftColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  alertContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertLeft: {
    flex: 1,
  },
  alertType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  alertTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
  ackButton: {
    backgroundColor: '#10b981',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalBody: {
    padding: 20,
  },
  patientNameModal: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 20,
  },
  medInput: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  notesInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 100,
    textAlignVertical: 'top',
  },
  addMedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  addMedText: {
    color: '#4a90e2',
    fontWeight: '700',
    fontSize: 15,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
  cancelText: {
    color: '#64748b',
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4a90e2',
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DoctorDashboard;
