const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * @description Middleware to protect routes by authenticating users with a JWT.
 * It checks for a token in the 'Authorization' header or cookies,
 * verifies it, and attaches the user object to the request for subsequent handlers.
 * It also checks for account status (active/banned).
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 */
const protect = async (req, res, next) => {
  try {
    let token;
    // Get the Authorization header from the request
    const authHeader = req.header('Authorization');

    // 1. Check if the token is in the Authorization header
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      // Extract the token string from "Bearer <token>"
      token = authHeader.split(' ')[1];
    }
    // 2. Alternatively, check if the token is in the cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // If no token is found in either location, deny access
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Ensure the JWT secret is configured
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not set in environment variables');
    }

    // Verify the token's signature and expiration.
    // Throws an error if the token is invalid or expired.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by the ID from the decoded token's payload.
    // The .select('-password') prevents the password hash from being returned.
    const user = await User.findById(decoded.id).select('-password');

    // If no user is found with the token's ID, the token is invalid
    if (!user) {
      return res.status(401).json({ message: 'Token is invalid or user does not exist' });
    }

    // Check if the user's account is active and not banned
    if (user.status === 'inactive' || user.status === 'banned' || user.isActive === false) {
      return res.status(403).json({ message: 'User account is deactivated or banned' });
    }

    // Attach the found user object to the request, so it's available
    // to all subsequent middleware and route handlers.
    req.user = user;
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    // Handle any other unexpected errors
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @description Middleware to restrict access to admin users only.
 * This middleware should be placed after the 'protect' middleware.
 * @param {object} req - The Express request object, which must have a user object attached from the 'protect' middleware.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 */
const admin = (req, res, next) => {
  // Check if a user exists on the request object and if their role is 'admin'
  if (req.user && req.user.role === 'admin') {
    // If the user is an admin, proceed to the next handler
    next();
  } else {
    // If not, send a 403 Forbidden error
    res.status(403).json({ message: 'Admin privileges required' });
  }
};

module.exports = { protect, admin };
