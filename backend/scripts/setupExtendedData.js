const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const Order = require('../models/Order');
const SearchHistory = require('../models/SearchHistory');
const Address = require('../models/Address');
const { testReviews, testCartItems, testWishlistItems, testOrders, testSearchHistory } = require('../data/extendedTestData');
require('dotenv').config();

async function setupExtendedTestData() {
  try {
    // Connect to MongoDB Atlas
    const mongoURI = process.env.MONGODB_URI;
    await mongoose.connect(mongoURI);
    console.log('🔗 Connected to MongoDB Atlas (shoemark database)');

    // Get existing users and products for relationships
    const users = await User.find({}).lean();
    const products = await Product.find({}).lean();
    
    if (users.length === 0 || products.length === 0) {
      console.log('❌ No users or products found. Please run user and product setup first.');
      process.exit(1);
    }

    console.log(`📊 Found ${users.length} users and ${products.length} products`);

    // Clear existing extended data
    await Review.deleteMany({});
    await Cart.deleteMany({});
    await Wishlist.deleteMany({});
    await Order.deleteMany({});
    await SearchHistory.deleteMany({});
    console.log('🗑️  Cleared existing extended data');

    // 1. Create Reviews
    console.log('\n⭐ CREATING REVIEWS');
    console.log('='.repeat(40));
    
    for (let i = 0; i < testReviews.length && i < products.length; i++) {
      const reviewData = testReviews[i];
      const userIndex = i % users.length;
      
      const review = new Review({
        ...reviewData,
        user: users[userIndex]._id,
        product: products[i]._id,
        createdAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000) // Stagger dates
      });
      
      await review.save();
      console.log(`✅ Created review for ${products[i].name} by ${users[userIndex].name} (${reviewData.rating}⭐)`);
    }

    // 2. Create Cart Items
    console.log('\n🛒 CREATING CART ITEMS');
    console.log('='.repeat(40));
    
    for (let i = 0; i < Math.min(3, users.length); i++) {
      const cart = new Cart({
        user: users[i]._id,
        items: []
      });

      // Add 1-3 items to each cart
      const itemCount = Math.min(testCartItems.length, 3);
      for (let j = 0; j < itemCount; j++) {
        const productIndex = (i + j) % products.length;
        cart.items.push({
          product: products[productIndex]._id,
          ...testCartItems[j]
        });
      }

      await cart.save();
      console.log(`✅ Created cart for ${users[i].name} with ${cart.items.length} items`);
    }

    // 3. Create Wishlist Items
    console.log('\n❤️  CREATING WISHLIST ITEMS');
    console.log('='.repeat(40));
    
    for (let i = 0; i < Math.min(4, users.length); i++) {
      // For Wishlist, we just need an array of product IDs
      const productIds = [];
      const itemCount = Math.min(3, products.length);
      
      for (let j = 0; j < itemCount; j++) {
        const productIndex = (i * 2 + j) % products.length;
        productIds.push(products[productIndex]._id);
      }

      const wishlist = new Wishlist({
        user: users[i]._id,
        products: productIds
      });

      await wishlist.save();
      console.log(`✅ Created wishlist for ${users[i].name} with ${wishlist.products.length} items`);
    }

    // 4. Create Orders
    console.log('\n📦 CREATING ORDERS');
    console.log('='.repeat(40));
    
    for (let i = 0; i < testOrders.length && i < users.length; i++) {
      const orderData = testOrders[i];
      const productIndex = i % products.length;
      
      const order = new Order({
        ...orderData,
        user: users[i]._id,
        items: [{
          product: products[productIndex]._id,
          ...orderData.items[0]
        }]
      });

      await order.save();
      console.log(`✅ Created order ${orderData.orderNumber} for ${users[i].name} - Status: ${orderData.status}`);
    }

    // 5. Create Search History
    console.log('\n🔍 CREATING SEARCH HISTORY');
    console.log('='.repeat(40));
    
    for (let i = 0; i < testSearchHistory.length && i < users.length; i++) {
      const searchData = testSearchHistory[i];
      
      const searchHistory = new SearchHistory({
        ...searchData,
        user: users[i]._id
      });

      await searchHistory.save();
      console.log(`✅ Created search history for ${users[i].name}: "${searchData.query}"`);
    }

    // 6. Create some Addresses for users who don't have them
    console.log('\n🏠 CREATING ADDITIONAL ADDRESSES');
    console.log('='.repeat(40));

    const existingAddresses = await Address.find({}).lean();
    const usersWithAddresses = existingAddresses.map(addr => addr.user.toString());
    
    const usersWithoutAddresses = users.filter(user => 
      !usersWithAddresses.includes(user._id.toString())
    );

    const sampleAddresses = [
      {
        fullName: "Vedant Lahane",
        phone: "+91 9876543210",
        addressLine1: "123 Sample Street",
        addressLine2: "Near Sample Mall",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
        country: "India",
        addressType: "both",
        isDefault: true
      },
      {
        fullName: "John Doe",
        phone: "+91 9876543210",
        addressLine1: "456 Office Complex",
        addressLine2: "Business District",
        city: "Pune",
        state: "Maharashtra", 
        postalCode: "411001",
        country: "India",
        addressType: "shipping",
        isDefault: false
      }
    ];

    for (let i = 0; i < usersWithoutAddresses.length; i++) {
      const user = usersWithoutAddresses[i];
      const addressData = sampleAddresses[i % sampleAddresses.length];
      
      const address = new Address({
        ...addressData,
        fullName: user.name,
        user: user._id
      });

      await address.save();
      console.log(`✅ Created address for ${user.name}: ${addressData.city}, ${addressData.state}`);
    }

    // Final Summary
    const reviewCount = await Review.countDocuments();
    const cartCount = await Cart.countDocuments();
    const wishlistCount = await Wishlist.countDocuments();
    const orderCount = await Order.countDocuments();
    const searchCount = await SearchHistory.countDocuments();
    const addressCount = await Address.countDocuments();

    console.log('\n🎉 EXTENDED DATA SETUP SUMMARY');
    console.log('='.repeat(50));
    console.log(`📍 Database: MongoDB Atlas (shoemark)`);
    console.log(`👥 Users: ${users.length}`);
    console.log(`👟 Products: ${products.length}`);
    console.log(`⭐ Reviews: ${reviewCount}`);
    console.log(`🛒 Carts: ${cartCount}`);
    console.log(`❤️  Wishlists: ${wishlistCount}`);
    console.log(`📦 Orders: ${orderCount}`);
    console.log(`🔍 Search History: ${searchCount}`);
    console.log(`🏠 Addresses: ${addressCount}`);
    console.log(`🚀 All extended test data created successfully!`);

    await mongoose.disconnect();
    console.log('\n🔐 Disconnected from MongoDB Atlas');

  } catch (error) {
    console.error('❌ Error setting up extended test data:', error);
    if (error.errors) {
      Object.keys(error.errors).forEach(key => {
        console.error(`  ${key}: ${error.errors[key].message}`);
      });
    }
    process.exit(1);
  }
}

setupExtendedTestData();
