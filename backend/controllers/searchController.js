const Product = require('../models/Product');
const SearchHistory = require('../models/SearchHistory');

// Search products
const searchProducts = async (req, res) => {
  try {
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
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    // Build search filter
    const searchFilter = {
      $or: [
        { name: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') },
        { brand: new RegExp(q, 'i') }
      ]
    };
    
    // Add additional filters
    if (category) searchFilter.category = category;
    if (minPrice || maxPrice) {
      searchFilter.price = {};
      if (minPrice) searchFilter.price.$gte = Number(minPrice);
      if (maxPrice) searchFilter.price.$lte = Number(maxPrice);
    }
    
    // Build sort object
    let sortOption = {};
    if (sort) {
      const [field, order] = sort.split(':');
      sortOption[field] = order === 'desc' ? -1 : 1;
    } else {
      sortOption = { relevanceScore: -1 }; // Default sort by relevance
    }
    
    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Execute search query
    const products = await Product.find(searchFilter)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));
    
    // Get total count for pagination
    const total = await Product.countDocuments(searchFilter);
    
    // Save search query to history if user is authenticated
    if (req.user) {
      await SearchHistory.create({
        user: req.user.id,
        query: q,
        resultsCount: total
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
  } catch (error) {
    res.status(500).json({ message: 'Error searching products', error: error.message });
  }
};

// Get search suggestions
const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(200).json([]);
    }
    
    // Find products matching the query
    const products = await Product.find({
      name: new RegExp(q, 'i')
    })
    .select('name')
    .limit(5);
    
    // Extract product names for suggestions
    const suggestions = products.map(product => product.name);
    
    res.status(200).json(suggestions);
  } catch (error) {
    res.status(500).json({ message: 'Error getting search suggestions', error: error.message });
  }
};

// Get popular searches
const getPopularSearches = async (req, res) => {
  try {
    // Aggregate popular searches from search history
    const popularSearches = await SearchHistory.aggregate([
      { $group: { _id: '$query', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Format results
    const results = popularSearches.map(item => ({
      query: item._id,
      count: item.count
    }));
    
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error getting popular searches', error: error.message });
  }
};

module.exports = {
  searchProducts,
  getSearchSuggestions,
  getPopularSearches
};
