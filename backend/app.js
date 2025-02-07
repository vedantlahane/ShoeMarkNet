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
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Origin', 'X-Requested-With', 'Accept', 'Authorization'],
  exposedHeaders: ['Access-Control-Allow-Origin']
}));

// Pre-flight requests
app.options('*', cors());

// Middleware
app.use(express.json());

// Serve static assets from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
dbConfig();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/data', dataRoutes); // Mount data route

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});