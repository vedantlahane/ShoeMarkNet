const jwt = require('jsonwebtoken');

// Function to generate a JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId }, // Payload can include user ID and roles if needed
    process.env.JWT_SECRET, // Secret from environment variables
    { expiresIn: '30d' } // Token expiration time
  );
};

module.exports = generateToken;
