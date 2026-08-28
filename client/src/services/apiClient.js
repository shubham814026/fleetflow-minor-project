import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for attaching auth and secondary auth tokens
apiClient.interceptors.request.use(
  (config) => {
    const rawAuth = localStorage.getItem('fleetflow_auth');
    if (rawAuth) {
      try {
        const { token } = JSON.parse(rawAuth);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error('Error parsing token from storage', e);
      }
    }

    // Attach secondary authentication verification token if present
    const secondaryToken = sessionStorage.getItem('fleetflow_secondary_token');
    if (secondaryToken) {
      config.headers['X-Secondary-Auth'] = secondaryToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error formatting and token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      // Clear token and signal auth failure if not on login page
      if (!window.location.pathname.includes('/login')) {
        console.warn('Session expired or unauthorized. Redirecting to login...');
      }
    } else if (status === 403) {
      console.warn('Forbidden access attempt.');
    } else if (status === 429) {
      console.warn('Rate limit exceeded. Please wait a moment.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
