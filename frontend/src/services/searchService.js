// src/services/searchService.js
import api from '../utils/api';

/**
 * Search for products
 * @param {string} query - Search query
 * @param {Object} filters - Optional filters for search results
 * @returns {Promise} - Promise resolving to search results
 */
const searchProducts = async (query, filters = {}) => {
  const queryParams = new URLSearchParams();
  queryParams.append('q', query);
  
  // Add filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });
  
  const response = await api.get(`/search?${queryParams.toString()}`);
  return response.data;
};

/**
 * Get search suggestions as user types
 * @param {string} query - Partial search query
 * @returns {Promise} - Promise resolving to search suggestions
 */
const getSearchSuggestions = async (query) => {
  const response = await api.get(`/search/suggestions?q=${query}`);
  return response.data;
};

/**
 * Get popular search terms
 * @returns {Promise} - Promise resolving to popular search terms
 */
const getPopularSearches = async () => {
  const response = await api.get('/search/popular');
  return response.data;
};

const searchService = {
  searchProducts,
  getSearchSuggestions,
  getPopularSearches
};

export default searchService;
