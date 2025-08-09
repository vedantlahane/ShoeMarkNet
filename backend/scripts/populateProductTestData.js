const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { testProducts } = require('../data/testProductData');

const populateProductTestData = async () => {
  try {
    console.log('🔄 Starting product test data population...');
    
    // Clear existing products
    console.log('🗑️  Clearing existing products...');
    await Product.deleteMany({});
    
    // Create a default category if none exists
    let defaultCategory = await Category.findOne({ name: 'Sneakers' });
    if (!defaultCategory) {
      console.log('📁 Creating default category...');
      defaultCategory = new Category({
        name: 'Sneakers',
        description: 'Athletic and casual sneakers',
        isActive: true
      });
      await defaultCategory.save();
      console.log('✅ Created default category: Sneakers');
    }
    
    // Create products
    console.log('👟 Creating test products...');
    const createdProducts = [];
    
    for (const productData of testProducts) {
      // Add the default category to the product
      const productWithCategory = {
        ...productData,
        category: defaultCategory._id
      };
      
      const product = new Product(productWithCategory);
      const savedProduct = await product.save();
      createdProducts.push(savedProduct);
      console.log(`✅ Created product: ${savedProduct.name} - $${savedProduct.price}`);
    }
    
    console.log('🎉 Product test data population completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Created ${createdProducts.length} products`);
    console.log(`   - Price range: $${Math.min(...createdProducts.map(p => p.price))} - $${Math.max(...createdProducts.map(p => p.price))}`);
    console.log(`   - Total inventory: ${createdProducts.reduce((sum, p) => sum + p.countInStock, 0)} items`);
    
    return {
      products: createdProducts,
      category: defaultCategory,
      message: 'Product test data populated successfully'
    };
    
  } catch (error) {
    console.error('❌ Error populating product test data:', error);
    throw error;
  }
};

module.exports = {
  populateProductTestData
};
