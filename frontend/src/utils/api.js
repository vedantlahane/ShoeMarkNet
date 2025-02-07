import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Validate the data structure
const validateData = (data) => {
  const requiredFields = ['homeapi', 'popularsales', 'toprateslaes', 'footerAPI'];
  const missingFields = requiredFields.filter(field => !data[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
  
  return data;
};

export const getApiBaseUrl = () => import.meta.env.VITE_API_URL;

export const fetchData = async () => {
  try {
    const response = await api.get('/api/data');
    
    if (!response.data) {
      throw new Error('No data received from server');
    }
    
    return validateData(response.data);
  } catch (error) {
    if (error.response) {
      // Server responded with an error
      throw new Error(`Server error: ${error.response.status}`);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('No response from server');
    } else {
      // Something happened in setting up the request
      throw error;
    }
  }
};