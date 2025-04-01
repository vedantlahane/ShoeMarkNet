const Shoe = require('../models/Shoe');
const { updateLeadScore } = require('./leadScoreController');

// Create a new shoe product (Admin)
const createProduct = async (req, res) => {
  try {
    const shoe = new Shoe(req.body);
    await shoe.save();
    res.status(201).json({ message: 'Product created successfully', shoe });
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error });
  }
};

// Get all products with optional filters
const getAllProducts = async (req, res) => {
  try {
    const { category, brand, search } = req.query;
    const filters = {};
    if (category) filters.category = category;
    if (brand) filters.brand = brand;
    if (search) filters.name = new RegExp(search, 'i');
    const products = await Shoe.find(filters);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
};

// Get a single product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Shoe.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    updateLeadScore(req.user.id, 'view_product');
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error });
  }
};

// Update a shoe product (Admin)
const updateProduct = async (req, res) => {
  try {
    const product = await Shoe.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error });
  }
};

// Delete a shoe product (Admin)
const deleteProduct = async (req, res) => {
  try {
    const product = await Shoe.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error });
  }
};

// Add product to cart (user must be authenticated)
const addToCart = async (req, res) => {
  try {
    const { shoeId, color, size, quantity } = req.body;
    // Logic to add to user's cart
    // ...
    updateLeadScore(req.user.id, 'add_to_cart');
    res.status(200).json({ message: 'Product added to cart' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding to cart', error });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addToCart,
};
