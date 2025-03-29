const Shoe = require('../models/Shoe'); // Note: Capitalized 'S' in Shoe to match the new model name

// Get all shoes with pagination and sorting
exports.getAllShoes = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Sorting
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

    // Populate referenced fields
    const shoes = await Shoe.find()
      .populate('brand', 'name')
      .populate('category', 'name')
      .populate('colors', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder });

    // Calculate total number of shoes for pagination metadata
    const totalShoes = await Shoe.countDocuments();

    res.json({
      shoes,
      currentPage: page,
      totalPages: Math.ceil(totalShoes / limit),
      totalShoes
    });
  } catch (err) {
    console.error("Error fetching shoes:", err);
    res.status(500).json({ message: 'Error fetching shoes' });
  }
};

// Get a single shoe by ID with populated fields
exports.getShoeById = async (req, res) => {
  try {
    const shoe = await Shoe.findById(req.params.id)
      .populate('brand', 'name')
      .populate('category', 'name')
      .populate('colors', 'name');

    if (!shoe) {
      return res.status(404).json({ message: 'Shoe not found' });
    }
    res.json(shoe);
  } catch (err) {
    console.error("Error fetching shoe:", err);
    res.status(500).json({ message: 'Error fetching shoe' });
  }
};

// Search shoes by name (case-insensitive) with pagination
exports.searchShoes = async (req, res) => {
  try {
    const searchQuery = req.query.search;
    if (!searchQuery) {
      return res.status(400).json({ message: 'Missing search query' });
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const shoes = await Shoe.find({
      $text: { $search: searchQuery }
    })
      .populate('brand', 'name')
      .populate('category', 'name')
      .populate('colors', 'name')
      .skip(skip)
      .limit(limit);

    // Calculate total number of matching shoes
    const totalShoes = await Shoe.countDocuments({
      $text: { $search: searchQuery }
    });

    res.json({
      shoes,
      currentPage: page,
      totalPages: Math.ceil(totalShoes / limit),
      totalShoes
    });
  } catch (err) {
    console.error("Error searching shoes:", err);
    res.status(500).json({ message: 'Error searching shoes' });
  }
};

// Filter shoes based on multiple criteria with pagination
exports.filterShoes = async (req, res) => {
  try {
    // Destructure query parameters (all optional)
    const { search, minPrice, maxPrice, size, color, category, rating, sortBy, sortOrder } = req.query;

    // Build query object dynamically
    let query = {};

    if (search) {
      query.$text = { $search: search };
    }

    if (minPrice && maxPrice) {
      query.price = { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) };
    } else if (minPrice) {
      query.price = { $gte: parseFloat(minPrice) };
    } else if (maxPrice) {
      query.price = { $lte: parseFloat(maxPrice) };
    }

    if (size) {
      query['sizes.size'] = size;
    }

    if (color) {
      query.colors = { $in: [color] };
    }

    if (category) {
      query.category = category;
    }

    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Sorting
    const sort = sortBy ? { [sortBy]: sortOrder === 'desc' ? -1 : 1 } : { createdAt: -1 };

    // Execute query with population, pagination, and sorting
    const shoes = await Shoe.find(query)
      .populate('brand', 'name')
      .populate('category', 'name')
      .populate('colors', 'name')
      .skip(skip)
      .limit(limit)
      .sort(sort);

    // Calculate total number of matching shoes
    const totalShoes = await Shoe.countDocuments(query);

    res.json({
      shoes,
      currentPage: page,
      totalPages: Math.ceil(totalShoes / limit),
      totalShoes
    });
  } catch (err) {
    console.error("Error filtering shoes:", err);
    res.status(500).json({ message: 'Error filtering shoes' });
  }
};