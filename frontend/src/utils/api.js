import axios from 'axios';

// Enhanced Configuration Object
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000, // 15 seconds timeout
  retryAttempts: 3,
  retryDelay: 1000, // Base delay for exponential backoff
};

// Create axios instance
const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request retry utility with exponential backoff
const retryRequest = async (config, attempt = 1) => {
  try {
    return await api(config);
  } catch (error) {
    if (attempt < API_CONFIG.retryAttempts && shouldRetry(error)) {
      const delay = API_CONFIG.retryDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryRequest(config, attempt + 1);
    }
    throw error;
  }
};

// Determine if request should be retried
const shouldRetry = (error) => {
  if (!error.response) return true; // Network error
  const status = error.response.status;
  return status >= 500 || status === 408 || status === 429; // Server errors, timeout, or rate limit
};

// Request interceptor to add auth token and logging
api.interceptors.request.use(
  (config) => {
    // Add auth token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };

    // Log requests in development
    if (import.meta.env.MODE === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  (error) => {
    if (import.meta.env.MODE === 'development') {
      console.error('❌ Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and logging
api.interceptors.response.use(
  (response) => {
    // Log response time in development
    if (import.meta.env.MODE === 'development' && response.config.metadata) {
      const duration = new Date() - response.config.metadata.startTime;
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log errors in development
    if (import.meta.env.MODE === 'development') {
      console.error('❌ API Error:', {
        method: originalRequest?.method?.toUpperCase(),
        url: originalRequest?.url,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }

    // Handle 401 Unauthorized - Token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_CONFIG.baseURL}/auth/refresh-token`, {
            refreshToken
          });

          const { token, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('token', token);
          
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          
          // Dispatch logout action if store is available
          if (window.__REDUX_STORE__) {
            window.__REDUX_STORE__.dispatch({ type: 'auth/logout' });
          }
          
          // Only redirect if not already on login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, clear storage and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    // Enhanced error handling with user-friendly messages
    const enhancedError = {
      ...error,
      userMessage: getUserFriendlyErrorMessage(error),
    };

    return Promise.reject(enhancedError);
  }
);

// Generate user-friendly error messages
const getUserFriendlyErrorMessage = (error) => {
  if (!error.response) {
    return 'Network error. Please check your internet connection and try again.';
  }

  const status = error.response.status;
  const serverMessage = error.response.data?.message;

  switch (status) {
    case 400:
      return serverMessage || 'Invalid request. Please check your input and try again.';
    case 401:
      return 'Authentication failed. Please log in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return serverMessage || 'A conflict occurred. The resource may already exist.';
    case 422:
      return serverMessage || 'Invalid data provided. Please check your input.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
      return 'Service temporarily unavailable. Please try again later.';
    case 503:
      return 'Service maintenance in progress. Please try again later.';
    default:
      return serverMessage || 'An unexpected error occurred. Please try again.';
  }
};

// Utility functions for common API patterns
export const apiUtils = {
  // Create query string from object
  createQueryString: (params) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });
    return queryParams.toString();
  },

  // Handle file uploads
  uploadFile: async (url, file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },

  // Cancel token for request cancellation
  createCancelToken: () => axios.CancelToken.source(),

  // Check if error is a cancel error
  isCancel: (error) => axios.isCancel(error),
};

// Export the enhanced API instance
export default api;
