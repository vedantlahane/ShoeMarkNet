const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { updateLeadScore } = require('./leadScoreController'); // Lead Score Logic

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // 7 days expiration
  );
};

// Register User
const register = async (req, res) => {
  try {
    const { name, email, phone, password, source } = req.body;

    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // Create new user
    user = new User({ name, email, phone, password, source });
    await user.save();

    // Update lead score based on the source
    updateLeadScore(user._id, 'register');

    res.status(201).json({ message: 'User registered successfully', token: generateToken(user) });

  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error });
  }
};

// Login User
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Validate password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Update lead score for login activity
    updateLeadScore(user._id, 'login');

    res.status(200).json({ token: generateToken(user), user });

  } catch (error) {
    res.status(500).json({ message: 'Login failed', error });
  }
};

// Get User Profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // Exclude password
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);

  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error });
  }
};

module.exports = { register, login, getProfile };
