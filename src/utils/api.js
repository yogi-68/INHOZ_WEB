// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// API Client
class APIClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('accessToken');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  getToken() {
    return this.token || localStorage.getItem('accessToken');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.getToken() && !options.skipAuth) {
      headers.Authorization = `Bearer ${this.getToken()}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle 401 Unauthorized - token expired or invalid
        // But only if we're actually authenticated (don't clear on login failures)
        if (response.status === 401 && !options.skipAuth) {
          const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
          if (isAuthenticated) {
            console.warn('Token expired or invalid. Clearing auth and redirecting to login...');
            this.logout();
            window.location.href = '/login';
          }
          throw new Error(data.error || data.message || 'Authentication failed');
        }
        throw new Error(data.error || data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });

    if (response.success && response.data) {
      this.setToken(response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('isAuthenticated', 'true');
    }

    return response;
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
      skipAuth: true,
    });

    if (response.success && response.data) {
      this.setToken(response.data.accessToken);
    }

    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.setToken(null);
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
    }
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // ====================
  // DOCTOR ENDPOINTS
  // ====================
  async getDoctorPatients() {
    return this.request('/doctor/patients');
  }

  async getPatientDetails(patientId) {
    return this.request(`/doctor/patients/${patientId}`);
  }

  async getPatientVitals(patientId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/doctor/patients/${patientId}/vitals${queryString ? '?' + queryString : ''}`);
  }

  async getDoctorAlerts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/doctor/alerts${queryString ? '?' + queryString : ''}`);
  }

  async acknowledgeAlert(alertId) {
    return this.request(`/doctor/alerts/${alertId}/acknowledge`, {
      method: 'PUT',
    });
  }

  async getPatientPrescriptions(patientId) {
    return this.request(`/doctor/patients/${patientId}/prescriptions`);
  }

  async createPrescription(patientId, prescriptionData) {
    return this.request(`/doctor/patients/${patientId}/prescriptions`, {
      method: 'POST',
      body: JSON.stringify(prescriptionData),
    });
  }

  // ====================
  // ADMIN ENDPOINTS
  // ====================
  async getAdminDashboard() {
    return this.request('/admin/dashboard');
  }

  async getDoctors(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/doctors${queryString ? '?' + queryString : ''}`);
  }

  async createDoctor(doctorData) {
    return this.request('/admin/doctors', {
      method: 'POST',
      body: JSON.stringify(doctorData),
    });
  }

  async updateDoctor(doctorId, doctorData) {
    return this.request(`/admin/doctors/${doctorId}`, {
      method: 'PUT',
      body: JSON.stringify(doctorData),
    });
  }

  async deleteDoctor(doctorId) {
    return this.request(`/admin/doctors/${doctorId}`, {
      method: 'DELETE',
    });
  }

  async getAdminPatients(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/patients${queryString ? '?' + queryString : ''}`);
  }

  async createPatient(patientData) {
    return this.request('/admin/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
  }

  async assignDoctor(assignmentData) {
    return this.request('/admin/assignments', {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  }

  async getInvoices(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/invoices${queryString ? '?' + queryString : ''}`);
  }

  async createInvoice(invoiceData) {
    return this.request('/admin/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
  }

  async getAuditLogs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/audit-logs${queryString ? '?' + queryString : ''}`);
  }

  // ====================
  // PATIENT ENDPOINTS
  // ====================
  async getPatientProfile() {
    return this.request('/patient/profile');
  }

  async getPatientOwnVitals(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/patient/vitals${queryString ? '?' + queryString : ''}`);
  }

  async getPatientAlerts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/patient/alerts${queryString ? '?' + queryString : ''}`);
  }

  async getPatientPrescriptionsOwn() {
    return this.request('/patient/prescriptions');
  }

  async getPatientInvoices(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/patient/invoices${queryString ? '?' + queryString : ''}`);
  }

  async getAssignedDoctor() {
    return this.request('/patient/assigned-doctor');
  }
}

// Export singleton instance
const apiClient = new APIClient();
export default apiClient;

// Export API base URL for WebSocket connection
export { API_BASE_URL };
