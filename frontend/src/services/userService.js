// src/services/userService.js
import api from '../utils/api';

/**
 * Get the current user's profile
 * @returns {Promise} - Promise resolving to the user profile data
 */
const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

/**
 * Update the current user's profile
 * @param {Object} userData - Updated user information
 * @returns {Promise} - Promise resolving to the updated user profile
 */
const updateUserProfile = async (userData) => {
  const response = await api.put('/users/profile', userData);
  return response.data;
};

/**
 * Change the user's password
 * @param {Object} passwordData - Object containing current and new password
 * @returns {Promise} - Promise resolving to success message
 */
const changePassword = async (passwordData) => {
  const response = await api.put('/users/password', passwordData);
  return response.data;
};

/**
 * Get user's shipping addresses
 * @returns {Promise} - Promise resolving to an array of addresses
 */
const getUserAddresses = async () => {
  const response = await api.get('/users/addresses');
  return response.data;
};

/**
 * Add a new shipping address
 * @param {Object} addressData - Shipping address information
 * @returns {Promise} - Promise resolving to the updated addresses list
 */
const addUserAddress = async (addressData) => {
  const response = await api.post('/users/addresses', addressData);
  return response.data;
};

/**
 * Update an existing shipping address
 * @param {string} addressId - ID of the address to update
 * @param {Object} addressData - Updated address information
 * @returns {Promise} - Promise resolving to the updated address
 */
const updateUserAddress = async (addressId, addressData) => {
  const response = await api.put(`/users/addresses/${addressId}`, addressData);
  return response.data;
};

/**
 * Delete a shipping address
 * @param {string} addressId - ID of the address to delete
 * @returns {Promise} - Promise resolving to the updated addresses list
 */
const deleteUserAddress = async (addressId) => {
  const response = await api.delete(`/users/addresses/${addressId}`);
  return response.data;
};

/**
 * Admin function to get all users
 * @param {Object} filters - Optional filters for users
 * @returns {Promise} - Promise resolving to an array of users
 */
const getAllUsers = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  // Add filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });
  
  const response = await api.get(`/users/admin?${queryParams.toString()}`);
  return response.data;
};

/**
 * Admin function to update user details
 * @param {string} userId - ID of the user to update
 * @param {Object} userData - Updated user information
 * @returns {Promise} - Promise resolving to the updated user
 */
const updateUser = async (userId, userData) => {
  const response = await api.put(`/users/admin/${userId}`, userData);
  return response.data;
};

/**
 * Admin function to delete a user
 * @param {string} userId - ID of the user to delete
 * @returns {Promise} - Promise resolving to success message
 */
const deleteUser = async (userId) => {
  const response = await api.delete(`/users/admin/${userId}`);
  return response.data;
};

const userService = {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  getAllUsers,
  updateUser,
  deleteUser
};

export default userService;
