// src/services/adminService.js
import api from '../utils/api';

/**
 * Get dashboard statistics
 * @returns {Promise} - Promise resolving to dashboard statistics
 */
const getDashboardStats = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

/**
 * Get sales reports with optional filters
 * @param {Object} filters - Filters for the report (date range, product category, etc.)
 * @returns {Promise} - Promise resolving to sales report data
 */
const getSalesReport = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  // Add filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });
  
  const response = await api.get(`/admin/reports/sales?${queryParams.toString()}`);
  return response.data;
};

/**
 * Get inventory status report
 * @returns {Promise} - Promise resolving to inventory data
 */
const getInventoryReport = async () => {
  const response = await api.get('/admin/reports/inventory');
  return response.data;
};

/**
 * Get customer analytics
 * @param {Object} filters - Filters for the analytics (date range, etc.)
 * @returns {Promise} - Promise resolving to customer analytics data
 */
const getCustomerAnalytics = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  // Add filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });
  
  const response = await api.get(`/admin/analytics/customers?${queryParams.toString()}`);
  return response.data;
};

/**
 * Get lead scoring data
 * @returns {Promise} - Promise resolving to lead scoring data
 */
const getLeadScoreData = async () => {
  const response = await api.get('/admin/leads');
  return response.data;
};

/**
 * Update system settings
 * @param {Object} settings - Updated system settings
 * @returns {Promise} - Promise resolving to updated settings
 */
const updateSettings = async (settings) => {
  const response = await api.put('/admin/settings', settings);
  return response.data;
};

/**
 * Create a promotional campaign
 * @param {Object} campaignData - Campaign information
 * @returns {Promise} - Promise resolving to the created campaign
 */
const createCampaign = async (campaignData) => {
  const response = await api.post('/admin/campaigns', campaignData);
  return response.data;
};

/**
 * Get all promotional campaigns
 * @returns {Promise} - Promise resolving to an array of campaigns
 */
const getCampaigns = async () => {
  const response = await api.get('/admin/campaigns');
  return response.data;
};

const adminService = {
  getDashboardStats,
  getSalesReport,
  getInventoryReport,
  getCustomerAnalytics,
  getLeadScoreData,
  updateSettings,
  createCampaign,
  getCampaigns
};

export default adminService;
