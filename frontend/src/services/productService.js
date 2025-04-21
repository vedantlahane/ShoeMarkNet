// src/services/productService.js
import api from '../utils/api';

const getFeaturedProducts = async () => {
  const response = await api.get('/products/featured');
  return response.data;
};

const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

const getProducts = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  // Add filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });
  
  const response = await api.get(`/products?${queryParams.toString()}`);
  return response.data;
};

const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

const productService = {
  getFeaturedProducts,
  getCategories,
  getProducts,
  getProductById,
};

export default productService;
