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
const {protect, admin} = require('../middleware/authMiddleware');

const router = express.Router();

// User routes (protected)
router.post('/', protect, createOrder);
router.get('/', protect, getUserOrders);
router.get('/:orderId', protect, getOrderById);
router.put('/:orderId/pay', protect, updateOrderPayment);
router.put('/:orderId/cancel',protect, cancelOrder);

// Admin routes
router.get('/admin/all', protect,admin, getAllOrders);
router.put('/admin/:orderId', protect,admin, updateOrderStatus);
router.delete('/admin/:orderId', protect,admin, deleteOrder);

module.exports = router;
