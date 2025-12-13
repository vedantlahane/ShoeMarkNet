// src/services/reviewService.js
import api from '../utils/api';

/**
 * Get reviews for a specific product
 * @param {string} productId - The ID of the product
 * @returns {Promise} - Promise resolving to an array of reviews
 */
const getProductReviews = async (productId) => {
  const response = await api.get(`/products/${productId}/reviews`);
  return response.data;
};

/**
 * Create a new review for a product
 * @param {string} productId - The ID of the product
 * @param {Object} reviewData - Review information (rating, comment)
 * @returns {Promise} - Promise resolving to the created review
 */
const createReview = async (productId, reviewData) => {
  const response = await api.post(`/products/${productId}/reviews`, reviewData);
  return response.data;
};

/**
 * Update an existing review
 * @param {string} productId - The ID of the product
 * @param {string} reviewId - The ID of the review to update
 * @param {Object} reviewData - Updated review information
 * @returns {Promise} - Promise resolving to the updated review
 */
const updateReview = async (productId, reviewId, reviewData) => {
  const response = await api.put(`/products/${productId}/reviews/${reviewId}`, reviewData);
  return response.data;
};

/**
 * Delete a review
 * @param {string} productId - The ID of the product
 * @param {string} reviewId - The ID of the review to delete
 * @returns {Promise} - Promise resolving to success message
 */
const deleteReview = async (productId, reviewId) => {
  const response = await api.delete(`/products/${productId}/reviews/${reviewId}`);
  return response.data;
};

/**
 * Admin function to get all reviews
 * @param {Object} filters - Optional filters for reviews
 * @returns {Promise} - Promise resolving to an array of all reviews
 */
// Get all reviews with admin access (with pagination and filters)
export const getAllReviews = async (page = 1, limit = 10, status, sortBy = 'createdAt', order = 'desc') => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      order
    });
    
    if (status) {
      params.append('status', status);
    }
    
    const response = await api.get(`/reviews/admin?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    throw error;
  }
};

// Moderate a review (admin only) - approve, reject, or flag
export const moderateReview = async (reviewId, status, moderationNote = '') => {
  try {
    const response = await api.put(`/reviews/admin/${reviewId}`, {
      status,
      moderationNote
    });
    return response.data;
  } catch (error) {
    console.error('Error moderating review:', error);
    throw error;
  }
};

// Get review statistics for admin dashboard
export const getReviewStats = async () => {
  try {
    const response = await api.get('/reviews/admin/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching review stats:', error);
    throw error;
  }
};

const reviewService = {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  getAllReviews
};

export default reviewService;
