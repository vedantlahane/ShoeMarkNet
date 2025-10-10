const express = require('express');
const {
  getDashboardStats,
  getSalesReport,
  getInventoryReport,
  getCustomerAnalytics,
  getCategoryAnalytics,
  getLeadScoreData,
  getSettings,
  updateSettings,
  createCampaign,
  getCampaigns,
  updateCampaign,
  deleteCampaign,
  getUsers,
} = require('../controllers/adminController');
const {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  createNotification
} = require('../controllers/notificationController');
const {
  streamRealtimeStats,
  getRealtimeSnapshot
} = require('../controllers/realtimeController');
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
 * @description Get analytics for a specific category.
 * @route GET /api/admin/analytics/categories/:categoryId
 * @access Private/Admin
 */
router.get('/analytics/categories/:categoryId', getCategoryAnalytics);

/**
 * @description Get a list of users with their lead scores for sales/marketing.
 * @route GET /api/admin/leads
 * @access Private/Admin
 */
router.get('/leads', getLeadScoreData);

// ====================================================================
// =========================== NOTIFICATIONS ==========================
// ====================================================================

/**
 * @description Fetch admin notifications with optional filters.
 * @route GET /api/admin/notifications
 * @access Private/Admin
 */
router.get('/notifications', getNotifications);

/**
 * @description Create a new notification for admin users.
 * @route POST /api/admin/notifications
 * @access Private/Admin
 */
router.post('/notifications', createNotification);

/**
 * @description Mark a notification as read.
 * @route PATCH /api/admin/notifications/:id/read
 * @access Private/Admin
 */
router.patch('/notifications/:id/read', markNotificationRead);

/**
 * @description Mark all notifications as read, optionally filtered by category or priority.
 * @route PATCH /api/admin/notifications/read-all
 * @access Private/Admin
 */
router.patch('/notifications/read-all', markAllNotificationsRead);

// ====================================================================
// ============================ REALTIME ==============================
// ====================================================================

/**
 * @description Streams realtime admin stats via Server-Sent Events.
 * @route GET /api/admin/realtime
 * @access Private/Admin
 */
router.get('/realtime', streamRealtimeStats);

/**
 * @description Provides a snapshot of realtime stats for polling clients.
 * @route GET /api/admin/realtime/snapshot
 * @access Private/Admin
 */
router.get('/realtime/snapshot', getRealtimeSnapshot);

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
