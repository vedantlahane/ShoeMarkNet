// src/services/userService.js
import api from '../utils/api';

/**
 * Get the current user's profile
 * @returns {Promise} - Promise resolving to the user profile data
 */
const getUserProfile = async () => {
  try {
    const response = await api.get('/users/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Update the current user's profile
 * @param {Object} userData - Updated user information
 * @returns {Promise} - Promise resolving to the updated user profile
 */
const updateUserProfile = async (userData) => {
  try {
    const response = await api.put('/users/profile', userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Change the user's password
 * @param {Object} passwordData - Object containing current and new password
 * @returns {Promise} - Promise resolving to success message
 */
const changePassword = async (passwordData) => {
  try {
    const response = await api.put('/users/password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

/**
 * Get user's shipping addresses
 * @returns {Promise} - Promise resolving to an array of addresses
 */
const getUserAddresses = async () => {
  try {
    const response = await api.get('/users/addresses');
    return response.data;
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    throw error;
  }
};

/**
 * Add a new shipping address
 * @param {Object} addressData - Shipping address information
 * @returns {Promise} - Promise resolving to the updated addresses list
 */
const addUserAddress = async (addressData) => {
  try {
    const response = await api.post('/users/addresses', addressData);
    return response.data;
  } catch (error) {
    console.error('Error adding user address:', error);
    throw error;
  }
};

/**
 * Update an existing shipping address
 * @param {string} addressId - ID of the address to update
 * @param {Object} addressData - Updated address information
 * @returns {Promise} - Promise resolving to the updated address
 */
const updateUserAddress = async (addressId, addressData) => {
  try {
    const response = await api.put(`/users/addresses/${addressId}`, addressData);
    return response.data;
  } catch (error) {
    console.error(`Error updating address ${addressId}:`, error);
    throw error;
  }
};

/**
 * Delete a shipping address
 * @param {string} addressId - ID of the address to delete
 * @returns {Promise} - Promise resolving to the updated addresses list
 */
const deleteUserAddress = async (addressId) => {
  try {
    const response = await api.delete(`/users/addresses/${addressId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting address ${addressId}:`, error);
    throw error;
  }
};

/**
 * Get user's order history
 * @param {Object} filters - Optional filters for orders
 * @returns {Promise} - Promise resolving to an array of orders
 */
const getUserOrders = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    const response = await api.get(`/users/orders?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

/**
 * Update user notification preferences
 * @param {Object} preferences - Notification preferences
 * @returns {Promise} - Promise resolving to updated preferences
 */
const updateNotificationPreferences = async (preferences) => {
  try {
    const response = await api.put('/users/notifications', preferences);
    return response.data;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
};

/**
 * Admin function to get all users
 * @param {Object} filters - Optional filters for users
 * @returns {Promise} - Promise resolving to an array of users
 */
const getAllUsers = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    const response = await api.get(`/admin/users?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

/**
 * Admin function to update user details
 * @param {string} userId - ID of the user to update
 * @param {Object} userData - Updated user information
 * @returns {Promise} - Promise resolving to the updated user
 */
const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    throw error;
  }
};

/**
 * Admin function to delete a user
 * @param {string} userId - ID of the user to delete
 * @returns {Promise} - Promise resolving to success message
 */
const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    throw error;
  }
};

const userService = {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  getUserOrders,
  updateNotificationPreferences,
  getAllUsers,
  updateUser,
  deleteUser
};

export default userService;
