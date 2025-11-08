// src/services/productService.js
import api from '../utils/api';

const unwrapResponse = (response) => {
  const payload = response?.data ?? response;
  if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'data')) {
    return payload.data;
  }
  return payload;
};

const isNumericKeyedObject = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const keys = Object.keys(value);
  if (keys.length === 0) {
    return false;
  }

  return keys.every((key) => /^\d+$/.test(key));
};

const normaliseCollection = (value, preferredKeys = []) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  for (const key of preferredKeys) {
    if (Array.isArray(value?.[key])) {
      return value[key];
    }
  }

  if (value && typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, 'data')) {
    return normaliseCollection(value.data, preferredKeys);
  }

  if (Array.isArray(value?.items)) {
    return value.items;
  }

  if (Array.isArray(value?.results)) {
    return value.results;
  }

  if (isNumericKeyedObject(value)) {
    return Object.keys(value)
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => value[key]);
  }

  return [];
};

/**
 * Fetch featured products from the API
 * @returns {Promise<Array>} Array of featured products
 */
const getFeaturedProducts = async () => {
  try {
    const response = await api.get('/products/featured');
    return normaliseCollection(unwrapResponse(response), ['products']);
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
    return normaliseCollection(unwrapResponse(response), ['products']);
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
    return normaliseCollection(unwrapResponse(response), ['categories']);
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
    return unwrapResponse(response);
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
    const queryParams = new URLSearchParams();
    if (query !== null && query !== undefined && query !== '') {
      queryParams.set('q', query);
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') return;
      queryParams.set(key, value);
    });

    const queryString = queryParams.toString();
    const url = queryString ? `/search?${queryString}` : '/search';
    const response = await api.get(url);
    return unwrapResponse(response);
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
    return unwrapResponse(response);
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
    return unwrapResponse(response);
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
    return normaliseCollection(unwrapResponse(response), ['products']);
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
    return unwrapResponse(response);
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
    return unwrapResponse(response);
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
    return unwrapResponse(response);
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
    return unwrapResponse(response);
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
    return unwrapResponse(response);
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
    const data = unwrapResponse(response);
    return data?.product ?? data;
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
    const data = unwrapResponse(response);
    return data?.product ?? data;
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
    return unwrapResponse(response);
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
    return unwrapResponse(response);
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
    return unwrapResponse(response);
  } catch (error) {
    console.error('Error batch updating stock:', error);
    throw error;
  }
};

/**
 * Bulk update multiple products (admin only)
 * @param {Object} params - { productIds: [], updates: {} }
 * @returns {Promise<Object>} Update results
 */
const bulkUpdateProducts = async ({ productIds, updates }) => {
  try {
    const response = await api.post('/products/bulk-update', { productIds, updates });
    return unwrapResponse(response);
  } catch (error) {
    console.error('Error bulk updating products:', error);
    throw error;
  }
};

const exportProducts = async (products, format = 'csv') => {
  try {
    const safeProducts = Array.isArray(products) ? products : [];

    if (format === 'json') {
      return JSON.stringify(safeProducts, null, 2);
    }

    const headers = [
      'ID',
      'Name',
      'Brand',
      'Category',
      'Price',
      'Stock',
      'Featured',
      'Active',
      'Created At'
    ];

    const rows = safeProducts.map((product) => {
      const values = [
        product._id,
        `"${(product.name || '').replace(/"/g, '""')}"`,
        `"${(product.brand || '').replace(/"/g, '""')}"`,
        product.category?.name || product.category || '',
        Number(product.price || 0),
        Number(product.countInStock || 0),
        product.isFeatured ? 'Yes' : 'No',
        product.isActive === false ? 'No' : 'Yes',
        product.createdAt ? new Date(product.createdAt).toISOString() : ''
      ];
      return values.join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  } catch (error) {
    console.error('Error exporting products:', error);
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
  batchUpdateStock,
  bulkUpdateProducts,
  exportProducts
};

export default productService;
