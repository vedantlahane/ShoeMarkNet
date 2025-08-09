#!/bin/bash

echo "🚀 Setting up User Endpoints Testing Environment"
echo "=============================================="

echo ""
echo "📦 Installing required dependencies..."
cd /home/vedant/Desktop/ShoeMarkNet/backend

# Install axios for testing
npm install axios --save-dev

echo ""
echo "🗃️  Setting up test data in database..."
node scripts/setupTestData.js

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "🔧 Available Commands:"
echo "  - Test endpoints: node scripts/testUserEndpoints.js"
echo "  - Start server: npm start"
echo "  - Start dev server: npm run dev"
echo ""
echo "📝 Test Credentials:"
echo "  Regular User: vedant@example.com / password123"
echo "  Admin User: admin@shoemarnet.com / adminpass123"
echo ""
echo "📋 Postman Collection: scripts/postman-collection.json"
