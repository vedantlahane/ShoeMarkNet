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

// Add the missing createReview function
const createReview = async (productId, reviewData) => {
  const response = await api.post(`/products/${productId}/reviews`, reviewData);
  return response.data;
};

// Add functions for admin product management
const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

const productService = {
  getFeaturedProducts,
  getCategories,
  getProducts,
  getProductById,
  createReview,
  createProduct,
  updateProduct,
  deleteProduct
};

export default productService;
