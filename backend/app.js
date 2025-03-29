// Import necessary dependencies
const express = require('express'); // Import Express framework
const mongoose = require('mongoose'); // Import Mongoose for MongoDB interaction
const cors = require("cors"); // Import CORS for cross-origin requests
const path = require("path"); // Import path module for working with file paths
const morgan = require('morgan'); // Import Morgan for logging HTTP requests
const helmet = require('helmet'); // Import Helmet for securing HTTP headers
const limiter = require('./middleware/rateLimiter'); // Import custom rate limiting middleware
const compression = require('compression'); // Import compression for response optimization
require('dotenv').config({
  path: path.join(__dirname, `.env.${process.env.NODE_ENV || 'development'}`) // Load environment variables based on NODE_ENV
});

// Import route files for different functionalities
const apiRoutes = require('./routes/api'); // Combined API endpoints (data and auth)
const shoeRoutes = require('./routes/shoe'); // Shoe-related API routes
const adminRoutes = require('./routes/admin/adminRoutes'); // Admin-specific API routes

// Import database connection configuration
const dbConfig = require('./config/db');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000; // Set server port, default to 5000 if not provided

// Apply rate limiting to prevent excessive requests from a single IP

app.use(limiter); // Use the rate limiter middleware

// Enable CORS to allow requests from specified origins
app.use(cors({
  origin: [
    'https://shoe-mark-net.vercel.app',
    'https://shoe-mark-net-git-main-vedantlahanes-projects.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'], // Allowed headers
  credentials: false // Credentials not allowed (no cookies, authorization headers for cross-origin requests)
}));

// Enable CORS for pre-flight requests
app.options('*', cors());

// Security middleware for setting HTTP headers
app.use(helmet());

// Enable response compression to reduce payload size
app.use(compression());

// Enable logging for HTTP requests in 'dev' format
app.use(morgan('dev'));

// Middleware to parse JSON requests
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// Connect to MongoDB using the configuration file
dbConfig();

// Mount routes
app.use('/api/data', apiRoutes); // Handles data and authentication-related API endpoints
app.use('/api/shoes', shoeRoutes); // Handles shoe-related API endpoints
app.use('/api/admin', adminRoutes); // Handles admin-specific API endpoints

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log error details
  res.status(500).json({ message: 'Something went wrong!' }); // Respond with a generic error message
});

// If the application is running in production mode
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React frontend build folder
  app.use(express.static(path.join(__dirname, 'client/build')));

  // For any unknown route, serve the React frontend's index.html file
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
