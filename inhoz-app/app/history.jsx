import React from 'react';
import { StyleSheet, View, Text, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { Card } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import { router } from 'expo-router';
import BottomNav from './Components/BottomNav';
import DrawerNav from './Components/DrawerNav';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const History = () => {
  // Mock data for the past 28 days
  const generateMockData = (min, max, count = 14) => { // Reduced to 14 days for better visibility
    return Array.from({ length: count }, () => 
      Number((Math.random() * (max - min) + min).toFixed(1))
    );
  };

  const data = {
    temperature: generateMockData(36.0, 37.5),
    heartRate: generateMockData(60, 100),
    bloodPressure: generateMockData(90, 140),
    oxygenSaturation: generateMockData(95, 100)
  };

  const labels = Array.from({ length: 14 }, (_, i) => `${14 - i}`); // Show just the day number

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '3', // Smaller dots
      strokeWidth: '1',
    },
    propsForLabels: {
      fontSize: Math.min(windowWidth * 0.025, 10), // Responsive font size for labels
    },
  };

  const renderChart = (title, data, color, unit) => (
    <Card containerStyle={styles.card}>
      <Card.Title style={styles.cardTitle}>{title}</Card.Title>
      <LineChart
        data={{
          labels: labels.filter((_, i) => i % 2 === 0), // Show every other label to prevent crowding
          datasets: [{
            data: data,
            color: (opacity = 1) => color,
            strokeWidth: 1.5 // Thinner lines
          }]
        }}
        width={windowWidth * 0.9} // 90% of screen width
        height={windowHeight * 0.2} // 20% of screen height
        chartConfig={{
          ...chartConfig,
          color: (opacity = 1) => color,
        }}
        bezier
        style={styles.chart}
        withDots={true}
        withInnerLines={false} // Removed inner grid lines
        withOuterLines={true}
        withVerticalLines={false}
        withHorizontalLines={true}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        fromZero={false}
        yAxisInterval={4} // Show fewer horizontal lines
        onDataPointClick={({ value }) => {
          alert(`Value: ${value}${unit}`);
        }}
      />
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <DrawerNav />
      <View style={styles.header}>
        <Text style={styles.title}>Patient History</Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.push('/detailedHistory')}
        >
          <Icon name="history" size={16} color="#fff" />
          <Text style={styles.headerButtonText}>View History</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.chartsContainer}>
          {renderChart('Temperature (°C)', data.temperature, '#4a90e2', '°C')}
          {renderChart('Heart Rate (BPM)', data.heartRate, '#2ecc71', 'bpm')}
          {renderChart('Blood Pressure (mmHg)', data.bloodPressure, '#e74c3c', 'mmHg')}
          {renderChart('Oxygen Saturation (%)', data.oxygenSaturation, '#f39c12', '%')}
        </View>
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
    justifyContent: 'space-between',
  },
  title: {
    fontSize: Math.min(windowWidth * 0.06, 24),
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 50,
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
  },
  chartsContainer: {
    paddingVertical: windowWidth * 0.02,
  },
  card: {
    borderRadius: 10,
    marginHorizontal: windowWidth * 0.02,
    marginBottom: windowWidth * 0.03,
    elevation: 3,
    padding: windowWidth * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: Math.min(windowWidth * 0.04, 16),
    color: '#333',
    marginBottom: windowWidth * 0.02,
    textAlign: 'left',
  },
  chart: {
    marginVertical: windowWidth * 0.01,
    borderRadius: 16,
  }
});

export default History; 