const express = require('express');
const router = express.Router();

// Import Mongoose models
const Homeapi = require('../models/homeapi');
const Popularsales = require('../models/popularsales');
const Highlight = require('../models/highlight');
const Sneaker = require('../models/sneaker');
const Topratesales = require('../models/topratesales');
const Story = require('../models/story');
const FooterAPI = require('../models/footerAPI');
const User = require('../models/user');
const Shoe = require('../models/Shoe');

// Import authentication controller functions
const { register, login } = require('../controllers/authController');

// Import controllers for user-product interactions
const { recordProductVisit, recordAddToCart } = require('../controllers/userInteractionController');

// Import controllers for shoe-related operations
const { getAllShoes, getShoeById, searchShoes, filterShoes } = require('../controllers/shoeController');

// Import token verification middleware
const verifyToken = require('../middleware/verifyToken');

// -----------------------------
// API Data Endpoints
// -----------------------------

// GET Homeapi data
router.get('/homeapi', async (req, res) => {
  try {
    const data = await Homeapi.findOne();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET Popularsales data
router.get('/popularsales', async (req, res) => {
  try {
    const data = await Popularsales.findOne();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET Highlight data
router.get('/highlight', async (req, res) => {
  try {
    const data = await Highlight.findOne();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET Sneaker data
router.get('/sneaker', async (req, res) => {
  try {
    const data = await Sneaker.findOne();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET Top Rated Sales data
router.get('/topratesales', async (req, res) => {
  try {
    const data = await Topratesales.findOne();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET Story data
router.get('/story', async (req, res) => {
  try {
    const data = await Story.findOne();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET FooterAPI data
router.get('/footerapi', async (req, res) => {
  try {
    const data = await FooterAPI.findOne();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all Users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// -----------------------------
// Shoe-related Endpoints
// -----------------------------

// GET all shoes
router.get('/shoes', getAllShoes);

// GET a single shoe by ID
router.get('/shoes/:id', getShoeById);

// GET shoes by search query
router.get('/shoes/search', searchShoes);

// GET shoes by filter criteria
router.get('/shoes/filter', filterShoes);

// GET top-rated sales based on lead scores
router.get('/topratesales/lead', async (req, res) => {
  try {
    const topRatedShoes = await Shoe.find()
      .sort({ rating: -1 }) // Sort by rating in descending order
      .limit(5); // Limit to top 5 shoes

    res.json(topRatedShoes);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching top-rated sales' });
  }
});

// GET popular sales based on lead scores
router.get('/popularsales/lead', async (req, res) => {
  try {
    // Assuming you have a field to track popularity, e.g., 'views' or 'addToCartCount'
    const popularShoes = await Shoe.find()
      .sort({ views: -1 }) // Sort by views in descending order
      .limit(5); // Limit to top 5 shoes

    res.json(popularShoes);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching popular sales' });
  }
});

// -----------------------------
// Authentication Endpoints
// -----------------------------

// User Registration
// POST /api/auth/register
router.post('/auth/register', register);

// User Login
// POST /api/auth/login
router.post('/auth/login', login);

// -----------------------------
// User Interaction / Score Endpoints
// -----------------------------

// Record a product visit to update the score for a specific product and overall lead score
// POST /api/auth/score/productVisit
router.post('/auth/score/productVisit', verifyToken, recordProductVisit);

// Record an add-to-cart event (usually a stronger indicator for purchase intent)
// POST /api/auth/score/addToCart
router.post('/auth/score/addToCart', verifyToken, recordAddToCart);

module.exports = router;