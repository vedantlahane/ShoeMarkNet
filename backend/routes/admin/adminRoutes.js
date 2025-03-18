const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin/adminController');

// Dashboard routes
router.get('/dashboard-stats', adminController.getDashboardStats);

// Order routes
router.get('/orders', adminController.getOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);

// Product routes
router.get('/products', adminController.getProducts);
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

module.exports = router;