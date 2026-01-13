import axios from 'axios';

// We add /api here so all calls automatically use the correct prefix
const API = axios.create({ 
  baseURL: 'https://salahtracker-backend.onrender.com/api' 
});

// Auth Routes
export const signUp = (userData) => API.post('/auth/signup', userData);
export const login = (userData) => API.post('/auth/login', userData);

// Log Routes
// Note: Adjusted '/logs/save' to '/logs' to match standard REST patterns 
// unless your backend specifically has a router.post('/save')
export const saveLog = (logData) => API.post('/logs', logData); 
export const getLogs = (userId) => API.get(`/logs/${userId}`);

export default API;