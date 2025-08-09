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

// ====================================================================
// ========================= PUBLIC ROUTES ============================
// These routes are accessible to all users without authentication.
// ====================================================================

/**
 * @description Get a list of all categories.
 * @route GET /api/categories
 * @access Public
 */
router.get('/', getAllCategories);

/**
 * @description Get the entire category tree structure for navigation menus.
 * @route GET /api/categories/tree
 * @access Public
 */
router.get('/tree', getCategoryTree);

/**
 * @description Get a single category by its database ID.
 * @route GET /api/categories/:id
 * @access Public
 */
router.get('/:id', getCategoryById);

/**
 * @description Get the breadcrumb path for a specific category.
 * @route GET /api/categories/:id/breadcrumb
 * @access Public
 */
router.get('/:id/breadcrumb', getCategoryBreadcrumb);

/**
 * @description Get products that belong directly to a specific category.
 * @route GET /api/categories/:id/products
 * @access Public
 */
router.get('/:id/products', getProductsByCategory);

/**
 * @description Get products that belong to a category and all its subcategories.
 * @route GET /api/categories/:id/products-tree
 * @access Public
 */
router.get('/:id/products-tree', getProductsByCategoryTree);

// ====================================================================
// ========================= ADMIN ROUTES =============================
// These routes require a valid JWT from a user with the 'admin' role.
// ====================================================================

/**
 * @description Create a new category.
 * @route POST /api/categories
 * @access Private/Admin
 */
router.post('/', protect, admin, createCategory);

/**
 * @description Update an existing category by its ID.
 * @route PUT /api/categories/:id
 * @access Private/Admin
 */
router.put('/:id', protect, admin, updateCategory);

/**
 * @description Delete an existing category by its ID.
 * @route DELETE /api/categories/:id
 * @access Private/Admin
 */
router.delete('/:id', protect, admin, deleteCategory);

/**
 * @description Manually update the cached product count for a category.
 * @route POST /api/categories/:id/update-count
 * @access Private/Admin
 */
router.post('/:id/update-count', protect, admin, updateCategoryProductCount);

module.exports = router;
