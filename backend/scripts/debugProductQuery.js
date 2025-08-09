const mongoose = require('mongoose');
const Product = require('../models/Product');

// Simple debug script to test the exact query from the controller
async function debugProductQuery() {
  try {
    await mongoose.connect('mongodb://localhost:27017/shoemark');
    console.log('Connected to MongoDB');
    
    // Test the exact filters from getAllProducts
    const filters = { isActive: true };
    console.log('Filters:', filters);
    
    // Test the query step by step
    console.log('\n1. Testing Product.find(filters)...');
    const products1 = await Product.find(filters);
    console.log('Found products:', products1.length);
    
    console.log('\n2. Testing with sort...');
    const sortOption = { createdAt: -1 };
    const products2 = await Product.find(filters).sort(sortOption);
    console.log('Found products with sort:', products2.length);
    
    console.log('\n3. Testing with pagination...');
    const skip = 0;
    const limit = 10;
    const products3 = await Product.find(filters)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);
    console.log('Found products with pagination:', products3.length);
    
    console.log('\n4. Testing with lean...');
    const products4 = await Product.find(filters)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true });
    console.log('Found products with lean:', products4.length);
    
    if (products4.length > 0) {
      console.log('\n5. Sample product data:');
      console.log('Name:', products4[0].name);
      console.log('Price:', products4[0].price);
      console.log('isActive:', products4[0].isActive);
    }
    
    // Test countDocuments
    console.log('\n6. Testing countDocuments...');
    const total = await Product.countDocuments(filters);
    console.log('Total count:', total);
    
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugProductQuery();
