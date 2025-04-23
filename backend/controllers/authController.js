const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { updateLeadScore } = require('./leadScoreController');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

/**
 * Generate JWT Token with user information
 * @param {Object} user - User object
 * @returns {String} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // 7 days expiration
  );
};

/**
 * Generate Refresh Token with longer expiration
 * @param {Object} user - User object
 * @returns {String} Refresh token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
    { expiresIn: '30d' } // 30 days expiration
  );
};

/**
 * Register a new user
 * @route POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { name, email, phone, password, source } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if the user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // Create new user with sanitized data
    user = new User({ 
      name: name.trim(), 
      email: email.toLowerCase().trim(), 
      phone, 
      password, 
      source: source || 'direct' 
    });
    
    await user.save();

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Try to update lead score, but don't fail registration if it errors
    try {
      await updateLeadScore(user._id, 'register');
    } catch (leadScoreError) {
      console.error('Lead score update failed:', leadScoreError);
      // Continue with registration process
    }

    // Set refresh token in HTTP-only cookie for better security
    if (process.env.NODE_ENV === 'production') {
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
    }

    res.status(201).json({ 
      message: 'User registered successfully', 
      token,
      refreshToken: process.env.NODE_ENV !== 'production' ? refreshToken : undefined,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    res.status(500).json({ 
      message: 'Registration failed', 
      error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message 
    });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Check if user is active
    if (user.status === 'inactive' || user.status === 'banned') {
      return res.status(403).json({ message: 'Account is inactive or banned' });
    }

    // Validate password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Update last login timestamp
    user.lastLogin = Date.now();
    await user.save();

    // Try to update lead score, but don't fail login if it errors
    try {
      await updateLeadScore(user._id, 'login');
    } catch (leadScoreError) {
      console.error('Lead score update failed:', leadScoreError);
      // Continue with login process
    }

    // Set refresh token in HTTP-only cookie for better security
    if (process.env.NODE_ENV === 'production') {
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
    }

    res.status(200).json({ 
      token,
      refreshToken: process.env.NODE_ENV !== 'production' ? refreshToken : undefined,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Login failed', 
      error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message 
    });
  }
};

/**
 * Get user profile
 * @route GET /api/auth/profile
 */
const getProfile = async (req, res) => {
  try {
    // req.user.id should be set by the auth middleware
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await User.findById(req.user.id).select('-password -resetPasswordToken -resetPasswordExpire');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      message: 'Error fetching profile', 
      error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message 
    });
  }
};

/**
 * Request password reset
 * @route POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Don't reveal if user exists for security reasons
    if (!user) {
      return res.status(200).json({ message: 'If your email is registered, you will receive reset instructions' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
    
    await user.save();

    // Create reset URL - use frontend URL for better UX
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
      console.error('Email sending error:', emailError);
      
      // Reset the token fields if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      
      throw new Error('Email could not be sent');
    }
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ 
      message: 'Error processing password reset', 
      error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message 
    });
  }
};

/**
 * Reset password with token
 * @route POST /api/auth/reset-password/:token
 */
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }
    
    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }
    
    // Hash the token from params
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    
    // Find user with this token and valid expiration
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    
    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();
    
    // Generate new tokens after password reset
    const newToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Set refresh token in HTTP-only cookie
    if (process.env.NODE_ENV === 'production') {
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
    }
    
    res.status(200).json({ 
      message: 'Password reset successful',
      token: newToken,
      refreshToken: process.env.NODE_ENV !== 'production' ? refreshToken : undefined
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ 
      message: 'Error resetting password', 
      error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message 
    });
  }
};

/**
 * Verify email with token
 * @route GET /api/auth/verify-email/:token
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }
    
    // Find user with this verification token
    const user = await User.findOne({ emailVerificationToken: token });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }
    
    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    
    await user.save();
    
    // Redirect to frontend after verification
    if (process.env.FRONTEND_URL) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);
    }
    
    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ 
      message: 'Error verifying email', 
      error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message 
    });
  }
};

/**
 * Refresh access token using refresh token
 * @route POST /api/auth/refresh-token
 */
const refreshToken = async (req, res) => {
  try {
    // Get token from request body or cookies
    const token = req.body.refreshToken || req.cookies.refreshToken;
    
    if (!token) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }
    
    // Verify token
    const decoded = jwt.verify(
      token, 
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET
    );
    
    // Find user
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is active
    if (user.status === 'inactive' || user.status === 'banned') {
      return res.status(403).json({ message: 'Account is inactive or banned' });
    }
    
    // Generate new tokens
    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);
    
    // Set refresh token in HTTP-only cookie
    if (process.env.NODE_ENV === 'production') {
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
    }
    
    res.status(200).json({ 
      token: newToken,
      refreshToken: process.env.NODE_ENV !== 'production' ? newRefreshToken : undefined
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    
    // Clear the invalid refresh token
    res.clearCookie('refreshToken');
    
    res.status(401).json({ 
      message: 'Invalid or expired refresh token', 
      error: process.env.NODE_ENV === 'production' ? 'Authentication error' : error.message 
    });
  }
};

/**
 * Logout user by clearing tokens
 * @route POST /api/auth/logout
 */
const logout = async (req, res) => {
  try {
    // Clear refresh token cookie
    res.clearCookie('refreshToken');
    
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Error during logout' });
  }
};

module.exports = { 
  register, 
  login, 
  getProfile, 
  forgotPassword, 
  resetPassword, 
  verifyEmail, 
  refreshToken,
  logout
};
