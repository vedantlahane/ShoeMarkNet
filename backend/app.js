const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const dataRoutes = require('./routes/dataRoutes'); // Import data routes
const dbConfig = require('./config/db');
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Updated CORS configuration with all necessary headers
app.use(cors({
  origin: [
    'https://shoe-mark-net.vercel.app',
    'https://shoe-mark-net-git-main-vedantlahanes-projects.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
  credentials: false // Changed to false to avoid CORS preflight
}));

// Pre-flight requests
app.options('*', cors());

// Middleware
app.use(express.json());

// Serve static assets from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Ensure static files are served correctly
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// Database connection
dbConfig();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/data', dataRoutes); // Mount data route

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});