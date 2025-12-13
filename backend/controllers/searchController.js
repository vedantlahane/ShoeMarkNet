const Product = require('../models/Product');
const SearchHistory = require('../models/SearchHistory');
const asyncHandler = require('express-async-handler');

/**
 * @description Search for products based on a query and optional filters.
 * @route GET /api/search/products
 * @access Public
 */
const searchProducts = asyncHandler(async (req, res) => {
  const { 
    q, 
    category, 
    minPrice, 
    maxPrice, 
    sort, 
    page = 1, 
    limit = 10 
  } = req.query;
  
  if (!q) {
    res.status(400);
    throw new Error('Search query is required');
  }
  
  // Build the main search filter using MongoDB text search if available
  let searchFilter = {};
  let useTextSearch = false;
  
  // Try to use MongoDB text search first
  try {
    searchFilter = {
      $text: { $search: q }
    };
    useTextSearch = true;
  } catch (error) {
    // Fall back to regex search if text index is not available
    searchFilter = {
      $or: [
        { name: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') },
        { brand: new RegExp(q, 'i') }
      ]
    };
  }
  
  // Add additional filters from the query parameters
  if (category) searchFilter.category = category;
  if (minPrice || maxPrice) {
    searchFilter.price = {};
    if (minPrice) searchFilter.price.$gte = Number(minPrice);
    if (maxPrice) searchFilter.price.$lte = Number(maxPrice);
  }
  
  // Build a sort object
  let sortOption = {};
  if (sort) {
    const [field, order] = sort.split(':');
    sortOption[field] = order === 'desc' ? -1 : 1;
  } else if (useTextSearch) {
    // Sort by text relevance if using text search
    sortOption = { score: { $meta: 'textScore' } };
  } else {
    // Default sort for regex search
    sortOption = { name: 1 };
  }
  
  // Calculate pagination values
  const skip = (Number(page) - 1) * Number(limit);
  
  // Build the query
  let query = Product.find(searchFilter);
  
  // Add text score projection if using text search
  if (useTextSearch) {
    query = query.select({ score: { $meta: 'textScore' } });
  }
  
  // Execute the search query
  const products = await query
    .sort(sortOption)
    .skip(skip)
    .limit(Number(limit));
  
  // Get the total count of matching documents for pagination metadata
  const total = await Product.countDocuments(searchFilter);
  
  // Save the search query to history if a user is authenticated
  if (req.user) {
    await SearchHistory.create({
      user: req.user.id,
      query: q,
      resultsCount: total,
      filters: req.query
    });
  }
  
  res.status(200).json({
    products,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    }
  });
});

/**
 * @description Get real-time search suggestions based on a partial query.
 * @route GET /api/search/suggestions
 * @access Public
 */
const getSearchSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;
  
  // Suggestions are only useful for queries with at least two characters
  if (!q || q.length < 2) {
    return res.status(200).json([]);
  }
  
  // Find products where the name starts with the query, case-insensitive
  const products = await Product.find({
    name: new RegExp(`^${q}`, 'i')
  })
  .select('name')
  .limit(5);
  
  // Extract product names into a simple array for the response
  const suggestions = products.map(product => product.name);
  
  res.status(200).json(suggestions);
});

/**
 * @description Get a list of popular searches based on historical data.
 * @route GET /api/search/popular
 * @access Public
 */
const getPopularSearches = asyncHandler(async (req, res) => {
  // Use MongoDB aggregation to group queries and count their occurrences
  const popularSearches = await SearchHistory.aggregate([
    { $group: { _id: '$query', count: { $sum: 1 } } }, // Group by the query string and count
    { $sort: { count: -1 } }, // Sort in descending order of count
    { $limit: 10 } // Return the top 10
  ]);
  
  // Format the results for a cleaner response
  const results = popularSearches.map(item => ({
    query: item._id,
    count: item.count
  }));
  
  res.status(200).json(results);
});

module.exports = {
  searchProducts,
  getSearchSuggestions,
  getPopularSearches
};
