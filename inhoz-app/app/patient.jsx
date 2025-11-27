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
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import { router } from 'expo-router';
import apiClient from './utils/api';
import { getSocket, initializeSocket, joinRoom } from './utils/socket';

const { width } = Dimensions.get('window');

// Vitals Card Component with Gradient
const VitalsCard = ({ icon, title, value, unit, status }) => {
  const getStatusGradient = () => {
    if (status === 'critical') return ['#ef4444', '#dc2626'];
    if (status === 'warning') return ['#f59e0b', '#d97706'];
    if (status === 'normal') return ['#10b981', '#059669'];
    return ['#94a3b8', '#64748b'];
  };

  const gradient = getStatusGradient();

  return (
    <TouchableOpacity style={styles.vitalCardContainer}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.vitalCard}
      >
        <Icon name={icon} size={32} color="rgba(255,255,255,0.9)" />
        <Text style={styles.vitalTitle}>{title}</Text>
        <View style={styles.vitalValueContainer}>
          <Text style={styles.vitalValue}>{value || '--'}</Text>
          <Text style={styles.vitalUnit}>{unit}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{status || 'N/A'}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Prescription Item Component
const PrescriptionItem = ({ prescription }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.prescriptionCard}>
      <TouchableOpacity
        style={styles.prescriptionHeader}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.prescriptionInfo}>
          <Text style={styles.prescriptionId}>
            Prescription #{prescription.prescriptionId || prescription.id.slice(-6)}
          </Text>
          <Text style={styles.prescriptionDoctor}>By {prescription.doctorName}</Text>
          <Text style={styles.prescriptionDate}>
            {new Date(prescription.date).toLocaleDateString()}
          </Text>
        </View>
        <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color="#64748b" />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.prescriptionDetails}>
          <Text style={styles.medicationsTitle}>Medications:</Text>
          {prescription.medications.map((med, index) => (
            <View key={index} style={styles.medicationItem}>
              <View style={styles.medHeader}>
                <Icon name="pills" size={16} color="#4a90e2" />
                <Text style={styles.medName}>{med.name}</Text>
              </View>
              <View style={styles.medDetails}>
                <Text style={styles.medText}>• Dosage: {med.dosage}</Text>
                <Text style={styles.medText}>• Frequency: {med.frequency}</Text>
                <Text style={styles.medText}>• Duration: {med.duration}</Text>
              </View>
              <TouchableOpacity style={styles.markTakenButton}>
                <Icon name="check-circle" size={16} color="#fff" />
                <Text style={styles.markTakenText}>Mark as Taken</Text>
              </TouchableOpacity>
            </View>
          ))}
          {prescription.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.notesTitle}>Doctor's Notes:</Text>
              <Text style={styles.notesText}>{prescription.notes}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

// Invoice Item Component
const InvoiceItem = ({ invoice }) => (
  <View style={styles.invoiceCard}>
    <View style={styles.invoiceHeader}>
      <View>
        <Text style={styles.invoiceId}>Invoice #{invoice.invoiceId}</Text>
        <Text style={styles.invoiceDate}>
          {new Date(invoice.date).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.invoiceAmount}>${invoice.amount}</Text>
    </View>

    <View style={styles.invoiceFooter}>
      <View
        style={[
          styles.invoiceStatus,
          invoice.status === 'paid' ? styles.statusPaid : styles.statusPending,
        ]}
      >
        <Text style={styles.invoiceStatusText}>{invoice.status?.toUpperCase()}</Text>
      </View>

      <View style={styles.invoiceActions}>
        <TouchableOpacity style={styles.invoiceButton}>
          <Icon name="download" size={14} color="#4a90e2" />
        </TouchableOpacity>
        {invoice.status === 'pending' && (
          <TouchableOpacity style={[styles.invoiceButton, styles.payButton]}>
            <Icon name="credit-card" size={14} color="#fff" />
            <Text style={styles.payButtonText}>Pay</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  </View>
);

// Alert Item Component
const AlertItem = ({ alert }) => (
  <View style={[
    styles.alertItem,
    alert.severity === 'critical' ? styles.alertCritical :
    alert.severity === 'warning' ? styles.alertWarning :
    styles.alertInfo
  ]}>
    <View style={styles.alertHeader}>
      <Icon
        name="exclamation-triangle"
        size={18}
        color={
          alert.severity === 'critical' ? '#ef4444' :
          alert.severity === 'warning' ? '#f59e0b' :
          '#3b82f6'
        }
      />
      <Text style={styles.alertType}>{alert.type}</Text>
    </View>
    <Text style={styles.alertMessage}>{alert.message}</Text>
    <Text style={styles.alertTime}>
      {new Date(alert.timestamp).toLocaleString()}
    </Text>
  </View>
);

const PatientDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [patientId, setPatientId] = useState(null);
  const [latestVitals, setLatestVitals] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('vitals');

  useEffect(() => {
    fetchDashboardData();
    setupSocketIO();
  }, []);

  const setupSocketIO = async () => {
    try {
      const profile = await apiClient.getProfile();
      const patId = profile?.data?._id;
      setPatientId(patId);

      await initializeSocket();
      const socket = getSocket();
      if (socket) {
        joinRoom(`patient:${patId}`);

        socket.on('vitals:update', (data) => {
          setLatestVitals(data.vitals);
        });

        socket.on('alert:new', (alert) => {
          setAlerts((prev) => [
            {
              id: alert._id,
              type: alert.type,
              message: alert.message,
              severity: alert.severity,
              timestamp: alert.createdAt,
            },
            ...prev,
          ]);
        });

        socket.on('prescription:created', () => {
          Alert.alert('New Prescription', 'You have received a new prescription!');
          fetchDashboardData();
        });
      }
    } catch (error) {
      console.error('Socket setup error:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const profileResponse = await apiClient.getProfile();
      const profile = profileResponse?.data;
      setPatientId(profile?._id);

      if (profile?.doctorId) {
        const doctor = profile.doctorId;
        setDoctorInfo({
          name: doctor.userId?.profile
            ? `Dr. ${doctor.userId.profile.firstName} ${doctor.userId.profile.lastName}`
            : 'Doctor',
          specialization: doctor.specialization || 'General Medicine',
          phone: doctor.userId?.profile?.phone || null,
        });
      }

      const vitalsResponse = await apiClient.getPatientOwnVitals();
      const vitalsData = vitalsResponse?.data || [];
      if (vitalsData.length > 0) {
        setLatestVitals(vitalsData[0]);
      }

      const prescriptionsResponse = await apiClient.getPatientPrescriptionsOwn();
      const prescriptionsData = prescriptionsResponse?.data || [];
      setPrescriptions(
        prescriptionsData.map((prescription) => ({
          id: prescription._id,
          prescriptionId: prescription.prescriptionId || prescription._id.slice(-6),
          doctorName: prescription.doctorId?.userId?.profile
            ? `Dr. ${prescription.doctorId.userId.profile.firstName} ${prescription.doctorId.userId.profile.lastName}`
            : 'Doctor',
          date: prescription.createdAt,
          medications: prescription.medications || [],
          notes: prescription.notes || '',
          status: prescription.status || 'active',
        }))
      );

      const invoicesResponse = await apiClient.getPatientInvoicesOwn();
      const invoicesData = invoicesResponse?.data || [];
      setInvoices(
        invoicesData.map((invoice) => ({
          id: invoice._id,
          invoiceId: invoice.invoiceId,
          date: invoice.createdAt,
          amount: invoice.totalAmount,
          status: invoice.status || 'pending',
        }))
      );

      const alertsResponse = await apiClient.getPatientAlertsOwn();
      const alertsData = alertsResponse?.data || [];
      setAlerts(
        alertsData.map((alert) => ({
          id: alert._id,
          type: alert.type,
          message: alert.message,
          severity: alert.severity,
          timestamp: alert.createdAt,
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

  const handleEmergencyCall = () => {
    if (doctorInfo?.phone) {
      Linking.openURL(`tel:${doctorInfo.phone}`);
    } else {
      Alert.alert('Emergency', 'Please contact the nursing station immediately.');
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
        <Text style={styles.loadingText}>Loading Your Dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Teal Gradient */}
      <LinearGradient
        colors={['#14b8a6', '#0d9488']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Patient Portal</Text>
            <Text style={styles.headerSubtitle}>My Health Dashboard</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Icon name="sign-out" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'vitals' && styles.tabActive]}
          onPress={() => setActiveTab('vitals')}
        >
          <Icon name="heartbeat" size={16} color={activeTab === 'vitals' ? '#14b8a6' : '#94a3b8'} />
          <Text style={[styles.tabText, activeTab === 'vitals' && styles.tabTextActive]}>
            Vitals
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'prescriptions' && styles.tabActive]}
          onPress={() => setActiveTab('prescriptions')}
        >
          <Icon name="pills" size={16} color={activeTab === 'prescriptions' ? '#14b8a6' : '#94a3b8'} />
          <Text style={[styles.tabText, activeTab === 'prescriptions' && styles.tabTextActive]}>
            Meds
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'invoices' && styles.tabActive]}
          onPress={() => setActiveTab('invoices')}
        >
          <Icon name="file-text" size={16} color={activeTab === 'invoices' ? '#14b8a6' : '#94a3b8'} />
          <Text style={[styles.tabText, activeTab === 'invoices' && styles.tabTextActive]}>
            Bills
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'alerts' && styles.tabActive]}
          onPress={() => setActiveTab('alerts')}
        >
          <Icon name="bell" size={16} color={activeTab === 'alerts' ? '#14b8a6' : '#94a3b8'} />
          <Text style={[styles.tabText, activeTab === 'alerts' && styles.tabTextActive]}>
            Alerts
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchDashboardData} colors={['#14b8a6']} />}
      >
        {activeTab === 'vitals' && (
          <View style={styles.vitalsSection}>
            {/* Emergency Contact */}
            <TouchableOpacity style={styles.emergencyCard} onPress={handleEmergencyCall}>
              <View style={styles.emergencyContent}>
                <Icon name="phone" size={24} color="#fff" />
                <View style={styles.emergencyText}>
                  <Text style={styles.emergencyTitle}>Emergency Contact</Text>
                  <Text style={styles.emergencyDoctor}>
                    {doctorInfo?.name || 'No doctor assigned'}
                  </Text>
                </View>
              </View>
              <Icon name="chevron-right" size={20} color="#fff" />
            </TouchableOpacity>

            {/* Vitals Cards */}
            <View style={styles.vitalsGrid}>
              <VitalsCard
                icon="heartbeat"
                title="Heart Rate"
                value={latestVitals?.heartRate}
                unit="bpm"
                status={getVitalStatus('heartRate', latestVitals?.heartRate)}
              />
              <VitalsCard
                icon="tint"
                title="Oxygen"
                value={latestVitals?.oxygenLevel}
                unit="%"
                status={getVitalStatus('oxygenLevel', latestVitals?.oxygenLevel)}
              />
              <VitalsCard
                icon="thermometer-half"
                title="Temperature"
                value={latestVitals?.temperature}
                unit="°C"
                status={getVitalStatus('temperature', latestVitals?.temperature)}
              />
              <VitalsCard
                icon="tachometer"
                title="Blood Pressure"
                value={
                  latestVitals?.bloodPressureSystolic
                    ? `${latestVitals.bloodPressureSystolic}/${latestVitals.bloodPressureDiastolic}`
                    : null
                }
                unit="mmHg"
                status={getVitalStatus('bloodPressureSystolic', latestVitals?.bloodPressureSystolic)}
              />
            </View>

            <Text style={styles.lastUpdateText}>
              Last updated:{' '}
              {latestVitals?.timestamp
                ? new Date(latestVitals.timestamp).toLocaleString()
                : 'No data'}
            </Text>
          </View>
        )}

        {activeTab === 'prescriptions' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Icon name="pills" size={18} color="#4a90e2" /> My Prescriptions
            </Text>
            {prescriptions.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="prescription" size={48} color="#cbd5e1" />
                <Text style={styles.emptyText}>No prescriptions</Text>
              </View>
            ) : (
              prescriptions.map((prescription) => (
                <PrescriptionItem key={prescription.id} prescription={prescription} />
              ))
            )}
          </View>
        )}

        {activeTab === 'invoices' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Icon name="file-text" size={18} color="#10b981" /> My Invoices
            </Text>
            {invoices.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="file-text" size={48} color="#cbd5e1" />
                <Text style={styles.emptyText}>No invoices</Text>
              </View>
            ) : (
              invoices.map((invoice) => <InvoiceItem key={invoice.id} invoice={invoice} />)
            )}
          </View>
        )}

        {activeTab === 'alerts' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Icon name="bell" size={18} color="#f59e0b" /> My Alerts
            </Text>
            {alerts.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="check-circle" size={48} color="#10b981" />
                <Text style={styles.emptyText}>No alerts</Text>
              </View>
            ) : (
              alerts.map((alert) => <AlertItem key={alert.id} alert={alert} />)
            )}
          </View>
        )}
      </ScrollView>
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
    borderBottomColor: '#14b8a6',
  },
  tabText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#14b8a6',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  vitalsSection: {
    padding: 16,
  },
  emergencyCard: {
    backgroundColor: '#ef4444',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  emergencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  emergencyText: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  emergencyDoctor: {
    fontSize: 13,
    color: '#fecaca',
    marginTop: 4,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  vitalCardContainer: {
    width: (width - 48) / 2,
  },
  vitalCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  vitalTitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  vitalValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  vitalValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  vitalUnit: {
    fontSize: 14,
    marginLeft: 4,
    color: 'rgba(255,255,255,0.85)',
  },
  statusBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
  },
  lastUpdateText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
  },
  section: {
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
  prescriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  prescriptionInfo: {
    flex: 1,
  },
  prescriptionId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  prescriptionDoctor: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  prescriptionDate: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  prescriptionDetails: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  medicationsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  medicationItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  medHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  medName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  medDetails: {
    marginBottom: 12,
  },
  medText: {
    fontSize: 13,
    color: '#64748b',
    marginVertical: 2,
  },
  markTakenButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  markTakenText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  notesSection: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4a90e2',
  },
  notesTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 6,
  },
  notesText: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
  },
  invoiceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  invoiceId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  invoiceDate: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  invoiceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
  invoiceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  invoiceStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusPaid: {
    backgroundColor: '#dcfce7',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  invoiceStatusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#166534',
  },
  invoiceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  invoiceButton: {
    backgroundColor: '#eff6ff',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  payButton: {
    backgroundColor: '#4a90e2',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
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
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  alertType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  alertMessage: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    lineHeight: 20,
  },
  alertTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
});

export default PatientDashboard;
