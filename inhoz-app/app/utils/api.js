import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend API URL - Using Render production backend
const API_URL = 'https://inhoz-backend.onrender.com/api/v1';

// For local development, use:
// const API_URL = 'http://localhost:3001/api/v1';

// For Android emulator with local backend:
// const API_URL = 'http://10.0.2.2:3001/api/v1';

// For physical device with local backend:
// const API_URL = 'http://192.168.1.7:3001/api/v1';

class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            const response = await axios.post(`${API_URL}/auth/refresh`, {
              refreshToken,
            });

            const { accessToken } = response.data.data;
            await AsyncStorage.setItem('accessToken', accessToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            await this.logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth APIs
  async login(email, password) {
    const response = await this.client.post('/auth/login', { email, password });
    const { accessToken, refreshToken, user } = response.data.data;
    
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  }

  async register(userData) {
    const response = await this.client.post('/auth/register', userData);
    return response.data;
  }

  async logout() {
    try {
      await this.client.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
    }
  }

  async getProfile() {
    const response = await this.client.get('/auth/profile');
    return response.data;
  }

  // Admin APIs
  async getAdminDashboard() {
    const response = await this.client.get('/admin/dashboard');
    return response.data;
  }

  async getDoctors() {
    const response = await this.client.get('/admin/doctors');
    return response.data;
  }

  async createDoctor(doctorData) {
    const response = await this.client.post('/admin/doctors', doctorData);
    return response.data;
  }

  async updateDoctor(doctorId, doctorData) {
    const response = await this.client.put(`/admin/doctors/${doctorId}`, doctorData);
    return response.data;
  }

  async deleteDoctor(doctorId) {
    const response = await this.client.delete(`/admin/doctors/${doctorId}`);
    return response.data;
  }

  async getAdminPatients() {
    const response = await this.client.get('/admin/patients');
    return response.data;
  }

  async createPatient(patientData) {
    const response = await this.client.post('/admin/patients', patientData);
    return response.data;
  }

  async assignDoctor(assignmentData) {
    const response = await this.client.post('/admin/assignments', assignmentData);
    return response.data;
  }

  async getInvoices() {
    const response = await this.client.get('/admin/invoices');
    return response.data;
  }

  async getAuditLogs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await this.client.get(`/admin/audit-logs${queryString ? '?' + queryString : ''}`);
    return response.data;
  }

  // Doctor APIs
  async getDoctorPatients() {
    const response = await this.client.get('/doctor/patients');
    return response.data;
  }

  async getPatientVitalsHistory(patientId) {
    const response = await this.client.get(`/doctor/patients/${patientId}/vitals`);
    return response.data;
  }

  async getPatientVitals(patientId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await this.client.get(`/doctor/patients/${patientId}/vitals${queryString ? '?' + queryString : ''}`);
    return response.data;
  }

  async createPrescription(prescriptionData) {
    const { patientId, medications, notes } = prescriptionData;
    const response = await this.client.post(`/doctor/patients/${patientId}/prescriptions`, {
      medicines: medications.map(med => ({
        name: med.name,
        dose: med.dosage,
        frequency: med.frequency,
        durationDays: parseInt(med.duration.match(/\d+/)?.[0] || 30)
      })),
      notes,
      validFrom: new Date().toISOString()
    });
    return response.data;
  }

  async getAlerts() {
    const response = await this.client.get('/doctor/alerts');
    return response.data;
  }

  async acknowledgeAlert(alertId) {
    const response = await this.client.put(`/doctor/alerts/${alertId}/acknowledge`);
    return response.data;
  }

  // Patient APIs
  async getPatientOwnVitals() {
    const response = await this.client.get('/patient/vitals');
    return response.data;
  }

  async getPatientPrescriptionsOwn() {
    const response = await this.client.get('/patient/prescriptions');
    return response.data;
  }

  async getPatientInvoicesOwn() {
    const response = await this.client.get('/patient/invoices');
    return response.data;
  }

  async getPatientAlertsOwn() {
    const response = await this.client.get('/patient/alerts');
    return response.data;
  }

  // Matrix server live vitals
  async getLiveVitals() {
    try {
      const response = await fetch(MATRIX_API_URL);
      const data = await response.json();
      if (data.success && data.data && data.data.length > 0) {
        const latest = data.data[0];
        return {
          heartRate: latest.BPM || 0,
          oxygenLevel: latest.spO2 || 0,
          temperature: latest.temperature || 0,
          bloodPressure: latest.bloodPressure || '0/0',
          ecgValue: latest.ecgValue || 0,
          calories: latest.calories || 0,
          timestamp: latest.timestamp || new Date().toISOString()
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch live vitals:', error);
      return null;
    }
  }

  // Helper methods
  async getToken() {
    return await AsyncStorage.getItem('accessToken');
  }

  async getUser() {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  async getUserRole() {
    const user = await this.getUser();
    return user?.role || null;
  }
}

export default new ApiClient();
