const express = require('express');
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderPayment,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  deleteOrder
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// User routes (protected)
router.post('/', authMiddleware, createOrder);
router.get('/', authMiddleware, getUserOrders);
router.get('/:orderId', authMiddleware, getOrderById);
router.put('/:orderId/pay', authMiddleware, updateOrderPayment);
router.put('/:orderId/cancel', authMiddleware, cancelOrder);

// Admin routes
router.get('/admin/all', authMiddleware, adminMiddleware, getAllOrders);
router.put('/admin/:orderId', authMiddleware, adminMiddleware, updateOrderStatus);
router.delete('/admin/:orderId', authMiddleware, adminMiddleware, deleteOrder);

module.exports = router;
