// src/services/searchService.js
import api from '../utils/api';

/**
 * Search for products
 * @param {string} query - Search query
 * @param {Object} options - Optional search options
 * @param {string} options.category - Filter by category
 * @param {number} options.minPrice - Minimum price filter
 * @param {number} options.maxPrice - Maximum price filter
 * @param {string} options.sort - Sort option (e.g., 'price:asc', 'name:desc')
 * @param {number} options.page - Page number for pagination (default: 1)
 * @param {number} options.limit - Number of results per page (default: 10)
 * @returns {Promise} - Promise resolving to search results with pagination
 */
const searchProducts = async (query, options = {}) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    
    // Add all options to query params
    const { category, minPrice, maxPrice, sort, page = 1, limit = 10 } = options;
    
    if (category) queryParams.append('category', category);
    if (minPrice) queryParams.append('minPrice', minPrice.toString());
    if (maxPrice) queryParams.append('maxPrice', maxPrice.toString());
    if (sort) queryParams.append('sort', sort);
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    
    const response = await api.get(`/search?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

/**
 * Get search suggestions as user types
 * @param {string} query - Partial search query
 * @returns {Promise} - Promise resolving to search suggestions
 */
const getSearchSuggestions = async (query) => {
  try {
    if (!query || query.length < 2) {
      return [];
    }
    const response = await api.get(`/search/suggestions?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    return []; // Return empty array on error to avoid breaking UI
  }
};

/**
 * Get popular search terms
 * @returns {Promise} - Promise resolving to popular search terms
 */
const getPopularSearches = async () => {
  try {
    const response = await api.get('/search/popular');
    return response.data;
  } catch (error) {
    console.error('Error fetching popular searches:', error);
    throw error;
  }
};

/**
 * Get user's search history (requires authentication)
 * @param {number} page - Page number for pagination (default: 1)
 * @param {number} limit - Number of results per page (default: 10)
 * @returns {Promise} - Promise resolving to user's search history
 */
const getUserSearchHistory = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/users/search-history?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching search history:', error);
    throw error;
  }
};

/**
 * Clear user's search history (requires authentication)
 * @returns {Promise} - Promise resolving to success confirmation
 */
const clearSearchHistory = async () => {
  try {
    const response = await api.delete('/users/search-history');
    return response.data;
  } catch (error) {
    console.error('Error clearing search history:', error);
    throw error;
  }
};

const searchService = {
  searchProducts,
  getSearchSuggestions,
  getPopularSearches,
  getUserSearchHistory,
  clearSearchHistory
};

export default searchService;
