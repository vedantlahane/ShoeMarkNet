// src/services/categoryService.js
import api from '../utils/api';

/**
 * Get all product categories
 * @returns {Promise} - Promise resolving to an array of categories
 */
const getAllCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

/**
 * Get a specific category by ID
 * @param {string} categoryId - The ID of the category to fetch
 * @returns {Promise} - Promise resolving to the category details
 */
const getCategoryById = async (categoryId) => {
  const response = await api.get(`/categories/${categoryId}`);
  return response.data;
};

/**
 * Get products by category
 * @param {string} categoryId - The ID of the category
 * @param {Object} filters - Optional filters for products
 * @returns {Promise} - Promise resolving to an array of products in the category
 */
const getProductsByCategory = async (categoryId, filters = {}) => {
  const queryParams = new URLSearchParams();
  
  // Add filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });
  
  const response = await api.get(`/categories/${categoryId}/products?${queryParams.toString()}`);
  return response.data;
};

/**
 * Admin function to create a new category
 * @param {Object} categoryData - Category information
 * @returns {Promise} - Promise resolving to the created category
 */
const createCategory = async (categoryData) => {
  const response = await api.post('/categories', categoryData);
  return response.data;
};

/**
 * Admin function to update a category
 * @param {string} categoryId - The ID of the category to update
 * @param {Object} categoryData - Updated category information
 * @returns {Promise} - Promise resolving to the updated category
 */
const updateCategory = async (categoryId, categoryData) => {
  const response = await api.put(`/categories/${categoryId}`, categoryData);
  return response.data;
};

/**
 * Admin function to delete a category
 * @param {string} categoryId - The ID of the category to delete
 * @returns {Promise} - Promise resolving to success message
 */
const deleteCategory = async (categoryId) => {
  const response = await api.delete(`/categories/${categoryId}`);
  return response.data;
};

const categoryService = {
  getAllCategories,
  getCategoryById,
  getProductsByCategory,
  createCategory,
  updateCategory,
  deleteCategory
};

export default categoryService;
