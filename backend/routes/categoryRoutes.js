const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoryTree,
  getCategoryById,
  getCategoryBreadcrumb,
  getProductsByCategory,
  getProductsByCategoryTree,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryProductCount
} = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllCategories);
router.get('/tree', getCategoryTree);
router.get('/:id', getCategoryById);
router.get('/:id/breadcrumb', getCategoryBreadcrumb);
router.get('/:id/products', getProductsByCategory);
router.get('/:id/products-tree', getProductsByCategoryTree);

// Admin routes
router.post('/', protect, admin, createCategory);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);
router.post('/:id/update-count', protect, admin, updateCategoryProductCount);

module.exports = router;