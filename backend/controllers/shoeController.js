const Shoe = require('../models/shoe');

exports.getAllShoes = async (req, res) => {
  try {
    const shoes = await Shoe.find();
    res.json(shoes);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching shoes' });
  }
};

exports.getShoeById = async (req, res) => {
  try {
    const shoe = await Shoe.findById(req.params.id);
    if (!shoe) {
      res.status(404).json({ message: 'Shoe not found' });
    } else {
      res.json(shoe);
    }
  } catch (err) {
    res.status(500).json({ message: 'Error fetching shoe' });
  }
};

exports.searchShoes = async (req, res) => {
  try {
    const searchQuery = req.query.search;
    const shoes = await Shoe.find({ name: { $regex: searchQuery, $options: 'i' } });
    res.json(shoes);
  } catch (err) {
    res.status(500).json({ message: 'Error searching shoes' });
  }
};

exports.filterShoes = async (req, res) => {
  try {
    const { search, minPrice, maxPrice, size, color, category, rating } = req.query;

    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
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

    const shoes = await Shoe.find(query);

    res.json(shoes);
  } catch (err) {
    console.error('Error filtering shoes:', err);
    res.status(500).json({ message: 'Error filtering shoes' });
  }
};