import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getApiBaseUrl = () => API_BASE_URL;

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  // If the image path is already a full URL, return it as is
  if (imagePath.startsWith('http')) return imagePath;
  // Otherwise, combine it with the API base URL
  return `${API_BASE_URL}${imagePath}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
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

export const fetchData = async () => {
  try {
    const response = await api.get('/api/data');
    
    if (!response.data) {
      throw new Error('No data received from server');
    }
    
    // Transform image URLs in the response data
    const transformedData = transformImageUrls(response.data);
    return transformedData;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Helper function to transform image URLs in the data
const transformImageUrls = (data) => {
  if (!data) return data;

  const transform = (item) => {
    if (typeof item !== 'object' || !item) return item;

    const transformed = Array.isArray(item) ? [...item] : { ...item };

    Object.keys(transformed).forEach(key => {
      if (typeof transformed[key] === 'string' && 
          (key.includes('img') || key.includes('image'))) {
        transformed[key] = getImageUrl(transformed[key]);
      } else if (typeof transformed[key] === 'object') {
        transformed[key] = transformImageUrls(transformed[key]);
      }
    });

    return transformed;
  };

  return transform(data);
};