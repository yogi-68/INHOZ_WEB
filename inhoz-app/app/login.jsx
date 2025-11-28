import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './utils/api';

const { width } = Dimensions.get('window');

const Login = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const roles = [
    {
      id: 'admin',
      title: 'Admin Portal',
      description: 'Manage hospital operations',
      icon: 'shield',
      gradient: ['#7c3aed', '#5b21b6'],
      testCreds: { email: 'admin@inhoz.com', password: 'admin123' }
    },
    {
      id: 'doctor',
      title: 'Doctor Portal',
      description: 'Patient care & monitoring',
      icon: 'user-md',
      gradient: ['#2563eb', '#1e40af'],
      testCreds: { email: 'doctor@inhoz.com', password: 'doctor123' }
    },
    {
      id: 'patient',
      title: 'Patient Portal',
      description: 'View your health records',
      icon: 'heartbeat',
      gradient: ['#14b8a6', '#0d9488'],
      testCreds: { email: 'patient@inhoz.com', password: 'patient123' }
    }
  ];

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.login(email, password);

      if (response.success) {
        const { user } = response.data;

        // Verify role matches
        if (user.role !== selectedRole) {
          Alert.alert('Error', `This account is not registered as ${selectedRole}`);
          setLoading(false);
          return;
        }

        // Store tokens
        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('refreshToken', refreshToken);
        await AsyncStorage.setItem('user', JSON.stringify(user));

        // Navigate to role dashboard
        router.replace(`/${selectedRole}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillTestCredentials = () => {
    const role = roles.find(r => r.id === selectedRole);
    if (role) {
      setEmail(role.testCreds.email);
      setPassword(role.testCreds.password);
    }
  };

  if (!selectedRole) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.selectorContainer}>
          <View style={styles.header}>
            <Icon name="hospital-o" size={60} color="#7c3aed" />
            <Text style={styles.title}>INHOZ</Text>
            <Text style={styles.subtitle}>Hospital Management System</Text>
          </View>

          <View style={styles.rolesContainer}>
            {roles.map(role => (
              <TouchableOpacity
                key={role.id}
                onPress={() => setSelectedRole(role.id)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={role.gradient}
                  style={styles.roleCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Icon name={role.icon} size={40} color="#fff" />
                  <Text style={styles.roleTitle}>{role.title}</Text>
                  <Text style={styles.roleDescription}>{role.description}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.versionText}>Version 1.0.0</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const currentRole = roles.find(r => r.id === selectedRole);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.loginContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setSelectedRole(null)}
        >
          <Icon name="arrow-left" size={20} color="#64748b" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <LinearGradient
          colors={currentRole.gradient}
          style={styles.loginHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Icon name={currentRole.icon} size={50} color="#fff" />
          <Text style={styles.loginTitle}>{currentRole.title}</Text>
          <Text style={styles.loginSubtitle}>{currentRole.description}</Text>
        </LinearGradient>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Icon name="envelope" size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Icon name="lock" size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Icon name={showPassword ? "eye" : "eye-slash"} size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.testCredsButton}
            onPress={fillTestCredentials}
          >
            <Icon name="flask" size={16} color="#7c3aed" />
            <Text style={styles.testCredsText}>Use Test Credentials</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <LinearGradient
              colors={currentRole.gradient}
              style={styles.loginButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Sign In</Text>
                  <Icon name="arrow-right" size={20} color="#fff" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.testInfoBox}>
            <Icon name="info-circle" size={16} color="#7c3aed" />
            <Text style={styles.testInfoText}>
              Test: {currentRole.testCreds.email}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  selectorContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  loginContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
  },
  rolesContainer: {
    gap: 20,
  },
  roleCard: {
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  roleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  roleDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    textAlign: 'center',
  },
  versionText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 8,
  },
  backText: {
    fontSize: 16,
    color: '#64748b',
  },
  loginHeader: {
    padding: 40,
    alignItems: 'center',
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  loginSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  eyeIcon: {
    padding: 8,
  },
  testCredsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginBottom: 20,
  },
  testCredsText: {
    fontSize: 14,
    color: '#7c3aed',
    fontWeight: '600',
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 12,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  testInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ede9fe',
    padding: 12,
    borderRadius: 8,
  },
  testInfoText: {
    fontSize: 12,
    color: '#5b21b6',
  },
});

export default Login;