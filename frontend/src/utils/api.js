import axios from "axios";

// Create an Axios instance with default settings
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api", // Use Vite env variables
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Add Auth Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Get token from local storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Errors
api.interceptors.response.use(
  (response) => response, // Pass successful responses
  (error) => {
    if (error.response) {
      console.error("API Error:", error.response.data.message || error.message);
    } else {
      console.error("Network Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
