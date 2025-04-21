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
const getAllReviews = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  // Add filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });
  
  const response = await api.get(`/reviews/admin?${queryParams.toString()}`);
  return response.data;
};

const reviewService = {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  getAllReviews
};

export default reviewService;
