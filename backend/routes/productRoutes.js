const express = require('express');
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addToCart,
} = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// Route to create a new product (Admin only)
router.post('/', authMiddleware, adminMiddleware, createProduct);

// Route to get all products
router.get('/', getAllProducts);

// Route to get a single product by ID
router.get('/:id', getProductById);

// Route to update a product (Admin only)
router.put('/:id', authMiddleware, adminMiddleware, updateProduct);

// Route to delete a product (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);

// Route to add product to cart (User must be authenticated)
router.post('/cart', authMiddleware, addToCart);

module.exports = router;
