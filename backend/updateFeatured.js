const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const updateFeaturedProducts = async () => {
  try {
    console.log('⭐ Updating products to be featured...');
    
    await connectDB();

    // Get all products
    const allProducts = await Product.find({});
    console.log(`Found ${allProducts.length} products`);

    // Update the first 7 products to be featured
    const productsToFeature = allProducts.slice(0, 7);
    
    for (const product of productsToFeature) {
      await Product.findByIdAndUpdate(product._id, { 
        isFeatured: true,
        updatedAt: new Date()
      });
      console.log(`✅ Made "${product.name}" featured`);
    }

    // Update some products to be new arrivals
    const productsForNewArrivals = allProducts.slice(7, 12);
    
    for (const product of productsForNewArrivals) {
      await Product.findByIdAndUpdate(product._id, { 
        isNewArrival: true,
        updatedAt: new Date()
      });
      console.log(`🆕 Made "${product.name}" a new arrival`);
    }

    console.log('\n📊 Update Summary:');
    const featuredCount = await Product.countDocuments({ isFeatured: true });
    const newArrivalCount = await Product.countDocuments({ isNewArrival: true });
    
    console.log(`   Featured Products: ${featuredCount}`);
    console.log(`   New Arrivals: ${newArrivalCount}`);
    console.log(`   Total Products: ${allProducts.length}`);

    process.exit(0);

  } catch (error) {
    console.error('❌ Error updating products:', error);
    process.exit(1);
  }
};

// Run the script
if (require.main === module) {
  updateFeaturedProducts();
}

module.exports = { updateFeaturedProducts };
