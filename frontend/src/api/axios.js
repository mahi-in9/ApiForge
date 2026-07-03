import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URI,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle expired/invalid tokens globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is expired or invalid — clear auth state and redirect
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
