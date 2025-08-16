// Simple test to check for import errors
import React from 'react';
import { createRoot } from 'react-dom/client';

// Test main app import
try {
  const App = require('./src/App.jsx');
  console.log('✅ App.jsx imports successfully');
} catch (error) {
  console.error('❌ Error importing App.jsx:', error.message);
}

// Test main components
try {
  const MainLayout = require('./src/components/layouts/MainLayout.jsx');
  console.log('✅ MainLayout imports successfully');
} catch (error) {
  console.error('❌ Error importing MainLayout:', error.message);
}

// Test Redux store
try {
  const store = require('./src/redux/store.js');
  console.log('✅ Redux store imports successfully');
} catch (error) {
  console.error('❌ Error importing Redux store:', error.message);
}

console.log('Test completed');