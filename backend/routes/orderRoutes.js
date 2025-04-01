const express = require('express');
const { createOrder, getUserOrders, updateOrderStatus } = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// Route to create a new order (User must be authenticated)
router.post('/', authMiddleware, createOrder);

// Route to get all orders for the logged-in user (protected)
router.get('/', authMiddleware, getUserOrders);

// Route to update order status (Admin only)
router.put('/status', authMiddleware, adminMiddleware, updateOrderStatus);

module.exports = router;
