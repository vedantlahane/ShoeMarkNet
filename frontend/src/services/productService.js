// src/services/productService.js
import api from '../utils/api';

/**
 * Fetch featured products from the API
 * @returns {Promise<Array>} Array of featured products
 */
const getFeaturedProducts = async () => {
  try {
    const response = await api.get('/products/featured');
    return response.data;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    throw error;
  }
};

/**
 * Fetch all product categories
 * @returns {Promise<Array>} Array of product categories
 */
const getCategories = async () => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Fetch products with optional filtering
 * @param {Object} filters - Filter criteria for products
 * @returns {Promise<Object>} Products data with pagination info
 */
const getProducts = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const response = await api.get(`/products?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Fetch a single product by ID
 * @param {string} id - Product ID
 * @returns {Promise<Object>} Product details
 */
const getProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

/**
 * Create a review for a product
 * @param {string} productId - Product ID
 * @param {Object} reviewData - Review information (rating, comment)
 * @returns {Promise<Object>} Updated product with new review
 */
const createReview = async (productId, reviewData) => {
  try {
    const response = await api.post(`/products/${productId}/reviews`, reviewData);
    return response.data;
  } catch (error) {
    console.error(`Error creating review for product ${productId}:`, error);
    throw error;
  }
};

/**
 * Create a new product (admin only)
 * @param {Object} productData - Product information
 * @returns {Promise<Object>} Created product
 */
// Update the createProduct method in productService.js
const createProduct = async (productData) => {
  try {
    // For debugging
    console.log('Sending product data:', JSON.stringify(productData));
    
    // Clean up the data before sending
    const cleanedData = { ...productData };
    
    // Remove empty arrays
    if (cleanedData.images && cleanedData.images.length === 0) {
      delete cleanedData.images;
    }
    
    if (cleanedData.variants && cleanedData.variants.length === 0) {
      delete cleanedData.variants;
    }
    
    const response = await api.post('/products', cleanedData);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error.response?.data || error.message);
    throw error;
  }
};


/**
 * Update an existing product (admin only)
 * @param {string} id - Product ID
 * @param {Object} productData - Updated product information
 * @returns {Promise<Object>} Updated product
 */
const updateProduct = async (id, productData) => {
  try {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a product (admin only)
 * @param {string} id - Product ID
 * @returns {Promise<Object>} Deletion confirmation
 */
const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw error;
  }
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
