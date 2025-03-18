
const Shoe = require('../models/shoe');

// Get all shoes with optional pagination
exports.getAllShoes = async (req, res) => {
try {
// Optional: Add pagination if you expect many shoes.
// Defaults: page = 1, limit = 10 (can be adjusted via query parameters)
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const skip = (page - 1) * limit;

const shoes = await Shoe.find().skip(skip).limit(limit);

res.json(shoes);

} catch (err) {
console.error("Error fetching shoes:", err);
res.status(500).json({ message: 'Error fetching shoes' });
}
};

// Get a single shoe by ID
exports.getShoeById = async (req, res) => {
try {
const shoe = await Shoe.findById(req.params.id);
if (!shoe) {
return res.status(404).json({ message: 'Shoe not found' });
}
res.json(shoe);
} catch (err) {
console.error("Error fetching shoe:", err);
res.status(500).json({ message: 'Error fetching shoe' });
}
};

// Search shoes by name (case-insensitive)
exports.searchShoes = async (req, res) => {
try {
const searchQuery = req.query.search;
if (!searchQuery) {
return res.status(400).json({ message: 'Missing search query' });
}
const shoes = await Shoe.find({
name: { regex:searchQuery,regex:searchQuery,options: 'i' }
});
res.json(shoes);
} catch (err) {
console.error("Error searching shoes:", err);
res.status(500).json({ message: 'Error searching shoes' });
}
};

// Filter shoes based on multiple criteria
exports.filterShoes = async (req, res) => {
try {
// Destructure query parameters (all optional)
const { search, minPrice, maxPrice, size, color, category, rating } = req.query;

// Build query object dynamically

let query = {};


if (search) {

  query.name = { $regex: search, $options: 'i' };

}


if (minPrice && maxPrice) {

  query.price = {

    $gte: parseFloat(minPrice),

    $lte: parseFloat(maxPrice)

  };

} else if (minPrice) {

  query.price = { $gte: parseFloat(minPrice) };

} else if (maxPrice) {

  query.price = { $lte: parseFloat(maxPrice) };

}


if (size) {

  // Assumes that shoe sizes are stored inside an array of objects under 'sizes'

  query['sizes.size'] = size;

}


if (color) {

  // Matches if any one of the colors field contains the given value

  query.colors = { $in: [color] };

}


if (category) {

  query.category = category;

}


if (rating) {

  // Ensure rating is a number. This finds shoes with rating greater than or equal to the given value.

  query.rating = { $gte: parseFloat(rating) };

}


const shoes = await Shoe.find(query);

res.json(shoes);

} catch (err) {
console.error("Error filtering shoes:", err);
res.status(500).json({ message: 'Error filtering shoes' });
}
};