import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getApiBaseUrl = () => API_BASE_URL;

// Validation function
const validateData = (data) => {
  const requiredFields = ['homeapi', 'popularsales', 'toprateslaes', 'footerAPI'];
  
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  return data;
};

// Updated getImageUrl function to handle URLs correctly
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';

  // If path is already a full URL, return it as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // Remove any existing "assets/" or leading slashes
  const cleanPath = imagePath
    .replace(/^http.*\/\/[^/]+\/?/i, '')     // Remove any domain prefix (e.g., http://localhost:5000)
    .replace(/^\/+/, '')                     // Remove leading slashes
    .replace(/^assets\//, '');               // Remove leading "assets/"

  // Combine with API base URL and "/assets/"
  return `/assets/${cleanPath}`;
};

// Updated axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false, // Prevent CORS preflight
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

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

export const fetchData = async () => {
  try {
    const response = await api.get('/api/data');
    
    if (!response.data) {
      throw new Error('No data received from server');
    }
    
    const validatedData = validateData(response.data);
    return transformImageUrls(validatedData);
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};