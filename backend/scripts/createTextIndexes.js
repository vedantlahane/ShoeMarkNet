const mongoose = require('mongoose');
require('dotenv').config();

async function createTextIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Get the Product collection
    const productCollection = mongoose.connection.collection('products');
    
    // Create text index for search functionality
    await productCollection.createIndex({
      name: 'text',
      description: 'text',
      brand: 'text'
    });
    
    console.log('✅ Text index created for products (name, description, brand)');
    
    // Close connection
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  }
}

createTextIndexes();
