// app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
const path = require("path");

const apiRoutes = require('./routes/api'); // Combined API endpoints (data and auth)
const shoeRoutes = require('./routes/shoe'); // Shoe-related endpoints
const adminRoutes = require('./routes/admin/adminRoutes'); // Admin endpoints

// Import your database configuration
const dbConfig = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration (adjust as needed)
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
// Remove the following line since we are not using a separate auth file:
// app.use('/api/auth', userRoutes);

app.use('/api/data', apiRoutes); // Combined Data & Authentication endpoints from api.js
app.use('/api/shoes', shoeRoutes); // Shoe endpoints from shoe.js
app.use('/api/admin', adminRoutes); // Admin endpoints

// Start the server
app.listen(PORT, () => {
console.log(`Server is running on port ${PORT}`);
});