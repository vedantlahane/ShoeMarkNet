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

/**
 * Update user notification preferences
 * @param {Object} preferences - Notification preferences (newsletter, marketing)
 * @returns {Promise} - Promise resolving to updated preferences
 */
const updateUserPreferences = async (preferences) => {
  try {
    const response = await api.put('/users/preferences', preferences);
    return response.data;
  } catch (error) {
    console.error('Error updating user preferences:', error);
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
    
    const response = await api.get(`/users/admin?${queryParams.toString()}`);
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
    const response = await api.put(`/users/admin/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    throw error;
  }
};

/**
 * Delete a user (admin only)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Deletion confirmation
 */
const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/admin/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    throw error;
  }
};

/**
 * Bulk update multiple users (admin only)
 * @param {Object} params - { userIds: [], updates: {} }
 * @returns {Promise<Object>} Update results
 */
const bulkUpdateUsers = async ({ userIds, updates }) => {
  try {
    const response = await api.post('/users/admin/bulk-update', { userIds, updates });
    return response.data;
  } catch (error) {
    console.error('Error bulk updating users:', error);
    throw error;
  }
};

/**
 * Export users data (admin only)
 * @param {Array} users - Array of user objects to export
 * @param {string} format - Export format ('csv' or 'json')
 * @returns {Promise<string>} Exported data
 */
const exportUsers = async (users, format = 'csv') => {
  try {
    if (format === 'csv') {
      // Convert users to CSV format
      const headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'Verified', 'Created At', 'Last Login'];
      const csvRows = [headers.join(',')];
      
      users.forEach(user => {
        const row = [
          user._id,
          `"${user.name || ''}"`,
          `"${user.email || ''}"`,
          user.role || 'user',
          user.isActive ? 'Active' : 'Inactive',
          user.isVerified ? 'Verified' : 'Unverified',
          user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
          user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : ''
        ];
        csvRows.push(row.join(','));
      });
      
      return csvRows.join('\n');
    } else if (format === 'json') {
      return JSON.stringify(users, null, 2);
    } else {
      throw new Error('Unsupported export format');
    }
  } catch (error) {
    console.error('Error exporting users:', error);
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
  getUserSearchHistory,
  clearSearchHistory,
  updateUserPreferences,
  getAllUsers,
  updateUser,
  deleteUser,
  bulkUpdateUsers,
  exportUsers
};

export default userService;
