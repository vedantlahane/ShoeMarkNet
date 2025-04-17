import axios from "axios";

// Create an Axios instance with default settings
const api = axios.create({
  // Set the base URL for all API requests.
  // Uses Vite environment variable if available, otherwise defaults to localhost.
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json", // All requests send/expect JSON
  },
});

// Request Interceptor: Runs before every API request
api.interceptors.request.use(
  (config) => {
    // Retrieve the authentication token from localStorage (if present)
    const token = localStorage.getItem("token");
    // If a token exists, attach it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Always return the config (with or without token)
    return config;
  },
  (error) => Promise.reject(error) // Forward any request errors
);

// Response Interceptor: Runs after every API response
api.interceptors.response.use(
  (response) => response, // Pass successful responses through unchanged
  (error) => {
    // If the server responded with an error
    if (error.response) {
      // Log the error message from the API response (if available), otherwise log the generic error message
      console.error("API Error:", error.response.data.message || error.message);
    } else {
      // If no response was received (e.g., network error)
      console.error("Network Error:", error.message);
    }
    // Forward the error so it can be handled elsewhere (e.g., in your services or UI)
    return Promise.reject(error);
  }
);

export default api; // Export the configured Axios instance for use throughout the app
