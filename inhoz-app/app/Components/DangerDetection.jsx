import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Card } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';

const DangerDetection = ({ vitals }) => {
  const dangerConditions = [
    { condition: vitals?.temperature > 39, message: 'High fever detected' },
    { condition: vitals?.pulse > 120 || vitals?.pulse < 50, message: 'Abnormal pulse rate' },
    { condition: vitals?.heartRate > 120 || vitals?.heartRate < 50, message: 'Abnormal heart rate' },
    { condition: vitals?.spO2 < 90, message: 'Low blood oxygen levels' },
    { condition: vitals?.ivLevel < 10, message: 'IV level critically low' },
    { condition: vitals?.systolicBP > 180 || vitals?.diastolicBP > 120, message: 'Hypertensive crisis' },
    { condition: vitals?.systolicBP < 90 || vitals?.diastolicBP < 60, message: 'Hypotension detected' },
  ];

  const detectedDangers = dangerConditions.filter(item => item.condition);

  return (
    <View style={styles.container}>
      <Card containerStyle={styles.monitoringCard}>
        <Card.Title>Patient Monitoring</Card.Title>
        <Card.Divider />
        <View style={styles.cameraPlaceholder}>
          <Text>Camera Feed</Text>
        </View>
      </Card>

      <Card containerStyle={[
        styles.statusCard,
        detectedDangers.length === 0 ? styles.stableCard : styles.dangerCard
      ]}>
        <View style={styles.statusHeader}>
          <Icon
            name="exclamation-triangle"
            size={24}
            color={detectedDangers.length === 0 ? '#4CAF50' : '#f44336'}
          />
          <Text style={styles.statusTitle}>
            Patient Status: {detectedDangers.length === 0 ? 'Stable' : 'Requires Attention'}
          </Text>
        </View>

        {detectedDangers.length === 0 ? (
          <Text style={styles.normalText}>All vitals are within normal ranges.</Text>
        ) : (
          <View style={styles.dangerList}>
            {detectedDangers.map((danger, index) => (
              <Text key={index} style={styles.dangerText}>• {danger.message}</Text>
            ))}
          </View>
        )}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  monitoringCard: {
    borderRadius: 8,
    marginBottom: 10,
  },
  cameraPlaceholder: {
    height: 200,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  statusCard: {
    borderRadius: 8,
  },
  stableCard: {
    backgroundColor: '#E8F5E9',
  },
  dangerCard: {
    backgroundColor: '#FFEBEE',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  normalText: {
    fontSize: 16,
    color: '#4CAF50',
  },
  dangerList: {
    marginTop: 10,
  },
  dangerText: {
    fontSize: 16,
    color: '#f44336',
    marginBottom: 5,
  },
});

export default DangerDetection; 