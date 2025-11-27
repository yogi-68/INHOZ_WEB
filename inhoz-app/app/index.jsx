import React, { useEffect } from 'react'
import { StyleSheet, Text, View, Image, Dimensions } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'

const { width, height } = Dimensions.get('window');

const Index = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        router.replace('/login')
      } catch (error) {
        console.error('Navigation error:', error)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Image 
          source={require('../assets/logo1.png')}
          style={[
            styles.logo,
            {
              width: width * 0.35, // 35% of screen width
              height: width * 0.35, // Keep aspect ratio square
            }
          ]}
          resizeMode="contain"
        />
        <Text style={[
          styles.title,
          {
            fontSize: Math.min(width * 0.08, 40) // 8% of screen width, max 40
          }
        ]}>INHOZ</Text>
        <Text style={[
          styles.subtitle,
          {
            fontSize: Math.min(width * 0.045, 24) // 4.5% of screen width, max 24
          }
        ]}>Intelligent Hospitalization</Text>
      </View>
    </SafeAreaView>
  )
}

export default Index

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: width * 0.05, // 5% padding on sides
    },
    logo: {
        marginBottom: height * 0.03, // 3% of screen height
    },
    title: {
        fontWeight: 'bold',
        color: '#4a90e2',
        marginBottom: height * 0.015, // 1.5% of screen height
        textAlign: 'center',
    },
    subtitle: {
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: width * 0.1, // 10% padding on sides
        lineHeight: Math.min(width * 0.06, 32) // Improved line height for readability, max 32
    }
})