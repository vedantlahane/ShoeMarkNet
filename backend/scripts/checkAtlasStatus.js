const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const Address = require('../models/Address');
require('dotenv').config();

async function checkAtlasDatabase() {
  try {
    // Connect to MongoDB Atlas
    const mongoURI = process.env.MONGODB_URI;
    await mongoose.connect(mongoURI);
    console.log('🔗 Connected to MongoDB Atlas');
    console.log('🌐 Database URL:', mongoURI.substring(0, 50) + '...');

    // Check Products
    console.log('\n👟 PRODUCTS DATA');
    console.log('='.repeat(40));
    const products = await Product.find({}, 'name brand price isFeatured isNewArrival').lean();
    console.log(`Total products: ${products.length}`);
    
    const brandStats = products.reduce((acc, product) => {
      acc[product.brand] = (acc[product.brand] || 0) + 1;
      return acc;
    }, {});
    
    console.log('Products by brand:');
    Object.entries(brandStats).forEach(([brand, count]) => {
      console.log(`  ${brand}: ${count} products`);
    });
    
    const featuredCount = products.filter(p => p.isFeatured).length;
    const newArrivalsCount = products.filter(p => p.isNewArrival).length;
    console.log(`Featured products: ${featuredCount}`);
    console.log(`New arrivals: ${newArrivalsCount}`);

    // Check Categories
    console.log('\n📂 CATEGORIES DATA');
    console.log('='.repeat(40));
    const categories = await Category.find({}, 'name slug isActive').lean();
    console.log(`Total categories: ${categories.length}`);
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.slug}) - Active: ${cat.isActive}`);
    });

    // Check Users
    console.log('\n👥 USERS DATA');
    console.log('='.repeat(40));
    const users = await User.find({}, 'name email role emailVerified').lean();
    console.log(`Total users: ${users.length}`);
    
    const roleStats = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    
    console.log('Users by role:');
    Object.entries(roleStats).forEach(([role, count]) => {
      console.log(`  ${role}: ${count} users`);
    });

    console.log('\nUser list:');
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.role}`);
    });

    // Check Addresses
    console.log('\n🏠 ADDRESSES DATA');
    console.log('='.repeat(40));
    const addresses = await Address.countDocuments();
    console.log(`Total addresses: ${addresses}`);

    console.log('\n✅ DATABASE STATUS SUMMARY');
    console.log('='.repeat(50));
    console.log(`📍 Database: MongoDB Atlas (Cloud)`);
    console.log(`👟 Products: ${products.length} items`);
    console.log(`📂 Categories: ${categories.length} categories`);
    console.log(`👥 Users: ${users.length} users`);
    console.log(`🏠 Addresses: ${addresses} addresses`);
    console.log(`🚀 API Status: Ready for testing`);

    await mongoose.disconnect();
    console.log('\n🔐 Disconnected from MongoDB Atlas');

  } catch (error) {
    console.error('❌ Error checking database:', error.message);
    process.exit(1);
  }
}

checkAtlasDatabase();
