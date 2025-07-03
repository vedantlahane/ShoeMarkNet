// src/utils/api.js
import axios from 'axios';

/**
 * Enhanced API Configuration with Premium Features
 * Follows Velox template's premium design philosophy
 */

// Enhanced Configuration Object
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000, // 15 seconds timeout
  retryAttempts: 3,
  retryDelay: 1000, // Base delay for exponential backoff
  enableLogging: process.env.NODE_ENV === 'development',
  enableAnalytics: true,
  
};

/**
 * Enhanced Logger with Premium Styling
 */
class APILogger {
  static log(level, message, data = null) {
    if (!API_CONFIG.enableLogging) return;
    
    const timestamp = new Date().toISOString();
    const styles = {
      info: 'color: #3b82f6; font-weight: bold;',
      success: 'color: #10b981; font-weight: bold;',
      warning: 'color: #f59e0b; font-weight: bold;',
      error: 'color: #ef4444; font-weight: bold;',
      request: 'color: #8b5cf6; font-weight: bold;',
      response: 'color: #06b6d4; font-weight: bold;'
    };

    console.group(`%c🌐 API ${level.toUpperCase()}`, styles[level] || styles.info);
    console.log(`%c⏰ ${timestamp}`, 'color: #6b7280; font-size: 12px;');
    console.log(`%c📝 ${message}`, 'color: #374151;');
    
    if (data) {
      console.log('%c📊 Data:', 'color: #6366f1; font-weight: bold;', data);
    }
    
    console.groupEnd();
  }

  static request(config) {
    this.log('request', `${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      params: config.params,
      data: config.data
    });
  }

  static response(response) {
    this.log('response', `${response.status} ${response.config.url}`, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    });
  }

  static error(error) {
    const errorData = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase()
    };
    
    this.log('error', `API Error: ${error.message}`, errorData);
  }
}

/**
 * Enhanced Token Management System
 */
class TokenManager {
  static getToken() {
    try {
      return localStorage.getItem('token');
    } catch (error) {
      APILogger.log('warning', 'Failed to get token from localStorage', error);
      return null;
    }
  }

  static getRefreshToken() {
    try {
      return localStorage.getItem('refreshToken');
    } catch (error) {
      APILogger.log('warning', 'Failed to get refresh token from localStorage', error);
      return null;
    }
  }

  static setTokens(token, refreshToken) {
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      APILogger.log('success', 'Tokens updated successfully');
    } catch (error) {
      APILogger.log('error', 'Failed to store tokens', error);
      throw new Error('Token storage failed');
    }
  }

  static clearTokens() {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      APILogger.log('info', 'Tokens cleared successfully');
    } catch (error) {
      APILogger.log('warning', 'Failed to clear tokens', error);
    }
  }

  static isTokenExpired(token) {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      APILogger.log('warning', 'Failed to parse token', error);
      return true;
    }
  }
}

/**
 * Enhanced Retry Mechanism with Exponential Backoff
 */
class RetryHandler {
  static async executeWithRetry(requestFn, attempts = API_CONFIG.retryAttempts) {
    for (let i = 0; i < attempts; i++) {
      try {
        return await requestFn();
      } catch (error) {
        const isLastAttempt = i === attempts - 1;
        const shouldRetry = this.shouldRetry(error);
        
        if (isLastAttempt || !shouldRetry) {
          throw error;
        }
        
        const delay = API_CONFIG.retryDelay * Math.pow(2, i); // Exponential backoff
        APILogger.log('warning', `Request failed, retrying in ${delay}ms (attempt ${i + 1}/${attempts})`);
        
        await this.delay(delay);
      }
    }
  }

  static shouldRetry(error) {
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    const status = error.response?.status;
    
    // Don't retry auth errors or client errors (except specific ones)
    if (status === 401 || status === 403) return false;
    if (status >= 400 && status < 500 && !retryableStatuses.includes(status)) return false;
    
    return true;
  }

  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Enhanced Request Queue Manager
 */
class RequestQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  add(request) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        request,
        resolve,
        reject
      });
    });
  }

  async process(token) {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    APILogger.log('info', `Processing ${this.queue.length} queued requests`);
    
    const requests = [...this.queue];
    this.queue = [];
    
    for (const { request, resolve, reject } of requests) {
      try {
        // Update request with new token
        request.headers.Authorization = `Bearer ${token}`;
        const response = await api(request);
        resolve(response);
      } catch (error) {
        reject(error);
      }
    }
    
    this.isProcessing = false;
  }

  rejectAll(error) {
    const requests = [...this.queue];
    this.queue = [];
    
    requests.forEach(({ reject }) => reject(error));
    APILogger.log('warning', `Rejected ${requests.length} queued requests`);
  }
}

/**
 * Enhanced API Instance with Premium Features
 */
const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
});

// Enhanced state management
let isRefreshing = false;
const requestQueue = new RequestQueue();

/**
 * Enhanced Request Interceptor
 */
api.interceptors.request.use(
  (config) => {
    // Add authentication token
    const token = TokenManager.getToken();
    if (token && !TokenManager.isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request ID for tracking
    config.metadata = {
      requestId: Math.random().toString(36).substr(2, 9),
      startTime: Date.now()
    };
    
    // Add request fingerprinting for security
    config.headers['X-Request-ID'] = config.metadata.requestId;
    config.headers['X-Timestamp'] = config.metadata.startTime;
    
    // Log request
    APILogger.request(config);
    
    return config;
  },
  (error) => {
    APILogger.error(error);
    return Promise.reject(error);
  }
);

/**
 * Enhanced Response Interceptor with Premium Error Handling
 */
api.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = Date.now() - response.config.metadata.startTime;
    response.metadata = {
      ...response.config.metadata,
      duration,
      cached: false
    };
    
    // Log successful response
    APILogger.response(response);
    
    // Performance monitoring
    if (API_CONFIG.enableAnalytics && duration > 3000) {
      APILogger.log('warning', `Slow request detected: ${duration}ms`, {
        url: response.config.url,
        method: response.config.method
      });
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log error
    APILogger.error(error);
    
    // Handle different error scenarios
    if (error.response?.status === 401 && !originalRequest._retry) {
      return handleTokenRefresh(error, originalRequest);
    }
    
    // Handle network errors with retry
    if (!error.response && API_CONFIG.retryAttempts > 0) {
      return handleNetworkError(error, originalRequest);
    }
    
    // Handle rate limiting
    if (error.response?.status === 429) {
      return handleRateLimit(error, originalRequest);
    }
    
    // Enhance error object
    const enhancedError = enhanceError(error);
    return Promise.reject(enhancedError);
  }
);

/**
 * Enhanced Token Refresh Handler
 */
async function handleTokenRefresh(error, originalRequest) {
  originalRequest._retry = true;
  
  if (!isRefreshing) {
    isRefreshing = true;
    
    try {
      const refreshToken = TokenManager.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      APILogger.log('info', 'Attempting token refresh...');
      
      // Create a new axios instance to avoid interceptors
      const refreshResponse = await axios.post(
        `${API_CONFIG.baseURL}/auth/refresh-token`,
        { refreshToken },
        { 
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      const { token, refreshToken: newRefreshToken } = refreshResponse.data;
      
      // Update tokens
      TokenManager.setTokens(token, newRefreshToken);
      
      // Update original request
      originalRequest.headers.Authorization = `Bearer ${token}`;
      
      // Process queued requests
      await requestQueue.process(token);
      
      APILogger.log('success', 'Token refresh successful');
      
      // Retry original request
      return api(originalRequest);
      
    } catch (refreshError) {
      APILogger.log('error', 'Token refresh failed', refreshError);
      
      // Reject all queued requests
      requestQueue.rejectAll(refreshError);
      
      // Clear tokens and redirect to login
      TokenManager.clearTokens();
      handleAuthenticationFailure();
      
      throw refreshError;
    } finally {
      isRefreshing = false;
    }
  } else {
    // Add to queue
    return requestQueue.add(originalRequest);
  }
}

/**
 * Enhanced Network Error Handler
 */
async function handleNetworkError(error, originalRequest) {
  if (originalRequest._retryCount >= API_CONFIG.retryAttempts) {
    throw error;
  }
  
  originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
  
  APILogger.log('warning', `Network error, retry attempt ${originalRequest._retryCount}/${API_CONFIG.retryAttempts}`);
  
  return RetryHandler.executeWithRetry(() => api(originalRequest), 1);
}

/**
 * Enhanced Rate Limit Handler
 */
async function handleRateLimit(error, originalRequest) {
  const retryAfter = error.response.headers['retry-after'];
  const delay = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
  
  APILogger.log('warning', `Rate limited, retrying after ${delay}ms`);
  
  await RetryHandler.delay(delay);
  return api(originalRequest);
}

/**
 * Enhanced Error Object
 */
function enhanceError(error) {
  const enhancedError = {
    ...error,
    timestamp: new Date().toISOString(),
    requestId: error.config?.metadata?.requestId,
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  // Add user-friendly messages
  if (error.response) {
    enhancedError.userMessage = getUserFriendlyMessage(error.response.status);
  } else if (error.request) {
    enhancedError.userMessage = 'Network connection failed. Please check your internet connection.';
  } else {
    enhancedError.userMessage = 'An unexpected error occurred. Please try again.';
  }
  
  return enhancedError;
}

/**
 * User-Friendly Error Messages
 */
function getUserFriendlyMessage(status) {
  const messages = {
    400: 'Invalid request. Please check your input and try again.',
    401: 'Authentication required. Please log in again.',
    403: 'Access denied. You don\'t have permission to perform this action.',
    404: 'The requested resource was not found.',
    408: 'Request timeout. Please try again.',
    429: 'Too many requests. Please wait a moment and try again.',
    500: 'Server error. Our team has been notified.',
    502: 'Service temporarily unavailable. Please try again later.',
    503: 'Service maintenance in progress. Please try again later.',
    504: 'Gateway timeout. Please try again later.'
  };
  
  return messages[status] || 'An unexpected error occurred. Please try again.';
}

/**
 * Enhanced Authentication Failure Handler
 */
function handleAuthenticationFailure() {
  // Dispatch logout action if using Redux
  if (window.store && window.store.dispatch) {
    window.store.dispatch({ type: 'auth/logout' });
  }
  
  // Show notification
  if (window.showToast) {
    window.showToast('Session expired', 'Please log in again', 'warning');
  }
  
  // Redirect to login with return URL
  const currentPath = window.location.pathname + window.location.search;
  const loginUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
  
  // Use React Router if available, otherwise use window.location
  if (window.navigate) {
    window.navigate(loginUrl);
  } else {
    window.location.href = loginUrl;
  }
}

/**
 * Enhanced API Methods with Premium Features
 */
export const apiMethods = {
  // Standard CRUD operations with enhanced error handling
  async get(url, config = {}) {
    try {
      const response = await api.get(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async post(url, data, config = {}) {
    try {
      const response = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async put(url, data, config = {}) {
    try {
      const response = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async patch(url, data, config = {}) {
    try {
      const response = await api.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async delete(url, config = {}) {
    try {
      const response = await api.delete(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Enhanced upload method with progress tracking
  async upload(url, formData, onProgress = null) {
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds for uploads
      };

      if (onProgress) {
        config.onUploadProgress = (progressEvent) => {
          const percentage = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentage);
        };
      }

      const response = await api.post(url, formData, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Enhanced batch request method
  async batch(requests) {
    try {
      const promises = requests.map(request => {
        const { method, url, data, config } = request;
        return api[method](url, data, config);
      });

      const responses = await Promise.allSettled(promises);
      return responses.map((result, index) => ({
        ...requests[index],
        success: result.status === 'fulfilled',
        data: result.status === 'fulfilled' ? result.value.data : null,
        error: result.status === 'rejected' ? result.reason : null
      }));
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Enhanced error handling
  handleError(error) {
    const enhancedError = enhanceError(error);
    
    // Report critical errors to monitoring service
    if (error.response?.status >= 500) {
      this.reportError(enhancedError);
    }
    
    return enhancedError;
  },

  // Error reporting
  reportError(error) {
    if (API_CONFIG.enableAnalytics) {
      // Send to error tracking service (Sentry, LogRocket, etc.)
      console.error('Critical API Error:', error);
    }
  }
};

/**
 * Enhanced Utility Functions
 */
export const apiUtils = {
  // Check API health
  async healthCheck() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  },

  // Get API version
  async getVersion() {
    try {
      const response = await api.get('/version');
      return response.data;
    } catch (error) {
      return { version: 'unknown' };
    }
  },

  // Clear all caches
  clearCache() {
    TokenManager.clearTokens();
    if (window.caches) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
  },

  // Get current configuration
  getConfig() {
    return { ...API_CONFIG };
  },

  // Update configuration
  updateConfig(newConfig) {
    Object.assign(API_CONFIG, newConfig);
    APILogger.log('info', 'API configuration updated', newConfig);
  }
};

// Export the enhanced API instance
export default api;

// Export enhanced classes for external use
export { TokenManager, APILogger, RetryHandler };

// Global error handler setup
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.isAxiosError) {
    APILogger.log('error', 'Unhandled API rejection', event.reason);
  }
});
