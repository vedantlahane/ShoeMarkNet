const express = require('express');
const {
  searchProducts,
  getSearchSuggestions,
  getPopularSearches
} = require('../controllers/searchController');
const router = express.Router();

// ====================================================================
// ========================= PUBLIC ROUTES ============================
// These routes are accessible to all users without authentication.
// ====================================================================

/**
 * @description Main search endpoint for products. Supports full-text search with optional filters and pagination.
 * @route GET /api/search
 * @access Public
 * @example /api/search?q=laptop&category=electronics&minPrice=500
 */
router.get('/', searchProducts);

/**
 * @description Provides real-time search suggestions as a user types in the search bar.
 * @route GET /api/search/suggestions
 * @access Public
 * @example /api/search/suggestions?q=lap
 */
router.get('/suggestions', getSearchSuggestions);

/**
 * @description Retrieves a list of the most popular search queries from the application's history.
 * @route GET /api/search/popular
 * @access Public
 */
router.get('/popular', getPopularSearches);

module.exports = router;
