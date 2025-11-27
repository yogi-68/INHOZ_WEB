import React from 'react';
import { StyleSheet, View, Text, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import { router } from 'expo-router';
import BottomNav from './Components/BottomNav';
import DrawerNav from './Components/DrawerNav';

const windowWidth = Dimensions.get('window').width;

const DetailedHistory = () => {
  // Mock historical data
  const historicalData = [
    {
      date: '2024-03-15',
      time: '09:30 AM',
      temperature: '37.2°C',
      heartRate: '72 bpm',
      bloodPressure: '120/80 mmHg',
      spO2: '98%',
      status: 'Normal',
    },
    {
      date: '2024-03-14',
      time: '10:15 AM',
      temperature: '37.5°C',
      heartRate: '75 bpm',
      bloodPressure: '118/79 mmHg',
      spO2: '97%',
      status: 'Normal',
    },
    // Add more historical entries as needed
  ];

  const renderHistoryCard = (entry) => (
    <Card containerStyle={styles.historyCard}>
      <View style={styles.dateHeader}>
        <Text style={styles.date}>{entry.date}</Text>
        <Text style={styles.time}>{entry.time}</Text>
      </View>
      
      <View style={styles.vitalsGrid}>
        <View style={styles.vitalItem}>
          <Icon name="thermometer-half" size={16} color="#4a90e2" />
          <Text style={styles.vitalLabel}>Temperature</Text>
          <Text style={styles.vitalValue}>{entry.temperature}</Text>
        </View>
        
        <View style={styles.vitalItem}>
          <Icon name="heartbeat" size={16} color="#e74c3c" />
          <Text style={styles.vitalLabel}>Heart Rate</Text>
          <Text style={styles.vitalValue}>{entry.heartRate}</Text>
        </View>
        
        <View style={styles.vitalItem}>
          <Icon name="stethoscope" size={16} color="#2ecc71" />
          <Text style={styles.vitalLabel}>Blood Pressure</Text>
          <Text style={styles.vitalValue}>{entry.bloodPressure}</Text>
        </View>
        
        <View style={styles.vitalItem}>
          <Icon name="tint" size={16} color="#3498db" />
          <Text style={styles.vitalLabel}>SpO2</Text>
          <Text style={styles.vitalValue}>{entry.spO2}</Text>
        </View>
      </View>
      
      <View style={styles.statusContainer}>
        <Text style={[styles.status, { color: entry.status === 'Normal' ? '#2ecc71' : '#e74c3c' }]}>
          Status: {entry.status}
        </Text>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <DrawerNav />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Icon name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Detailed History</Text>
      </View>

      <ScrollView style={styles.content}>
        {historicalData.map((entry, index) => (
          <View key={index}>
            {renderHistoryCard(entry)}
          </View>
        ))}
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
};

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
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: Math.min(windowWidth * 0.06, 24),
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 35,
  },
  content: {
    flex: 1,
    padding: windowWidth * 0.02,
  },
  historyCard: {
    borderRadius: 12,
    marginBottom: windowWidth * 0.03,
    padding: windowWidth * 0.04,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  time: {
    fontSize: 14,
    color: '#666',
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  vitalItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  vitalLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  vitalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  statusContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    marginTop: 5,
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
  },
});

export default DetailedHistory; 