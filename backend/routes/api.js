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

// Import authentication controller functions
const { register, login } = require('../controllers/authController');

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
// Authentication Endpoints
// -----------------------------

// User Registration
// This endpoint registers a new user and returns the token and user info.
// POST /api/auth/register
router.post('/auth/register', register);

// User Login
// This endpoint logs in an existing user and returns the token and user info.
// POST /api/auth/login
router.post('/auth/login', login);

module.exports = router;
