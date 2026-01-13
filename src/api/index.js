import axios from 'axios';

// This is the address of your Backend server we built earlier
const API = axios.create({ baseURL: 'http://localhost:5000/api' });

export const signUp = (userData) => API.post('/auth/signup', userData);
export const login = (userData) => API.post('/auth/login', userData);
export const saveLog = (logData) => API.post('/logs/save', logData);
export const getLogs = (userId) => API.get(`/logs/${userId}`);