const express = require('express');
const {
  getDashboardStats,
  getSalesReport,
  getInventoryReport,
  getCustomerAnalytics,
  getLeadScoreData,
  getSettings,
  updateSettings,
  createCampaign,
  getCampaigns,
  updateCampaign,
  deleteCampaign,
  getUsers,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// The `protect` middleware must run first to authenticate the user and attach
// the user object to the request. The `admin` middleware then checks the user's role.
// This is a crucial step for security and proper function.
router.use(protect, admin);

// ====================================================================
// ========================== ADMIN USER ROUTES =======================
// ====================================================================

/**
 * @description Get a list of users for administrative purposes, with optional filters.
 * @route GET /api/admin/users
 * @access Private/Admin
 */
router.get('/users', getUsers);


// ====================================================================
// ======================== DASHBOARD & REPORTS =======================
// ====================================================================

/**
 * @description Get key statistics for the admin dashboard.
 * @route GET /api/admin/dashboard/stats
 * @access Private/Admin
 */
router.get('/dashboard', getDashboardStats);

/**
 * @description Get a sales report with optional date and category filters.
 * @route GET /api/admin/reports/sales
 * @access Private/Admin
 */
router.get('/reports/sales', getSalesReport);

/**
 * @description Get an inventory report, including low and out-of-stock items.
 * @route GET /api/admin/reports/inventory
 * @access Private/Admin
 */
router.get('/reports/inventory', getInventoryReport);

/**
 * @description Get customer analytics, including user source and top customers.
 * @route GET /api/admin/analytics/customers
 * @access Private/Admin
 */
router.get('/analytics/customers', getCustomerAnalytics);

/**
 * @description Get a list of users with their lead scores for sales/marketing.
 * @route GET /api/admin/leads
 * @access Private/Admin
 */
router.get('/leads', getLeadScoreData);

// ====================================================================
// ========================= SETTINGS & CAMPAIGNS =====================
// ====================================================================

/**
 * @description Get current system-wide settings.
 * @route GET /api/admin/settings
 * @access Private/Admin
 */
router.get('/settings', getSettings);

/**
 * @description Update system-wide settings.
 * @route PUT /api/admin/settings
 * @access Private/Admin
 */
router.put('/settings', updateSettings);

/**
 * @description Get a list of all marketing campaigns with optional filters.
 * @route GET /api/admin/campaigns
 * @access Private/Admin
 */
router.get('/campaigns', getCampaigns);

/**
 * @description Create a new marketing campaign.
 * @route POST /api/admin/campaigns
 * @access Private/Admin
 */
router.post('/campaigns', createCampaign);

/**
 * @description Update a specific marketing campaign.
 * @route PUT /api/admin/campaigns/:id
 * @access Private/Admin
 */
router.put('/campaigns/:id', updateCampaign);

/**
 * @description Delete a specific marketing campaign.
 * @route DELETE /api/admin/campaigns/:id
 * @access Private/Admin
 */
router.delete('/campaigns/:id', deleteCampaign);

module.exports = router;
