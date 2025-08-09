const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { testProducts } = require('../data/testProductData');
require('dotenv').config();

async function setupProductData() {
  try {
    // Connect to MongoDB (Atlas or Local based on .env)
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shoemark';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB:', mongoURI.includes('mongodb.net') ? 'Atlas Cloud' : 'Local');

    // Clear existing data
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('Cleared existing products and categories');

    // Create categories
    const categories = [
      {
        name: 'Basketball',
        slug: 'basketball',
        description: 'High-performance basketball shoes',
        isActive: true,
        sortOrder: 1
      },
      {
        name: 'Running',
        slug: 'running',
        description: 'Comfortable running and athletic shoes',
        isActive: true,
        sortOrder: 2
      },
      {
        name: 'Lifestyle',
        slug: 'lifestyle',
        description: 'Casual and lifestyle sneakers',
        isActive: true,
        sortOrder: 3
      },
      {
        name: 'Fashion',
        slug: 'fashion',
        description: 'Fashion-forward and designer sneakers',
        isActive: true,
        sortOrder: 4
      }
    ];

    const createdCategories = await Category.insertMany(categories);
    console.log(`Created ${createdCategories.length} categories`);

    // Assign categories to products
    const productsWithCategories = testProducts.map((product, index) => {
      let categoryIndex;
      if (product.name.includes('Jordan') || product.name.includes('Adapt BB')) {
        categoryIndex = 0; // Basketball
      } else if (product.name.includes('Air Max') || product.name.includes('RS-X')) {
        categoryIndex = 1; // Running
      } else if (product.name.includes('Yeezy')) {
        categoryIndex = 3; // Fashion
      } else {
        categoryIndex = 2; // Lifestyle
      }
      
      return {
        ...product,
        category: createdCategories[categoryIndex]._id,
        slug: product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        sku: `SKU${String(index + 1).padStart(3, '0')}`,
        tags: [product.brand.toLowerCase(), product.gender],
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    // Create products
    const createdProducts = await Product.insertMany(productsWithCategories);
    console.log(`Created ${createdProducts.length} products`);

    // Display summary
    console.log('\n=== PRODUCT DATA SETUP SUMMARY ===');
    console.log(`Database: ${mongoURI.includes('mongodb.net') ? 'MongoDB Atlas (Cloud)' : 'Local MongoDB'}`);
    console.log(`Categories created: ${createdCategories.length}`);
    console.log(`Products created: ${createdProducts.length}`);
    
    console.log('\nProducts by brand:');
    const brandCounts = createdProducts.reduce((acc, product) => {
      acc[product.brand] = (acc[product.brand] || 0) + 1;
      return acc;
    }, {});
    Object.entries(brandCounts).forEach(([brand, count]) => {
      console.log(`  ${brand}: ${count} products`);
    });

    console.log('\nFeatured products:');
    createdProducts.filter(p => p.isFeatured).forEach(product => {
      console.log(`  - ${product.name} ($${product.price})`);
    });

    console.log('\nNew arrivals:');
    createdProducts.filter(p => p.isNewArrival).forEach(product => {
      console.log(`  - ${product.name} ($${product.price})`);
    });

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    console.log('Product data setup completed successfully!');

  } catch (error) {
    console.error('Error setting up product data:', error);
    process.exit(1);
  }
}

setupProductData();
