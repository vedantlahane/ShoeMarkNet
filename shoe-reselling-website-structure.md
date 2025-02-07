ShoeMarkNet/
├── backend/
│   ├── app.js                 // Main Express server configuration
│   ├── .env                   // Environment variables (MONGO_URI, NODE_ENV, etc.)
│   ├── config/
│   │   └── db.js              // Database connection setup (MongoDB)
│   ├── data/
│   │   └── data.js            // Node-friendly data file for seeding (plain strings for assets)
│   ├── models/
│   │   └── data.js            // Mongoose model for your seeded data
│   ├── routes/
│   │   ├── dataRoutes.js      // API routes for serving data
│   │   └── userRoutes.js      // API routes for user operations
│   ├── public/                // Static assets served by Express (CSS, images, etc.)
│   │   └── assets/
│   │       ├── hero.png
│   │       ├── sneaker.png
│   │       └── ...            // Other image/video/CSS files
│   └── seed.js                // Script for seeding MongoDB with data from backend/data/data.js
│
└── frontend/
    ├── package.json           // Frontend project dependencies and scripts
    ├── public/                // Public folder for static files (if not serving via backend)
    │   └── assets/            // (optional) assets for development - or they may be on backend public folder
    ├── src/
    │   ├── App.jsx            // Main React component which consumes backend API data
    │   ├── App.css            // Global CSS file for styling the app
    │   ├── app/
    │   │   └── CartSlice.jsx  // Redux slice for cart-related actions
    │   ├── components/        // React components folder
    │   │   ├── Footer.jsx     // Footer component which receives footerAPI data from backend
    │   │   ├── Navbar.jsx     // Navigation component
    │   │   ├── Cart.jsx       // Cart component
    │   │   ├── Sales.jsx      // Sales components, etc.
    │   │   ├── Explore.jsx    
    │   │   ├── Story.jsx      
    │   │   └── cart/
    │   │       └── CartItem.jsx   // Cart item component handling image display and cart actions
    │   └── data/
    │       └── data.jsx       // Frontend static data file importing assets with ES module syntax
    └── ...                    // Other configuration files and folders (e.g., .env, README.md)