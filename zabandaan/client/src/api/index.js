import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Add auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('zabandaan_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('zabandaan_token');
      localStorage.removeItem('zabandaan_user');
    }
    return Promise.reject(error);
  }
);

export default api;
