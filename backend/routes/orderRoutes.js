const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderPayment,
  cancelOrder,
  getAllOrders,
  getOrderStats,
  updateOrderStatus,
  deleteOrder,
  validateCoupon
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// ====================================================================
// ==================== PROTECTED USER ROUTES =========================
// These routes require a valid JWT to access.
// ====================================================================

/**
 * @description Create a new order.
 * @route POST /api/orders
 * @access Private
 */
router.post('/', protect, createOrder);

/**
 * @description Validate a coupon for the authenticated user's cart.
 * @route POST /api/orders/validate-coupon
 * @access Private
 */
router.post('/validate-coupon', protect, validateCoupon);

/**
 * @description Get all orders for the authenticated user.
 * @route GET /api/orders
 * @access Private
 */
router.get('/', protect, getUserOrders);

/**
 * @description Get a specific order by its ID.
 * @route GET /api/orders/:orderId
 * @access Private
 */
router.get('/:orderId', protect, getOrderById);

/**
 * @description Track order delivery status.
 * @route GET /api/orders/:orderId/track
 * @access Private
 */
router.get('/:orderId/track', protect, getOrderById); // Using same function for now

/**
 * @description Update an order's payment status after a successful transaction.
 * @route PUT /api/orders/:orderId/pay
 * @access Private
 */
router.put('/:orderId/pay', protect, updateOrderPayment);

/**
 * @description Cancel an order.
 * @route PUT /api/orders/:orderId/cancel
 * @access Private
 */
router.put('/:orderId/cancel', protect, cancelOrder);

// ====================================================================
// ========================= ADMIN ROUTES =============================
// These routes require a valid JWT and an 'admin' role.
// ====================================================================

/**
 * @description Get all orders for the admin dashboard, with optional filtering and pagination.
 * @route GET /api/orders/admin/all
 * @access Private/Admin
 */
router.get('/admin/all', protect, admin, getAllOrders);

/**
 * @description Get order statistics for admin dashboard.
 * @route GET /api/orders/admin/stats
 * @access Private/Admin
 */
router.get('/admin/stats', protect, admin, getOrderStats);

/**
 * @description Update the status of a specific order.
 * @route PUT /api/orders/admin/:orderId
 * @access Private/Admin
 */
router.put('/admin/:orderId', protect, admin, updateOrderStatus);

/**
 * @description Delete a specific order.
 * @route DELETE /api/orders/admin/:orderId
 * @access Private/Admin
 */
router.delete('/admin/:orderId', protect, admin, deleteOrder);

module.exports = router;
