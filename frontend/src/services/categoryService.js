// src/services/categoryService.js
import api from '../utils/api';

/**
 * Get all product categories
 * @returns {Promise} - Promise resolving to an array of categories
 */
const getAllCategories = async () => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch categories');
  }
};

/**
 * Get category tree structure for navigation
 * @param {Object} options - Options for tree generation
 * @returns {Promise} - Promise resolving to category tree structure
 */
const getCategoryTree = async (options = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add options to query params
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value);
    });
    
    const url = queryParams.toString() ? `/categories/tree?${queryParams.toString()}` : '/categories/tree';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching category tree:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch category tree');
  }
};

/**
 * Get a specific category by ID
 * @param {string} categoryId - The ID of the category to fetch
 * @returns {Promise} - Promise resolving to the category details
 */
const getCategoryById = async (categoryId) => {
  try {
    const response = await api.get(`/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching category:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch category');
  }
};

/**
 * Get breadcrumb path for a category
 * @param {string} categoryId - The ID of the category
 * @returns {Promise} - Promise resolving to breadcrumb array
 */
const getCategoryBreadcrumb = async (categoryId) => {
  try {
    const response = await api.get(`/categories/${categoryId}/breadcrumb`);
    return response.data;
  } catch (error) {
    console.error('Error fetching category breadcrumb:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch category breadcrumb');
  }
};

/**
 * Get products by category (direct category only)
 * @param {string} categoryId - The ID of the category
 * @param {Object} filters - Optional filters for products
 * @returns {Promise} - Promise resolving to products with pagination
 */
const getProductsByCategory = async (categoryId, filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') queryParams.append(key, value);
    });
    
    const url = queryParams.toString() 
      ? `/categories/${categoryId}/products?${queryParams.toString()}`
      : `/categories/${categoryId}/products`;
    
    const response = await api.get(url);
    return response.data; // Returns { products, pagination }
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch products');
  }
};

/**
 * Get products by category including subcategories
 * @param {string} categoryId - The ID of the category
 * @param {Object} filters - Optional filters for products
 * @returns {Promise} - Promise resolving to products with pagination and category info
 */
const getProductsByCategoryTree = async (categoryId, filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') queryParams.append(key, value);
    });
    
    const url = queryParams.toString() 
      ? `/categories/${categoryId}/products-tree?${queryParams.toString()}`
      : `/categories/${categoryId}/products-tree`;
    
    const response = await api.get(url);
    return response.data; // Returns { products, pagination, categoryInfo }
  } catch (error) {
    console.error('Error fetching products by category tree:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch products from category tree');
  }
};

/**
 * Admin function to create a new category
 * @param {Object} categoryData - Category information
 * @returns {Promise} - Promise resolving to the created category
 */
const createCategory = async (categoryData) => {
  try {
    const response = await api.post('/categories', categoryData);
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw new Error(error.response?.data?.message || 'Failed to create category');
  }
};

/**
 * Admin function to update a category
 * @param {string} categoryId - The ID of the category to update
 * @param {Object} categoryData - Updated category information
 * @returns {Promise} - Promise resolving to the updated category
 */
const updateCategory = async (categoryId, categoryData) => {
  try {
    const response = await api.put(`/categories/${categoryId}`, categoryData);
    return response.data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw new Error(error.response?.data?.message || 'Failed to update category');
  }
};

/**
 * Admin function to delete a category
 * @param {string} categoryId - The ID of the category to delete
 * @returns {Promise} - Promise resolving to success message
 */
const deleteCategory = async (categoryId) => {
  try {
    const response = await api.delete(`/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete category');
  }
};

/**
 * Admin function to update category product count
 * @param {string} categoryId - The ID of the category
 * @returns {Promise} - Promise resolving to updated count info
 */
const updateCategoryProductCount = async (categoryId) => {
  try {
    const response = await api.post(`/categories/${categoryId}/update-count`);
    return response.data;
  } catch (error) {
    console.error('Error updating category product count:', error);
    throw new Error(error.response?.data?.message || 'Failed to update category product count');
  }
};

const categoryService = {
  getAllCategories,
  getCategoryTree,
  getCategoryById,
  getCategoryBreadcrumb,
  getProductsByCategory,
  getProductsByCategoryTree,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryProductCount
};

export default categoryService;
