import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Modal,
  TextInput,
  Alert,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Card } from 'react-native-elements';
import BottomNav from './Components/BottomNav';

const windowWidth = Dimensions.get('window').width;

const Profile = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    dateJoined: new Date().toISOString().split('T')[0],
    treatment: '',
    status: 'Active'
  });

  const [patients, setPatients] = useState([
    {
      id: 1,
      name: 'John Doe',
      dateJoined: '2023-05-01',
      treatment: 'Cardiac Care',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Jane Smith',
      dateJoined: '2023-04-28',
      treatment: 'Orthopedic Surgery',
      status: 'Discharged'
    },
    // Add more mock data as needed
  ]);

  const stats = {
    totalPatients: 150,
    currentPatients: 12,
    dischargedPatients: 138
  };

  const handleAddPatient = () => {
    if (!newPatient.name || !newPatient.treatment) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const newPatientData = {
      id: patients.length + 1,
      name: newPatient.name,
      dateJoined: new Date().toISOString().split('T')[0],
      treatment: newPatient.treatment,
      status: 'Active'
    };

    setPatients([newPatientData, ...patients]); // Add to beginning of list
    setModalVisible(false);
    setNewPatient({ // Reset form
      name: '',
      dateJoined: new Date().toISOString().split('T')[0],
      treatment: '',
      status: 'Active'
    });
    Alert.alert('Success', 'Patient added successfully');
  };

  const StatBox = ({ icon, title, value, color, backgroundColor }) => (
    <View style={[styles.statBox, { backgroundColor }]}>
      <Icon name={icon} size={28} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Doctor's Dashboard</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Icon name="plus" size={16} color="#fff" />
          <Text style={styles.addButtonText}>Add Patient</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsContainer}>
          <StatBox 
            icon="users" 
            title="Total Patients" 
            value={stats.totalPatients}
            color="#fff"
            backgroundColor="#4a90e2"
          />
          <StatBox 
            icon="bed" 
            title="Current" 
            value={stats.currentPatients}
            color="#fff"
            backgroundColor="#2ecc71"
          />
          <StatBox 
            icon="user-times" 
            title="Discharged" 
            value={stats.dischargedPatients}
            color="#fff"
            backgroundColor="#9b59b6"
          />
        </View>

        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Patients</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.columnHeader, styles.nameColumn]}>Name</Text>
              <Text style={[styles.columnHeader, styles.dateColumn]}>Joined</Text>
              <Text style={[styles.columnHeader, styles.treatmentColumn]}>Treatment</Text>
              <Text style={[styles.columnHeader, styles.statusColumn]}>Status</Text>
              <Text style={[styles.columnHeader, styles.actionColumn]}>Action</Text>
    </View>
            
            <ScrollView style={styles.tableContent}>
              {patients.map((patient) => (
                <View key={patient.id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.nameColumn]}>{patient.name}</Text>
                  <Text style={[styles.tableCell, styles.dateColumn]}>
                    {new Date(patient.dateJoined).toLocaleDateString()}
                  </Text>
                  <Text style={[styles.tableCell, styles.treatmentColumn]}>{patient.treatment}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: patient.status === 'Active' ? '#e8f5e9' : '#e3f2fd' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: patient.status === 'Active' ? '#2e7d32' : '#1565c0' }
                    ]}>
                      {patient.status}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.viewButton}
                    onPress={() => {/* Handle view report */}}
                  >
                    <Text style={styles.viewButtonText}>View</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setNewPatient({ // Reset form on close
            name: '',
            dateJoined: new Date().toISOString().split('T')[0],
            treatment: '',
            status: 'Active'
          });
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Patient</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Icon name="times" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Patient Name"
              value={newPatient.name}
              onChangeText={(text) => setNewPatient({...newPatient, name: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Treatment"
              value={newPatient.treatment}
              onChangeText={(text) => setNewPatient({...newPatient, treatment: text})}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setNewPatient({ // Reset form on cancel
                    name: '',
                    dateJoined: new Date().toISOString().split('T')[0],
                    treatment: '',
                    status: 'Active'
                  });
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleAddPatient}
              >
                <Text style={styles.buttonText}>Add Patient</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNav />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  header: {
    padding: 20,
    backgroundColor: '#4a90e2',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    paddingTop: 25, // Increase top padding
  },
  statBox: {
    width: (windowWidth - 60) / 3, // Adjust width for better spacing
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  recentSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 15,
    marginTop: 5, // Adjust top margin
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    color: '#4a90e2',
    fontSize: 14,
  },
  tableContainer: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  columnHeader: {
    fontWeight: 'bold',
    color: '#666',
    fontSize: 13,
  },
  tableContent: {
    maxHeight: 400,
    marginTop: 5, // Add margin to table content
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tableCell: {
    fontSize: 14,
    color: '#333',
  },
  nameColumn: { width: '25%' },
  dateColumn: { width: '20%' },
  treatmentColumn: { width: '25%' },
  statusColumn: { width: '15%' },
  actionColumn: { width: '15%' },
  statusBadge: {
    padding: 4,
    borderRadius: 4,
    width: '15%',
  },
  statusText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  viewButton: {
    backgroundColor: '#4a90e2',
    padding: 6,
    borderRadius: 4,
    width: '15%',
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
  },
  submitButton: {
    backgroundColor: '#2ecc71',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  card: {
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
});

export default Profile;