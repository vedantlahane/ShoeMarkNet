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
 * Fetch new arrival products
 * @param {Object} options - Query options (limit, etc.)
 * @returns {Promise<Array>} Array of new arrival products
 */
const getNewArrivals = async (options = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const url = queryParams.toString() ? `/products/new-arrivals?${queryParams.toString()}` : '/products/new-arrivals';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching new arrivals:', error);
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
 * Search for products
 * @param {string} query - Search query
 * @param {Object} filters - Additional filters
 * @returns {Promise<Object>} Products data with pagination info
 */
const searchProducts = async (query, filters = {}) => {
  try {
    const queryParams = new URLSearchParams({ search: query });
    
    // Add additional filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const response = await api.get(`/products/search?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

/**
 * Fetch a single product by slug
 * @param {string} slug - Product slug
 * @returns {Promise<Object>} Product details
 */
const getProductBySlug = async (slug) => {
  try {
    const response = await api.get(`/products/slug/${slug}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product by slug ${slug}:`, error);
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
 * Get related products for a specific product
 * @param {string} productId - Product ID
 * @param {Object} options - Query options (limit, etc.)
 * @returns {Promise<Array>} Array of related products
 */
const getRelatedProducts = async (productId, options = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const url = queryParams.toString() 
      ? `/products/${productId}/related?${queryParams.toString()}`
      : `/products/${productId}/related`;
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching related products for ${productId}:`, error);
    throw error;
  }
};

/**
 * Check product availability and pricing
 * @param {Object} checkData - Product ID and variant details
 * @returns {Promise<Object>} Availability and pricing information
 */
const checkProductAvailability = async (checkData) => {
  try {
    const response = await api.post('/products/check-availability', checkData);
    return response.data;
  } catch (error) {
    console.error('Error checking product availability:', error);
    throw error;
  }
};

/**
 * Get reviews for a product
 * @param {string} productId - Product ID
 * @param {Object} options - Query options (page, limit, etc.)
 * @returns {Promise<Object>} Reviews data with pagination
 */
const getProductReviews = async (productId, options = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const url = queryParams.toString() 
      ? `/products/${productId}/reviews?${queryParams.toString()}`
      : `/products/${productId}/reviews`;
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching reviews for product ${productId}:`, error);
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
 * Update a review for a product
 * @param {string} productId - Product ID
 * @param {string} reviewId - Review ID
 * @param {Object} reviewData - Updated review information
 * @returns {Promise<Object>} Updated review
 */
const updateReview = async (productId, reviewId, reviewData) => {
  try {
    const response = await api.put(`/products/${productId}/reviews/${reviewId}`, reviewData);
    return response.data;
  } catch (error) {
    console.error(`Error updating review ${reviewId} for product ${productId}:`, error);
    throw error;
  }
};

/**
 * Delete a review for a product
 * @param {string} productId - Product ID
 * @param {string} reviewId - Review ID
 * @returns {Promise<Object>} Deletion confirmation
 */
const deleteReview = async (productId, reviewId) => {
  try {
    const response = await api.delete(`/products/${productId}/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting review ${reviewId} for product ${productId}:`, error);
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

/**
 * Batch update product prices (admin only)
 * @param {Array} updates - Array of price updates { productId, newPrice }
 * @returns {Promise<Object>} Update results
 */
const batchUpdatePrices = async (updates) => {
  try {
    const response = await api.post('/products/batch-update-prices', { updates });
    return response.data;
  } catch (error) {
    console.error('Error batch updating prices:', error);
    throw error;
  }
};

/**
 * Batch update product stock levels (admin only)
 * @param {Array} updates - Array of stock updates { productId, newStock }
 * @returns {Promise<Object>} Update results
 */
const batchUpdateStock = async (updates) => {
  try {
    const response = await api.post('/products/batch-update-stock', { updates });
    return response.data;
  } catch (error) {
    console.error('Error batch updating stock:', error);
    throw error;
  }
};

const productService = {
  getFeaturedProducts,
  getNewArrivals,
  getCategories,
  getProducts,
  searchProducts,
  getProductById,
  getProductBySlug,
  getRelatedProducts,
  checkProductAvailability,
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  createProduct,
  updateProduct,
  deleteProduct,
  batchUpdatePrices,
  batchUpdateStock
};

export default productService;
