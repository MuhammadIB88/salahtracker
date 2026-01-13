import axios from 'axios';

// 1. Create the instance with the base URL
const API = axios.create({ 
  baseURL: 'https://salahtracker-backend.onrender.com/api' 
});

// 2. Add an interceptor to automatically add the token to every request
API.interceptors.request.use((config) => {
  // Get the token from localStorage (saved during login)
  const token = localStorage.getItem('token'); 
  
  if (token) {
    // Add the "Bearer" token to the Authorization header
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// --- AUTH ROUTES ---
export const signUp = (userData) => API.post('/auth/signup', userData);
export const login = (userData) => API.post('/auth/login', userData);

// --- LOG ROUTES ---
// Fixed: Added '/save' to match your backend route in logs.js
export const saveLog = (logData) => API.post('/logs/save', logData);
export const getLogs = (userId) => API.get(`/logs/${userId}`);

export default API;