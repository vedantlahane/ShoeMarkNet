const express = require('express');
const {
  searchProducts,
  getSearchSuggestions,
  getPopularSearches
} = require('../controllers/searchController');

const router = express.Router();

router.get('/', searchProducts);
router.get('/suggestions', getSearchSuggestions);
router.get('/popular', getPopularSearches);

module.exports = router;
