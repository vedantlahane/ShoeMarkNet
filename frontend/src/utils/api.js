import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export const getApiBaseUrl = () => import.meta.env.VITE_API_URL;

export const fetchData = async () => {
  try {
    const response = await api.get('/api/data');
    if (!response.data) {
      throw new Error('No data received from the server');
    }
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};