const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const slugify = require('slugify');

// Models
const Product = require('./models/Product');
const Category = require('./models/Category');
const User = require('./models/User');

// Realistic Data
const { realisticProducts } = require('./data/realisticProductData');
const { realisticCategories } = require('./data/realisticCategories');
const { realisticUsers } = require('./data/realisticUsers');

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

// Category mapping for products
const categoryMapping = {
  'Nike Air Jordan 1 Retro High OG \'Bred Toe\'': 'basketball-shoes',
  'Nike Air Max 97 \'Silver Bullet\'': 'lifestyle-sneakers',
  'Nike Dunk Low \'Panda\'': 'lifestyle-sneakers',
  'Adidas Yeezy Boost 350 V2 \'Zebra\'': 'limited-editions',
  'Adidas Stan Smith \'Cloud White\'': 'lifestyle-sneakers',
  'Adidas Ultraboost 22 \'Triple Black\'': 'running-shoes',
  'New Balance 550 \'White Green\'': 'lifestyle-sneakers',
  'New Balance 990v5 \'Grey\'': 'lifestyle-sneakers',
  'Vans Old Skool \'Black White\'': 'skateboarding',
  'Converse Chuck Taylor All Star \'70 High \'Black\'': 'lifestyle-sneakers',
  'Puma Suede Classic XXI \'Peacoat\'': 'lifestyle-sneakers',
  'Nike Air Jordan 1 Low \'UNC\'': 'womens',
  'Adidas Samba OG \'White Green\'': 'lifestyle-sneakers',
  'Nike Air Zoom Pegasus 39': 'running-shoes',
  'Travis Scott x Air Jordan 1 Low \'Reverse Mocha\'': 'limited-editions',
  'Nike LeBron XX \'South Beach\'': 'basketball-shoes',
  'Adidas Harden Vol. 7 \'Pulse Aqua\'': 'basketball-shoes',
  'ASICS Gel-Kayano 30 \'Glacier Grey\'': 'running-shoes',
  'Hoka Speedgoat 5 \'Fiesta\'': 'running-shoes'
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding process...');
    
    await connectDB();

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Product.deleteMany();
    await Category.deleteMany();
    await User.deleteMany();
    console.log('✅ Existing data cleared');

    // 1. Create Categories
    console.log('📂 Creating categories...');
    const createdCategories = [];
    
    for (const categoryData of realisticCategories) {
      const category = await Category.create({
        ...categoryData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      createdCategories.push(category);
      console.log(`   ✅ Created category: ${category.name}`);
    }

    // Create a category lookup map
    const categoryLookup = {};
    createdCategories.forEach(cat => {
      categoryLookup[cat.slug] = cat._id;
    });

    // 2. Create Users (with password hashing)
    console.log('👥 Creating users...');
    const createdUsers = [];
    
    for (const userData of realisticUsers) {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const user = await User.create({
        ...userData,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      createdUsers.push(user);
      console.log(`   ✅ Created user: ${user.name} (${user.email})`);
    }

    // 3. Create Products
    console.log('👟 Creating products...');
    const createdProducts = [];
    
    for (let i = 0; i < realisticProducts.length; i++) {
      const productData = realisticProducts[i];
      
      // Assign category based on mapping
      const categorySlug = categoryMapping[productData.name] || 'lifestyle-sneakers';
      const categoryId = categoryLookup[categorySlug];
      
      // Generate slug
      const slug = slugify(productData.name, { lower: true, strict: true }) + `-${i}`;
      
      // Add additional metadata
      const product = await Product.create({
        ...productData,
        category: categoryId,
        slug: slug,
        isActive: true,
        tags: generateTags(productData),
        createdAt: new Date(),
        updatedAt: new Date(),
        // SEO fields
        metaTitle: `${productData.name} | ShoeMarkNet`,
        metaDescription: productData.description.substring(0, 160),
        // Additional fields
        weight: Math.floor(Math.random() * 500) + 300, // 300-800g
        dimensions: {
          length: Math.floor(Math.random() * 5) + 30, // 30-35cm
          width: Math.floor(Math.random() * 3) + 10,  // 10-13cm  
          height: Math.floor(Math.random() * 3) + 8   // 8-11cm
        }
      });
      
      createdProducts.push(product);
      console.log(`   ✅ Created product: ${product.name} (${product.brand})`);
    }

    // 4. Create some sample reviews for products
    console.log('⭐ Adding sample reviews...');
    const sampleReviews = [
      { rating: 5, comment: "Amazing quality and comfort! Highly recommend." },
      { rating: 4, comment: "Great sneakers, runs a bit small though." },
      { rating: 5, comment: "Perfect fit and style. Love these!" },
      { rating: 4, comment: "Good value for money, fast shipping." },
      { rating: 3, comment: "Decent shoes but expected better quality." },
      { rating: 5, comment: "Exceeded my expectations! Will buy again." },
      { rating: 4, comment: "Comfortable for daily wear, stylish design." }
    ];

    // Add reviews to random products
    const reviewPromises = [];
    for (let i = 0; i < 25; i++) {
      const randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)];
      const randomUser = createdUsers.filter(u => u.role === 'user')[Math.floor(Math.random() * createdUsers.filter(u => u.role === 'user').length)];
      const randomReview = sampleReviews[Math.floor(Math.random() * sampleReviews.length)];
      
      reviewPromises.push(
        // Note: You'll need to create Review model and import it if you want to add reviews
        // For now, we'll just log that we would create reviews
        console.log(`   Would add review for ${randomProduct.name} by ${randomUser.name}`)
      );
    }

    // 5. Update category product counts
    console.log('🔢 Updating category product counts...');
    for (const category of createdCategories) {
      const productCount = await Product.countDocuments({ category: category._id });
      await Category.findByIdAndUpdate(category._id, { productCount });
      console.log(`   ✅ Updated ${category.name}: ${productCount} products`);
    }

    // 6. Create some sample orders (if Order model exists)
    console.log('📋 Sample orders would be created here...');

    // Final statistics
    console.log('\n📊 SEEDING COMPLETE! Statistics:');
    console.log(`   Categories: ${createdCategories.length}`);
    console.log(`   Products: ${createdProducts.length}`);  
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Admin Users: ${createdUsers.filter(u => u.role === 'admin').length}`);
    console.log(`   Featured Products: ${createdProducts.filter(p => p.isFeatured).length}`);
    console.log(`   New Arrivals: ${createdProducts.filter(p => p.isNewArrival).length}`);
    console.log(`   Products on Sale: ${createdProducts.filter(p => p.discountPercentage > 0).length}`);

    console.log('\n🎉 Database seeded successfully with realistic shoe store data!');
    console.log('\n📝 Test Accounts:');
    console.log('   Admin: admin@shoemarknet.com / admin123');
    console.log('   User: alex.johnson@example.com / password123');
    console.log('   User: sarah.chen@example.com / password123');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

// Helper function to generate tags
function generateTags(product) {
  const tags = [];
  
  // Add brand tag
  tags.push(product.brand.toLowerCase());
  
  // Add gender tags
  if (product.gender) tags.push(product.gender);
  
  // Add feature tags
  if (product.isFeatured) tags.push('featured');
  if (product.isNewArrival) tags.push('new-arrival');
  if (product.discountPercentage > 0) tags.push('sale');
  
  // Add price range tags
  if (product.price < 100) tags.push('budget-friendly');
  else if (product.price < 150) tags.push('mid-range');
  else tags.push('premium');
  
  // Add color tags from variants
  if (product.variants && product.variants.length > 0) {
    product.variants.forEach(variant => {
      if (variant.color) {
        const colorWords = variant.color.toLowerCase().split(/[\s/]+/);
        colorWords.forEach(word => {
          if (word && !tags.includes(word)) {
            tags.push(word);
          }
        });
      }
    });
  }
  
  return tags;
}

// Run the seeder
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
