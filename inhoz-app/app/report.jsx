import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import VitalsReport from './Components/VitalsReport';

const Report = () => {
  const { patientId, vitalsData } = useLocalSearchParams();
  const parsedVitalsData = JSON.parse(vitalsData);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <VitalsReport 
        vitalsData={parsedVitalsData}
        patientName={`Patient ${patientId}`}
      />
    </SafeAreaView>
  );
};

export default Report; 