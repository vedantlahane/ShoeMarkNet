// src/services/adminService.js
import api from '../utils/api';

/**
 * Get dashboard statistics
 * @returns {Promise} - Promise resolving to dashboard statistics
 */
const getDashboardStats = async () => {
  try {
    const response = await api.get('/admin/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};
/**
 * Get sales reports with optional filters
 * @param {Object} filters - Filters for the report (date range, product category, etc.)
 * @returns {Promise} - Promise resolving to sales report data
 */
const getSalesReport = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    const response = await api.get(`/admin/reports/sales?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sales report:', error);
    throw error;
  }
};

/**
 * Get inventory status report
 * @returns {Promise} - Promise resolving to inventory data
 */
const getInventoryReport = async () => {
  try {
    const response = await api.get('/admin/reports/inventory');
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory report:', error);
    throw error;
  }
};

/**
 * Get customer analytics
 * @param {Object} filters - Filters for the analytics (date range, etc.)
 * @returns {Promise} - Promise resolving to customer analytics data
 */
const getCustomerAnalytics = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    const response = await api.get(`/admin/analytics/customers?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching customer analytics:', error);
    throw error;
  }
};

/**
 * Get lead scoring data
 * @returns {Promise} - Promise resolving to lead scoring data
 */
const getLeadScoreData = async () => {
  try {
    const response = await api.get('/admin/leads');
    return response.data;
  } catch (error) {
    console.error('Error fetching lead score data:', error);
    throw error;
  }
};

/**
 * Update system settings
 * @param {Object} settings - Updated system settings
 * @returns {Promise} - Promise resolving to updated settings
 */
const updateSettings = async (settings) => {
  try {
    const response = await api.put('/admin/settings', settings);
    return response.data;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

/**
 * Create a promotional campaign
 * @param {Object} campaignData - Campaign information
 * @returns {Promise} - Promise resolving to the created campaign
 */
const createCampaign = async (campaignData) => {
  try {
    const response = await api.post('/admin/campaigns', campaignData);
    return response.data;
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
};

/**
 * Get all promotional campaigns
 * @param {Object} filters - Optional filters for campaigns
 * @returns {Promise} - Promise resolving to an array of campaigns
 */
const getCampaigns = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    const url = queryParams.toString() ? `/admin/campaigns?${queryParams.toString()}` : '/admin/campaigns';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    throw error;
  }
};

/**
 * Update a campaign
 * @param {string} campaignId - ID of the campaign to update
 * @param {Object} campaignData - Updated campaign data
 * @returns {Promise} - Promise resolving to the updated campaign
 */
const updateCampaign = async (campaignId, campaignData) => {
  try {
    const response = await api.put(`/admin/campaigns/${campaignId}`, campaignData);
    return response.data;
  } catch (error) {
    console.error(`Error updating campaign ${campaignId}:`, error);
    throw error;
  }
};

/**
 * Delete a campaign
 * @param {string} campaignId - ID of the campaign to delete
 * @returns {Promise} - Promise resolving to success message
 */
const deleteCampaign = async (campaignId) => {
  try {
    const response = await api.delete(`/admin/campaigns/${campaignId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting campaign ${campaignId}:`, error);
    throw error;
  }
};

const adminService = {
  getDashboardStats,
  getSalesReport,
  getInventoryReport,
  getCustomerAnalytics,
  getLeadScoreData,
  updateSettings,
  createCampaign,
  getCampaigns,
  updateCampaign,
  deleteCampaign
};

module.exports = adminService;
