// src/services/wishlistService.js
import api from '../utils/api';

/**
 * Get the user's wishlist with pagination support
 * @param {number} page - Page number for pagination (default: 1)
 * @param {number} limit - Number of items per page (default: 20)
 * @param {string} sort - Sort option (default: '-createdAt')
 * @returns {Promise} - Promise resolving to wishlist data with pagination
 */
const getWishlist = async (page = 1, limit = 20, sort = '-createdAt') => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort
    });
    
    const response = await api.get(`/wishlist?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }
};

/**
 * Add a product to the user's wishlist
 * @param {string} productId - ID of the product to add
 * @returns {Promise} - Promise resolving to updated wishlist
 */
const addToWishlist = async (productId) => {
  try {
    const response = await api.post('/wishlist', { productId });
    return response.data;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

/**
 * Remove a product from the user's wishlist
 * @param {string} productId - ID of the product to remove
 * @returns {Promise} - Promise resolving to updated wishlist
 */
const removeFromWishlist = async (productId) => {
  try {
    const response = await api.delete(`/wishlist/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};

/**
 * Clear all items from the user's wishlist
 * @returns {Promise} - Promise resolving to success confirmation
 */
const clearWishlist = async () => {
  try {
    const response = await api.delete('/wishlist');
    return response.data;
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    throw error;
  }
};

/**
 * Check if a specific product is in the user's wishlist
 * @param {string} productId - ID of the product to check
 * @returns {Promise} - Promise resolving to boolean indicating if product is in wishlist
 */
const checkProductInWishlist = async (productId) => {
  try {
    const response = await api.get(`/wishlist/check/${productId}`);
    return response.data.inWishlist;
  } catch (error) {
    console.error('Error checking product in wishlist:', error);
    throw error;
  }
};

/**
 * Toggle a product in the wishlist (add if not present, remove if present)
 * @param {string} productId - ID of the product to toggle
 * @returns {Promise} - Promise resolving to updated wishlist data
 */
const toggleWishlistItem = async (productId) => {
  try {
    const isInWishlist = await checkProductInWishlist(productId);
    
    if (isInWishlist) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  } catch (error) {
    console.error('Error toggling wishlist item:', error);
    throw error;
  }
};

/**
 * Get the total count of items in the wishlist (lightweight call)
 * @returns {Promise} - Promise resolving to the count of wishlist items
 */
const getWishlistCount = async () => {
  try {
    const response = await getWishlist(1, 1); // Get minimal data
    return response.pagination ? response.pagination.total : 0;
  } catch (error) {
    console.error('Error getting wishlist count:', error);
    return 0; // Return 0 on error to prevent UI breaking
  }
};

const wishlistService = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkProductInWishlist,
  toggleWishlistItem,
  getWishlistCount
};

export default wishlistService;
