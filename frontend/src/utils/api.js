// src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple refresh requests
let isRefreshing = false;
// Queue of failed requests to retry after token refresh
let failedRequestsQueue = [];

// Add request interceptor to attach token to requests
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

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Mark this request as retried to prevent infinite loops
      originalRequest._retry = true;
      
      // If we're not already refreshing the token
      if (!isRefreshing) {
        isRefreshing = true;
        
        try {
          // Get refresh token from storage
          const refreshToken = localStorage.getItem('refreshToken');
          
          if (!refreshToken) {
            // No refresh token available, redirect to login
            window.location.href = '/login';
            return Promise.reject(error);
          }
          
          // Request a new token
          const response = await axios.post('http://localhost:5000/api/auth/refresh-token', {
            refreshToken
          });
          
          // Store the new tokens
          const { token, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          // Update the failed request with the new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          
          // Process the queue of failed requests
          failedRequestsQueue.forEach(request => request.resolve(token));
          failedRequestsQueue = [];
          
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh token is invalid or expired, redirect to login
          failedRequestsQueue.forEach(request => request.reject(refreshError));
          failedRequestsQueue = [];
          
          // Clear tokens and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // If we're already refreshing, add this request to the queue
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject: (err) => {
              reject(err);
            }
          });
        });
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
