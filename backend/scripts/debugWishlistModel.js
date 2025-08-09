const mongoose = require('mongoose');
const Order = require('../models/Order');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product'); // Add Product model
require('dotenv').config();

async function debugModels() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Test direct model queries
    console.log('\n🔍 Testing Order model...');
    try {
      const orders = await Order.find({}).limit(1);
      console.log('✅ Order query successful, found:', orders.length);
      if (orders.length > 0) {
        console.log('Sample order structure:', Object.keys(orders[0].toObject()));
      }
    } catch (error) {
      console.log('❌ Order error:', error.message);
    }

    console.log('\n🔍 Testing Wishlist model...');
    try {
      const wishlists = await Wishlist.find({}).limit(1);
      console.log('✅ Wishlist query successful, found:', wishlists.length);
      if (wishlists.length > 0) {
        console.log('Sample wishlist structure:', Object.keys(wishlists[0].toObject()));
      }
    } catch (error) {
      console.log('❌ Wishlist error:', error.message);
    }

    // Test populated queries
    console.log('\n🔍 Testing Order with population...');
    try {
      const orders = await Order.find({}).populate('items.product', 'name price').limit(1);
      console.log('✅ Order population successful');
    } catch (error) {
      console.log('❌ Order population error:', error.message);
    }

    console.log('\n🔍 Testing Wishlist with population...');
    try {
      const wishlists = await Wishlist.find({}).populate('products', 'name price').limit(1);
      console.log('✅ Wishlist population successful');
    } catch (error) {
      console.log('❌ Wishlist population error:', error.message);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Connection error:', error.message);
  }
}

debugModels();
