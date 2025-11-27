import { Stack } from 'expo-router';
import { useEffect } from 'react';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: '#fff',
        },
        animation: 'slide_from_right',
      }}
    />
  );
} 