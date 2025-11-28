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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import { router } from 'expo-router';
import apiClient from './utils/api';
import { getSocket, initializeSocket, joinRoom } from './utils/socket';

const { width } = Dimensions.get('window');

// KPI Card Component with Gradient
const KPICard = ({ icon, title, value, subtitle, gradient, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.kpiCardContainer}>
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.kpiCard}
    >
      <View style={styles.kpiIconContainer}>
        <Icon name={icon} size={32} color="rgba(255,255,255,0.9)" />
      </View>
      <Text style={styles.kpiTitle}>{title}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
      {subtitle && <Text style={styles.kpiSubtitle}>{subtitle}</Text>}
    </LinearGradient>
  </TouchableOpacity>
);

// Mini Alert Item
const AlertItem = ({ alert }) => (
  <View style={[
    styles.alertItem,
    alert.severity === 'critical' ? styles.alertCritical :
    alert.severity === 'warning' ? styles.alertWarning :
    styles.alertInfo
  ]}>
    <View style={styles.alertHeader}>
      <Text style={styles.alertType}>{alert.type}</Text>
      <Text style={[
        styles.alertBadge,
        alert.severity === 'critical' ? styles.badgeCritical :
        alert.severity === 'warning' ? styles.badgeWarning :
        styles.badgeInfo
      ]}>
        {alert.severity.toUpperCase()}
      </Text>
    </View>
    <Text style={styles.alertMessage}>{alert.message}</Text>
    <Text style={styles.alertTime}>
      {alert.patientName} • {new Date(alert.timestamp).toLocaleTimeString()}
    </Text>
  </View>
);

// Doctor Card Component
const DoctorCard = ({ doctor }) => (
  <View style={styles.doctorCard}>
    <View style={styles.doctorHeader}>
      <View style={styles.doctorAvatar}>
        <Icon name="user-md" size={28} color="#7c3aed" />
      </View>
      <View style={styles.doctorInfo}>
        <Text style={styles.doctorName}>{doctor.name}</Text>
        <Text style={styles.doctorSpecialization}>{doctor.specialization}</Text>
      </View>
    </View>
    <View style={styles.doctorDetails}>
      <View style={styles.doctorDetailRow}>
        <Icon name="envelope" size={14} color="#64748b" />
        <Text style={styles.doctorDetailText}>{doctor.email}</Text>
      </View>
      <View style={styles.doctorDetailRow}>
        <Icon name="phone" size={14} color="#64748b" />
        <Text style={styles.doctorDetailText}>{doctor.phone}</Text>
      </View>
      <View style={styles.doctorDetailRow}>
        <Icon name="users" size={14} color="#64748b" />
        <Text style={styles.doctorDetailText}>{doctor.patientCount} patients</Text>
      </View>
    </View>
  </View>
);

// Patient Card Component
const PatientCard = ({ patient }) => (
  <View style={styles.patientCard}>
    <View style={styles.patientHeader}>
      <View style={styles.patientAvatar}>
        <Icon name="user" size={28} color="#3b82f6" />
      </View>
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>{patient.name}</Text>
        <Text style={styles.patientId}>ID: {patient.hospitalId}</Text>
      </View>
      <View style={[
        styles.statusBadge,
        patient.status === 'admitted' ? styles.statusAdmitted :
        patient.status === 'discharged' ? styles.statusDischarged :
        styles.statusTransferred
      ]}>
        <Text style={styles.statusText}>{patient.status}</Text>
      </View>
    </View>
    <View style={styles.patientDetails}>
      <View style={styles.patientDetailRow}>
        <Icon name="bed" size={14} color="#64748b" />
        <Text style={styles.patientDetailText}>Room: {patient.room}</Text>
      </View>
      <View style={styles.patientDetailRow}>
        <Icon name="user-md" size={14} color="#64748b" />
        <Text style={styles.patientDetailText}>{patient.doctorName}</Text>
      </View>
    </View>
  </View>
);

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    activePatients: 0,
    criticalAlerts: 0,
    doctorsOnDuty: 0,
    revenueToday: 0,
    revenueMonth: 0,
    devicesOffline: 0,
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    setupSocketIO();
  }, []);

  const setupSocketIO = async () => {
    try {
      await initializeSocket();
      const socket = getSocket();
      if (socket) {
        joinRoom('admin');
        
        socket.on('alert:new', (alert) => {
          if (alert.severity === 'critical') {
            setStats(prev => ({ ...prev, criticalAlerts: prev.criticalAlerts + 1 }));
            setRecentAlerts(prev => [{
              id: alert._id,
              type: alert.type,
              message: alert.message,
              severity: alert.severity,
              patientName: alert.patientId?.userId?.profile ? 
                `${alert.patientId.userId.profile.firstName} ${alert.patientId.userId.profile.lastName}` :
                'Patient',
              timestamp: alert.createdAt,
            }, ...prev.slice(0, 4)]);
          }
        });

        socket.on('patient:new', () => {
          // Refresh patient list when new patient is added
          fetchDashboardData();
        });

        socket.on('doctor:new', () => {
          // Refresh doctor list when new doctor is added
          fetchDashboardData();
        });

        socket.on('patient:updated', () => {
          // Refresh when patient is updated (e.g., doctor assigned)
          fetchDashboardData();
        });

        socket.on('device:offline', () => {
          setStats(prev => ({ ...prev, devicesOffline: prev.devicesOffline + 1 }));
        });

        socket.on('device:online', () => {
          setStats(prev => ({ ...prev, devicesOffline: Math.max(0, prev.devicesOffline - 1) }));
        });
      }
    } catch (error) {
      console.error('Socket setup error:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAdminDashboard();
      const data = response?.data || {};

      setStats({
        activePatients: data.patients?.active || 0,
        criticalAlerts: data.alerts?.unacknowledged || 0,
        doctorsOnDuty: data.doctors?.active || 0,
        revenueToday: 0,
        revenueMonth: 0,
        devicesOffline: 0,
      });

      // Fetch doctors list
      const doctorsResponse = await apiClient.getDoctors();
      const doctorsData = doctorsResponse?.data || [];
      setDoctors(doctorsData.map(doc => ({
        id: doc._id,
        name: `${doc.userId.profile.firstName} ${doc.userId.profile.lastName}`,
        email: doc.userId.email,
        specialization: doc.specialization || 'General Medicine',
        phone: doc.userId.profile.phone || 'N/A',
        patientCount: doc.assignedPatients?.length || 0,
      })));

      // Fetch patients list
      const patientsResponse = await apiClient.getAdminPatients();
      const patientsData = patientsResponse?.data || [];
      setPatients(patientsData.map(patient => ({
        id: patient._id,
        name: `${patient.userId.profile.firstName} ${patient.userId.profile.lastName}`,
        hospitalId: patient.hospitalId || 'N/A',
        room: patient.roomNo || 'N/A',
        status: patient.status || 'admitted',
        doctorName: patient.assignedDoctorId?.userId?.profile ? 
          `${patient.assignedDoctorId.userId.profile.firstName} ${patient.assignedDoctorId.userId.profile.lastName}` : 
          'Not assigned',
      })));

      // Fetch real alerts
      const alertsResponse = await apiClient.getAlerts();
      const alertsData = alertsResponse?.data || [];
      setRecentAlerts(alertsData.slice(0, 5).map(alert => ({
        id: alert._id,
        type: alert.type || 'Alert',
        message: alert.message || alert.description || 'Alert triggered',
        severity: alert.severity || 'warning',
        patientName: alert.patientId?.userId?.profile ? 
          `${alert.patientId.userId.profile.firstName} ${alert.patientId.userId.profile.lastName}` :
          'Unknown Patient',
        timestamp: alert.triggeredAt || alert.createdAt || new Date(),
      })));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await apiClient.logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={styles.loadingText}>Loading Admin Dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Purple Gradient */}
      <LinearGradient
        colors={['#7c3aed', '#5b21b6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Admin Portal</Text>
            <Text style={styles.headerSubtitle}>System Management</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Icon name="sign-out" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
          onPress={() => setActiveTab('overview')}
        >
          <Icon name="dashboard" size={16} color={activeTab === 'overview' ? '#7c3aed' : '#94a3b8'} />
          <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'doctors' && styles.tabActive]}
          onPress={() => setActiveTab('doctors')}
        >
          <Icon name="user-md" size={16} color={activeTab === 'doctors' ? '#7c3aed' : '#94a3b8'} />
          <Text style={[styles.tabText, activeTab === 'doctors' && styles.tabTextActive]}>
            Doctors
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'patients' && styles.tabActive]}
          onPress={() => setActiveTab('patients')}
        >
          <Icon name="users" size={16} color={activeTab === 'patients' ? '#7c3aed' : '#94a3b8'} />
          <Text style={[styles.tabText, activeTab === 'patients' && styles.tabTextActive]}>
            Patients
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchDashboardData} colors={['#7c3aed']} />
        }
      >
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* KPI Cards with Gradients */}
            <View style={styles.kpiGrid}>
              <KPICard
                icon="bed"
                title="Active Patients"
                value={stats.activePatients}
                subtitle="Currently admitted"
                gradient={['#8b5cf6', '#7c3aed']}
              />
              <KPICard
                icon="exclamation-triangle"
                title="Critical Alerts"
                value={stats.criticalAlerts}
                subtitle="Requires attention"
                gradient={['#ef4444', '#dc2626']}
              />
              <KPICard
                icon="user-md"
                title="Doctors On Duty"
                value={stats.doctorsOnDuty}
                subtitle="Active now"
                gradient={['#10b981', '#059669']}
              />
              <KPICard
                icon="dollar"
                title="Revenue (Today)"
                value={`$${stats.revenueToday.toLocaleString()}`}
                subtitle="Daily earnings"
                gradient={['#f59e0b', '#d97706']}
              />
              <KPICard
                icon="line-chart"
                title="Revenue (Month)"
                value={`$${stats.revenueMonth.toLocaleString()}`}
                subtitle="Monthly total"
                gradient={['#6366f1', '#4f46e5']}
              />
              <KPICard
                icon="server"
                title="Devices Status"
                value={stats.devicesOffline}
                subtitle={stats.devicesOffline > 0 ? 'Offline' : 'All online'}
                gradient={stats.devicesOffline > 0 ? ['#ef4444', '#dc2626'] : ['#10b981', '#059669']}
              />
            </View>

            {/* Recent Alerts */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Icon name="bell" size={18} color="#ef4444" /> Recent Critical Alerts
              </Text>
              {recentAlerts.length === 0 ? (
                <View style={styles.emptyState}>
                  <Icon name="check-circle" size={48} color="#10b981" />
                  <Text style={styles.emptyText}>No critical alerts</Text>
                </View>
              ) : (
                recentAlerts.map((alert) => (
                  <AlertItem key={alert.id} alert={alert} />
                ))
              )}
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionGrid}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => Alert.alert('Add Doctor', 'Doctor registration form coming soon')}
                >
                  <Icon name="user-plus" size={24} color="#4a90e2" />
                  <Text style={styles.actionText}>Add Doctor</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => Alert.alert('Add Patient', 'Patient admission form coming soon')}
                >
                  <Icon name="user-plus" size={24} color="#4a90e2" />
                  <Text style={styles.actionText}>Add Patient</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => Alert.alert('Reports', 'Analytics and reports coming soon')}
                >
                  <Icon name="file-text" size={24} color="#4a90e2" />
                  <Text style={styles.actionText}>Reports</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => router.push('/settings')}
                >
                  <Icon name="cog" size={24} color="#4a90e2" />
                  <Text style={styles.actionText}>Settings</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* Doctors Tab */}
        {activeTab === 'doctors' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Icon name="user-md" size={18} color="#10b981" /> All Doctors ({doctors.length})
            </Text>
            {doctors.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="user-md" size={48} color="#94a3b8" />
                <Text style={styles.emptyText}>No doctors found</Text>
              </View>
            ) : (
              doctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))
            )}
          </View>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Icon name="users" size={18} color="#3b82f6" /> All Patients ({patients.length})
            </Text>
            {patients.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="users" size={48} color="#94a3b8" />
                <Text style={styles.emptyText}>No patients found</Text>
              </View>
            ) : (
              patients.map((patient) => (
                <PatientCard key={patient.id} patient={patient} />
              ))
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
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#7c3aed',
  },
  tabText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#7c3aed',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  kpiGrid: {
    padding: 16,
    gap: 16,
  },
  kpiCardContainer: {
    marginBottom: 0,
  },
  kpiCard: {
    borderRadius: 20,
    padding: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    alignItems: 'center',
  },
  kpiIconContainer: {
    marginBottom: 12,
  },
  kpiTitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
  },
  kpiValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
  },
  kpiSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 6,
    textAlign: 'center',
  },
  section: {
    padding: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  alertItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  alertBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeCritical: {
    backgroundColor: '#ef4444',
    color: '#fff',
  },
  badgeWarning: {
    backgroundColor: '#f59e0b',
    color: '#fff',
  },
  badgeInfo: {
    backgroundColor: '#3b82f6',
    color: '#fff',
  },
  alertMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  alertTime: {
    fontSize: 12,
    color: '#999',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: (width - 64) / 2,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionText: {
    fontSize: 14,
    color: '#1e293b',
    marginTop: 12,
    fontWeight: '700',
  },
  // Doctor Card Styles
  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  doctorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  doctorSpecialization: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  doctorDetails: {
    gap: 8,
  },
  doctorDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  doctorDetailText: {
    fontSize: 14,
    color: '#64748b',
  },
  // Patient Card Styles
  patientCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  patientAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  patientId: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusAdmitted: {
    backgroundColor: '#dcfce7',
  },
  statusDischarged: {
    backgroundColor: '#f1f5f9',
  },
  statusTransferred: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#1e293b',
  },
  patientDetails: {
    gap: 8,
  },
  patientDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  patientDetailText: {
    fontSize: 14,
    color: '#64748b',
  },
});

export default AdminDashboard;
