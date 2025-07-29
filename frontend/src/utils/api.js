// src/utils/api.js
import axios from 'axios';


// Enhanced Configuration Object
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000, // 15 seconds timeout
  retryAttempts: 3,
  retryDelay: 1000, // Base delay for exponential backoff

  
};


const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
})


// Export the enhanced API instance
export default api;
