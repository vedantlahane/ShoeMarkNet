const User = require('../models/User');

const adminMiddleware = async (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden, admin access required' });
  }
  next(); // Proceed if the user is an admin
};

module.exports = adminMiddleware;
