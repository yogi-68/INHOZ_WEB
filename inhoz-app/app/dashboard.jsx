import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Card } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome'
import BottomNav from './Components/BottomNav'
import DrawerNav from './Components/DrawerNav'

const windowWidth = Dimensions.get('window').width;
const cardWidth = (windowWidth - 40) / 2; // 40 = total horizontal padding (20 * 2)

const PatientCard = ({ patient }) => (
  <View style={styles.patientCard}>
    <Image
      source={{ uri: `https://randomuser.me/api/portraits/men/${patient.id}.jpg` }}
      style={styles.patientImage}
    />
    <Text style={styles.patientName}>{patient.name}</Text>
    
    <View style={styles.vitalsContainer}>
      <View style={styles.vitalItem}>
        <Icon name="heartbeat" size={16} color="#ff4757" />
        <Text style={styles.vitalLabel}>HR</Text>
        <Text style={styles.vitalValue}>{patient.heartRate}</Text>
      </View>
      
      <View style={styles.vitalItem}>
        <Icon name="stethoscope" size={16} color="#2e86de" />
        <Text style={styles.vitalLabel}>SpO2</Text>
        <Text style={styles.vitalValue}>{patient.spO2}</Text>
      </View>
      
      <View style={styles.vitalItem}>
        <Icon name="thermometer-half" size={16} color="#ff6b6b" />
        <Text style={styles.vitalLabel}>Temp</Text>
        <Text style={styles.vitalValue}>{patient.temp}</Text>
      </View>
    </View>

    <TouchableOpacity 
      style={styles.viewButton}
      onPress={() => router.push({
        pathname: '/vitals',
        params: { patientId: patient.id }
      })}
    >
      <Text style={styles.viewButtonText}>View Details</Text>
      <Icon name="arrow-right" size={12} color="#fff" style={styles.buttonIcon} />
    </TouchableOpacity>
  </View>
)

const Dashboard = () => {
  const patients = [
    {
      id: 1,
      name: 'John Smith',
      heartRate: '82 bpm',
      spO2: '96%',
      temp: '38.6°C',
    },
    {
      id: 2,
      name: 'Emma Wilson',
      heartRate: '75 bpm',
      spO2: '98%',
      temp: '37.2°C',
    },
    {
      id: 3,
      name: 'Michael Brown',
      heartRate: '68 bpm',
      spO2: '97%',
      temp: '36.8°C',
    },
    {
      id: 4,
      name: 'Sarah Davis',
      heartRate: '88 bpm',
      spO2: '95%',
      temp: '37.5°C',
    },
    {
      id: 5,
      name: 'Robert Taylor',
      heartRate: '72 bpm',
      spO2: '98%',
      temp: '37.0°C',
    },
    {
      id: 6,
      name: 'Lisa Anderson',
      heartRate: '78 bpm',
      spO2: '96%',
      temp: '37.8°C',
    },
    {
      id: 7,
      name: 'David Miller',
      heartRate: '65 bpm',
      spO2: '97%',
      temp: '36.9°C',
    },
    {
      id: 8,
      name: 'Jennifer White',
      heartRate: '90 bpm',
      spO2: '94%',
      temp: '38.2°C',
    },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <DrawerNav />
      <View style={styles.header}>
        <Text style={styles.title}>Patients Dashboard</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.grid}>
          {patients.map((patient, index) => (
            <View key={patient.id} style={[
              styles.cardWrapper,
              index % 2 === 0 ? styles.leftCard : styles.rightCard
            ]}>
              <PatientCard patient={patient} />
            </View>
          ))}
        </View>
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    },
    header: {
        padding: windowWidth * 0.05, // 5% of screen width
        backgroundColor: '#4a90e2',
    },
    title: {
        fontSize: Math.min(windowWidth * 0.06, 24), // Responsive font size with max limit
        fontWeight: 'bold',
        color: '#fff',
        marginLeft:50,
    },
    content: {
        flex: 1,
    },
    grid: {
        padding: windowWidth * 0.02, // 2% padding
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between'
    },
    cardWrapper: {
        width: windowWidth * 0.46, // Slightly less than 50% to account for margins
        marginBottom: windowWidth * 0.03, // 3% margin bottom
    },
    patientCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: windowWidth * 0.03,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        height: windowWidth * 0.55, // Maintain aspect ratio
    },
    patientImage: {
        width: windowWidth * 0.15,
        height: windowWidth * 0.15,
        borderRadius: windowWidth * 0.075,
        alignSelf: 'center',
        marginBottom: windowWidth * 0.02,
    },
    patientName: {
        fontSize: Math.min(windowWidth * 0.04, 16),
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: windowWidth * 0.02,
    },
    vitalsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: windowWidth * 0.02,
        paddingHorizontal: windowWidth * 0.01,
    },
    vitalItem: {
        alignItems: 'center',
        width: '30%', // Ensure equal width distribution
    },
    vitalLabel: {
        fontSize: Math.min(windowWidth * 0.025, 10),
        color: '#666',
        marginTop: 2,
    },
    vitalValue: {
        fontSize: Math.min(windowWidth * 0.03, 12),
        fontWeight: 'bold',
        marginTop: 2,
    },
    viewButton: {
        backgroundColor: '#4a90e2',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: windowWidth * 0.02,
        borderRadius: 6,
        marginTop: 'auto',
    },
    viewButtonText: {
        color: '#fff',
        fontSize: Math.min(windowWidth * 0.035, 14),
        fontWeight: 'bold',
        marginRight: 4,
    },
    buttonIcon: {
        marginLeft: 2,
    },
})

export default Dashboard 