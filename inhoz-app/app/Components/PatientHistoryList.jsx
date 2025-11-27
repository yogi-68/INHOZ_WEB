import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { Card } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import { router } from 'expo-router';

const windowWidth = Dimensions.get('window').width;

const PatientHistoryList = ({ patientId }) => {
  // Mock historical data - in a real app, this would come from an API/backend
  const historyData = [
    {
      id: '1',
      date: '2024-03-15',
      time: '09:30 AM',
      type: 'Vital Check',
      summary: 'All vitals normal',
      status: 'Normal'
    },
    {
      id: '2',
      date: '2024-03-14',
      time: '10:15 AM',
      type: 'Medication',
      summary: 'Administered antibiotics',
      status: 'Normal'
    },
    {
      id: '3',
      date: '2024-03-13',
      time: '08:45 AM',
      type: 'Vital Check',
      summary: 'Elevated heart rate',
      status: 'Warning'
    },
    {
      id: '4',
      date: '2024-03-12',
      time: '14:30 PM',
      type: 'Procedure',
      summary: 'IV line changed',
      status: 'Normal'
    },
    {
      id: '5',
      date: '2024-03-11',
      time: '11:00 AM',
      type: 'Vital Check',
      summary: 'Low blood pressure',
      status: 'Critical'
    },
  ];

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Normal':
        return { name: 'check-circle', color: '#4CAF50' };
      case 'Warning':
        return { name: 'exclamation-circle', color: '#FF9800' };
      case 'Critical':
        return { name: 'exclamation-triangle', color: '#F44336' };
      default:
        return { name: 'info-circle', color: '#2196F3' };
    }
  };

  const renderHistoryItem = ({ item }) => {
    const statusIcon = getStatusIcon(item.status);
    
    return (
      <TouchableOpacity
        onPress={() => router.push({
          pathname: '/detailedHistory',
          params: { historyId: item.id }
        })}
      >
        <Card containerStyle={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.dateTimeContainer}>
              <Text style={styles.date}>{item.date}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
            <View style={styles.statusContainer}>
              <Icon name={statusIcon.name} size={16} color={statusIcon.color} />
              <Text style={[styles.status, { color: statusIcon.color }]}>{item.status}</Text>
            </View>
          </View>
          
          <View style={styles.cardContent}>
            <Text style={styles.type}>{item.type}</Text>
            <Text style={styles.summary}>{item.summary}</Text>
          </View>
          
          <View style={styles.cardFooter}>
            <Text style={styles.viewDetails}>View Details</Text>
            <Icon name="chevron-right" size={12} color="#4a90e2" />
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Patient History</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="filter" size={16} color="#4a90e2" />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={historyData}
        renderItem={renderHistoryItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: windowWidth * 0.03,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: Math.min(windowWidth * 0.05, 20),
    fontWeight: 'bold',
    color: '#333',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterText: {
    fontSize: 14,
    color: '#4a90e2',
    marginLeft: 5,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateTimeContainer: {
    flexDirection: 'column',
  },
  date: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  time: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  status: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  cardContent: {
    marginBottom: 10,
  },
  type: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  summary: {
    fontSize: 14,
    color: '#666',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  viewDetails: {
    fontSize: 12,
    color: '#4a90e2',
    marginRight: 4,
  },
});

export default PatientHistoryList; 