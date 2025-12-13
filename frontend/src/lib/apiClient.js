import axios from 'axios';

const DEFAULT_TIMEOUT = 15000;

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT || DEFAULT_TIMEOUT),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

const getToken = () => {
  try {
    return window.localStorage.getItem('token');
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Unable to access localStorage token', error);
    }
    return null;
  }
};

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  if (import.meta.env.DEV) {
    console.info('[API] →', config.method?.toUpperCase(), config.baseURL ? `${config.baseURL}${config.url}` : config.url);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.info('[API] ←', response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error('[API] ✖', error?.response?.status ?? 'NETWORK', error?.message);
    }

    if (error?.response?.status === 401) {
      try {
        window.localStorage.removeItem('token');
      } catch (storageError) {
        if (import.meta.env.DEV) {
          console.warn('Unable to clear token after 401', storageError);
        }
      }

      // Avoid redirect loops during tests
      if (typeof window !== 'undefined' && window.location?.pathname !== '/login') {
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  }
);

export const extractData = (response) => response?.data;
export default apiClient;
