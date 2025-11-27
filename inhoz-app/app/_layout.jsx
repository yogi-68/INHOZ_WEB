import React, { useEffect } from 'react'
import { Stack } from 'expo-router'
import { LogBox } from 'react-native'

const _layout = () => {
  useEffect(() => {
    LogBox.ignoreLogs(['Warning: ...']) // Ignore specific warnings if needed
  }, [])

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name='index' 
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen 
        name='login' 
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen 
        name='dashboard' 
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen 
        name='profile' 
        options={{
          headerTitle: 'Patient Profile',
          headerStyle: {
            backgroundColor: '#4a90e2'
          },
          headerTintColor: '#fff'
        }}
      />
      <Stack.Screen 
        name='history' 
        options={{
          headerTitle: 'Patient History',
          headerStyle: {
            backgroundColor: '#4a90e2'
          },
          headerTintColor: '#fff'
        }}
      />
      <Stack.Screen 
        name='settings' 
        options={{
          headerTitle: 'Settings',
          headerStyle: {
            backgroundColor: '#4a90e2'
          },
          headerTintColor: '#fff'
        }}
      />
      <Stack.Screen 
        name='vitals' 
        options={{
          headerTitle: 'Vitals Dashboard',
          headerStyle: {
            backgroundColor: '#4a90e2'
          },
          headerTintColor: '#fff'
        }}
      />
      <Stack.Screen 
        name='report' 
        options={{
          headerTitle: 'Vitals Report',
          headerStyle: {
            backgroundColor: '#4a90e2'
          },
          headerTintColor: '#fff'
        }}
      />
      <Stack.Screen 
        name='admin' 
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen 
        name='doctor' 
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen 
        name='patient' 
        options={{
          headerShown: false
        }}
      />
    </Stack>
  )
}

export default _layout