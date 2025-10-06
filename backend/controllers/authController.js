/**
 * Authentication Controller
 * Handles user registration, login, profile management, password reset, email verification, and token refresh.
 */

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { updateLeadScore } = require('./leadScoreController');
const crypto = require('crypto'); 
const sendEmail = require('../utils/sendEmail');

/**
 * Generates a JWT access token for the user.
 * @param {Object} user - User object from database
 * @returns {string} JWT token
 */
const generateToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

/** Generate Refresh Token */
const generateRefreshToken = (user) =>
  jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

/**
 * Builds a sanitized user response object for authentication endpoints.
 * Excludes sensitive fields like password.
 * @param {Object} user - User document from database
 * @returns {Object} Sanitized user object
 */
const buildAuthUserResponse = (user) => ({
  id: user._id,
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isEmailVerified: user.isEmailVerified,
  isActive: user.isActive,
  profilePic: user.profilePic || null,
  preferences: user.preferences ? { ...user.preferences } : { newsletter: false, marketing: false },
  lastLogin: user.lastLogin || null,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

/**
 * Registers a new user account.
 * Validates input, checks for existing user, creates user, generates tokens, and updates lead score.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const register = async (req, res) => {
  try {
    const { name, email, phone, password, source } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email, and password are required' });

    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone,
      password,
      source: source || 'direct'
    });
    await user.save();

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Update lead score for registration activity
    try { await updateLeadScore(user._id, 'register'); } catch (e) {}

    // Set refresh token in cookie (production)
    if (process.env.NODE_ENV === 'production') {
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000
      });
    }

    const responseUser = buildAuthUserResponse(user);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      refreshToken: process.env.NODE_ENV !== 'production' ? refreshToken : undefined,
      user: responseUser
    });
  } catch (error) {
    if (error.code === 11000)
      return res.status(400).json({ message: 'Email already in use' });
    res.status(500).json({ message: 'Registration failed', error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message });
  }
};

/**
 * Authenticates a user with email and password.
 * Generates tokens and updates last login time.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    if (!user.isActive)
      return res.status(403).json({ message: 'Account is inactive' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    user.lastLogin = Date.now();
    await user.save();

    const responseUser = buildAuthUserResponse(user);

    // Update lead score for login activity
    try { await updateLeadScore(user._id, 'login'); } catch (e) {}

    if (process.env.NODE_ENV === 'production') {
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000
      });
    }

    res.status(200).json({
      token,
      refreshToken: process.env.NODE_ENV !== 'production' ? refreshToken : undefined,
      user: responseUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message });
  }
};

/**
 * Retrieves the authenticated user's profile.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id)
      return res.status(401).json({ message: 'Not authenticated' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const responseUser = buildAuthUserResponse(user);
    res.status(200).json(responseUser);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message });
  }
};

/**
 * Updates the authenticated user's profile.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id)
      return res.status(401).json({ message: 'Not authenticated' });

    const { name, phone, address } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update allowed fields
    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (address) user.address = address;

    await user.save();

    // Return updated user without sensitive data
    const updatedUser = await User.findById(req.user.id);
    const responseUser = buildAuthUserResponse(updatedUser);
    
    res.status(200).json({
      message: 'Profile updated successfully',
      user: responseUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message });
  }
};

/**
 * Initiates password reset by sending an email with reset link.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(200).json({ message: 'If your email is registered, you will receive reset instructions' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || req.protocol + '://' + req.get('host')}/reset-password/${resetToken}`;
    const message = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Please click the link below to reset your password:</p>
      <a href="${resetUrl}" target="_blank">Reset Password</a>
      <p>This link will expire in 30 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        message,
        html: message
      });
      res.status(200).json({ message: 'If your email is registered, you will receive reset instructions' });
    } catch (emailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      throw new Error('Email could not be sent');
    }
  } catch (error) {
    res.status(500).json({ message: 'Error processing password reset', error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message });
  }
};

/**
 * Resets the user's password using a reset token.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!token || !password)
      return res.status(400).json({ message: 'Token and password are required' });
    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });

    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    if (!user)
      return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const newToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    if (process.env.NODE_ENV === 'production') {
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000
      });
    }

    res.status(200).json({
      message: 'Password reset successful',
      token: newToken,
      refreshToken: process.env.NODE_ENV !== 'production' ? refreshToken : undefined
    });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message });
  }
};

/**
 * Verifies the user's email using a verification token.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token)
      return res.status(400).json({ message: 'Verification token is required' });

    const user = await User.findOne({ emailVerificationToken: token });
    if (!user)
      return res.status(400).json({ message: 'Invalid verification token' });

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    if (process.env.FRONTEND_URL)
      return res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying email', error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message });
  }
};

/**
 * Refreshes the access token using a refresh token.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const refreshToken = async (req, res) => {
  try {
    const token = req.body.refreshToken || req.cookies.refreshToken;
    if (!token)
      return res.status(400).json({ message: 'Refresh token is required' });

    const decoded = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET
    );
    const user = await User.findById(decoded.id).select('-password');
    if (!user)
      return res.status(404).json({ message: 'User not found' });
    if (user.status === 'inactive' || user.status === 'banned')
      return res.status(403).json({ message: 'Account is inactive or banned' });

    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    if (process.env.NODE_ENV === 'production') {
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000
      });
    }

    res.status(200).json({
      token: newToken,
      refreshToken: process.env.NODE_ENV !== 'production' ? newRefreshToken : undefined
    });
  } catch (error) {
    res.clearCookie('refreshToken');
    res.status(401).json({ message: 'Invalid or expired refresh token', error: process.env.NODE_ENV === 'production' ? 'Authentication error' : error.message });
  }
};

/**
 * Logs out the user by clearing the refresh token cookie.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const logout = async (req, res) => {
  try {
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error during logout' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  verifyEmail,
  refreshToken,
  logout
};
