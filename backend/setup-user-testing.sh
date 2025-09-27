#!/bin/bash

echo "🚀 Setting up User Endpoints Testing Environment"
echo "=============================================="

echo ""
echo "📦 Installing required dependencies..."
cd /home/vedant/Desktop/ShoeMarkNet/backend

# Install axios for testing
npm install axios --save-dev

echo ""
echo "🗃️  Seeding default user and admin accounts..."
npm run seed:accounts

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "🔧 Available Commands:"
echo "  - Test endpoints: node scripts/testUserEndpoints.js"
echo "  - Start server: npm start"
echo "  - Start dev server: npm run dev"
echo ""
echo "📝 Test Credentials:"
echo "  Regular User: user@shoemarknet.test / User@123!"
echo "  Admin User: admin@shoemarknet.test / Admin@123!"
echo ""
echo "📋 Postman Collection: scripts/postman-collection.json"
