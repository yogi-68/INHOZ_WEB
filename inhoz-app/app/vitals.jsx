import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Dimensions, Platform, StatusBar } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/FontAwesome'
import BottomNav from './Components/BottomNav'
import DrawerNav from './Components/DrawerNav'
import { generateAndDownloadReport } from './Components/VitalsReport'
import { useLocalSearchParams } from 'expo-router'
import { useRouter } from 'expo-router'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import * as Print from 'expo-print'

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const scaleFactor = Math.min(windowWidth / 375, windowHeight / 812); // Base scale on iPhone X dimensions

const VitalCard = ({ icon, title, value, unit, status }) => {
  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case 'normal':
        return '#4CAF50'
      case 'elevated':
        return '#FF5722'
      case 'low':
        return '#F44336'
      default:
        return '#666'
    }
  }

  return (
    <View style={styles.vitalCard}>
      <View style={styles.vitalHeader}>
        <Icon name={icon} size={24 * scaleFactor} color="#4a90e2" />
        <Text style={styles.vitalTitle}>{title}</Text>
      </View>
      <View style={styles.vitalContent}>
        <Text style={styles.vitalValue}>{value}</Text>
        <Text style={styles.vitalUnit}>{unit}</Text>
      </View>
      <Text style={[styles.vitalStatus, { color: getStatusColor() }]}>
        Status: {status}
      </Text>
    </View>
  )
}

const Vitals = () => {
  const { patientId } = useLocalSearchParams();
  const patientName = `Patient ${patientId}`;
  const router = useRouter();
  
  const vitalsData = {
    temperature: { value: 36.0, unit: '°C', status: 'Normal' },
    pulse: { value: 63, unit: 'bpm', status: 'Normal' },
    heartRate: { value: 106, unit: 'bpm', status: 'Elevated' },
    spO2: { value: 94, unit: '%', status: 'Low' },
    ivLevel: { value: 30, unit: '%', status: 'Normal' },
    bloodPressure: { value: '98/79', unit: 'mmHg', status: 'Normal' },
  }

  const handleDownloadReport = async () => {
    try {
      // Create HTML content for the PDF
      const htmlContent = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .title { font-size: 24px; color: #4a90e2; margin-bottom: 10px; }
              .date { color: #666; margin-bottom: 20px; }
              .vital-grid { 
                display: grid; 
                grid-template-columns: repeat(2, 1fr); 
                gap: 15px; 
              }
              .vital-card { 
                border: 1px solid #ddd; 
                padding: 15px; 
                border-radius: 8px;
                margin-bottom: 15px;
              }
              .vital-title { font-size: 16px; color: #333; margin-bottom: 10px; }
              .vital-value { font-size: 20px; font-weight: bold; color: #4a90e2; }
              .vital-status { margin-top: 5px; }
              .status-normal { color: #4CAF50; }
              .status-elevated { color: #FF5722; }
              .status-low { color: #F44336; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 class="title">Patient Vitals Report</h1>
              <div class="date">Date: ${new Date().toLocaleDateString()}</div>
              <div class="patient">Patient: ${patientName}</div>
            </div>
            
            <div class="vital-grid">
              <div class="vital-card">
                <div class="vital-title">Temperature</div>
                <div class="vital-value">${vitalsData.temperature.value}${vitalsData.temperature.unit}</div>
                <div class="vital-status status-${vitalsData.temperature.status.toLowerCase()}">
                  Status: ${vitalsData.temperature.status}
                </div>
              </div>
              
              <div class="vital-card">
                <div class="vital-title">Heart Rate</div>
                <div class="vital-value">${vitalsData.heartRate.value}${vitalsData.heartRate.unit}</div>
                <div class="vital-status status-${vitalsData.heartRate.status.toLowerCase()}">
                  Status: ${vitalsData.heartRate.status}
                </div>
              </div>
              
              <div class="vital-card">
                <div class="vital-title">SpO2</div>
                <div class="vital-value">${vitalsData.spO2.value}${vitalsData.spO2.unit}</div>
                <div class="vital-status status-${vitalsData.spO2.status.toLowerCase()}">
                  Status: ${vitalsData.spO2.status}
                </div>
              </div>
              
              <div class="vital-card">
                <div class="vital-title">Blood Pressure</div>
                <div class="vital-value">${vitalsData.bloodPressure.value}${vitalsData.bloodPressure.unit}</div>
                <div class="vital-status status-${vitalsData.bloodPressure.status.toLowerCase()}">
                  Status: ${vitalsData.bloodPressure.status}
                </div>
              </div>
              
              <div class="vital-card">
                <div class="vital-title">IV Level</div>
                <div class="vital-value">${vitalsData.ivLevel.value}${vitalsData.ivLevel.unit}</div>
                <div class="vital-status status-${vitalsData.ivLevel.status.toLowerCase()}">
                  Status: ${vitalsData.ivLevel.status}
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      // Generate PDF file
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });

      // Share the PDF file
      await Sharing.shareAsync(uri);

    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF report');
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <DrawerNav />
      <View style={styles.header}>
        <Text style={styles.title}>Vitals</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleDownloadReport}
          >
            <Icon name="download" size={16} color="#fff" />
            <Text style={styles.headerButtonText}>Download</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.push({
              pathname: '/report',
              params: { patientId, vitalsData: JSON.stringify(vitalsData) }
            })}
          >
            <Icon name="file-text" size={16} color="#fff" />
            <Text style={styles.headerButtonText}>View Report</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.patientInfoSection}>
          <Text style={styles.patientName}>{patientName}</Text>
          <Text style={styles.dateTime}>{new Date().toLocaleDateString()}</Text>
        </View>

        <View style={styles.grid}>
          <VitalCard
            icon="thermometer-half"
            title="Temperature"
            value={vitalsData.temperature.value}
            unit={vitalsData.temperature.unit}
            status={vitalsData.temperature.status}
          />
          <VitalCard
            icon="heartbeat"
            title="Pulse"
            value={vitalsData.pulse.value}
            unit={vitalsData.pulse.unit}
            status={vitalsData.pulse.status}
          />
          <VitalCard
            icon="heart"
            title="Heart Rate"
            value={vitalsData.heartRate.value}
            unit={vitalsData.heartRate.unit}
            status={vitalsData.heartRate.status}
          />
          <VitalCard
            icon="stethoscope"
            title="SpO2"
            value={vitalsData.spO2.value}
            unit={vitalsData.spO2.unit}
            status={vitalsData.spO2.status}
          />
          <VitalCard
            icon="tint"
            title="IV Level"
            value={vitalsData.ivLevel.value}
            unit={vitalsData.ivLevel.unit}
            status={vitalsData.ivLevel.status}
          />
          <VitalCard
            icon="stethoscope"
            title="Blood Pressure"
            value={vitalsData.bloodPressure.value}
            unit={vitalsData.bloodPressure.unit}
            status={vitalsData.bloodPressure.status}
          />
        </View>

        <View style={styles.monitoringSection}>
          <View style={styles.sectionHeader}>
            <Icon name="video-camera" size={20} color="#4a90e2" />
            <Text style={styles.sectionTitle}>Patient Monitoring</Text>
          </View>
          <View style={styles.cameraPlaceholder}>
            <Icon name="video-camera" size={32} color="#fff" />
            <Text style={styles.placeholderText}>Live Camera Feed</Text>
          </View>
        </View>

        <View style={[styles.statusSection, styles.stableStatus]}>
          <Icon name="check-circle" size={24} color="#4CAF50" />
          <View style={styles.statusContent}>
            <Text style={styles.statusTitle}>Patient Status: Stable</Text>
            <Text style={styles.statusText}>All vitals are within normal ranges.</Text>
          </View>
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
  },
  header: {
    padding: windowWidth * 0.05,
    backgroundColor: '#4a90e2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: Math.min(windowWidth * 0.06, 24),
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 50,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  headerButtonText: {
    color: '#fff',
    fontSize: Math.min(windowWidth * 0.035, 14),
    fontWeight: '500',
  },
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: windowWidth * 0.04,
  },
  patientInfoSection: {
    backgroundColor: '#fff',
    padding: windowWidth * 0.04,
    borderRadius: 12,
    marginBottom: windowWidth * 0.04,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  patientName: {
    fontSize: Math.min(windowWidth * 0.05, 20),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  dateTime: {
    fontSize: Math.min(windowWidth * 0.035, 14),
    color: '#666',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: windowWidth * 0.04,
  },
  monitoringSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: windowWidth * 0.04,
    marginBottom: windowWidth * 0.04,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: windowWidth * 0.03,
  },
  sectionTitle: {
    fontSize: Math.min(windowWidth * 0.045, 18),
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  cameraPlaceholder: {
    height: windowWidth * 0.5,
    backgroundColor: '#2c3e50',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontSize: Math.min(windowWidth * 0.04, 16),
    marginTop: 8,
  },
  statusSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: windowWidth * 0.04,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: windowWidth * 0.04,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  stableStatus: {
    backgroundColor: '#E8F5E9',
  },
  statusContent: {
    marginLeft: 12,
    flex: 1,
  },
  statusTitle: {
    fontSize: Math.min(windowWidth * 0.04, 16),
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statusText: {
    fontSize: Math.min(windowWidth * 0.035, 14),
    color: '#666',
    marginTop: 4,
  },
  vitalCard: {
    width: (windowWidth - (48 * scaleFactor)) / 2,
    marginBottom: 16 * scaleFactor,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 12 * scaleFactor,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    aspectRatio: 1,
  },
  vitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8 * scaleFactor,
  },
  vitalTitle: {
    fontSize: 16 * scaleFactor,
    marginLeft: 8 * scaleFactor,
    color: '#333',
    flex: 1,
  },
  vitalContent: {
    backgroundColor: '#fff',
    padding: 16 * scaleFactor,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  vitalValue: {
    fontSize: 28 * scaleFactor,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  vitalUnit: {
    fontSize: 14 * scaleFactor,
    color: '#666',
    marginTop: 4 * scaleFactor,
    textAlign: 'center',
  },
  vitalStatus: {
    fontSize: 14 * scaleFactor,
    marginTop: 8 * scaleFactor,
    textAlign: 'center',
  },
})

export default Vitals 