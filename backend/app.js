const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
const path = require("path");

// Import your routes
const userRoutes = require('./routes/userRoutes');
const apiRoutes = require('./routes/api'); // Updated to import api.js

// Import your database configuration
const dbConfig = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
  origin: [
    'https://shoe-mark-net.vercel.app',
    'https://shoe-mark-net-git-main-vedantlahanes-projects.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
  credentials: false
}));

// Pre-flight requests
app.options('*', cors());

// Middleware to parse JSON requests
app.use(express.json());

// Serve static assets from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// Connect to MongoDB using your configuration
dbConfig();

// Mount routes
// app.use('/api/users', userRoutes);
app.use('/api/data', apiRoutes); // Data endpoints from api.js

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
