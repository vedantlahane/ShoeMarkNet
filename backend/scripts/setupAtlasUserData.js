const mongoose = require('mongoose');
const User = require('../models/User');
const Address = require('../models/Address');
const { testUsers } = require('../data/testUserData');
require('dotenv').config();

async function setupAtlasUserData() {
  try {
    // Connect to MongoDB (Atlas or Local based on .env)
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shoemark';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB:', mongoURI.includes('mongodb.net') ? 'Atlas Cloud' : 'Local');

    // Clear existing user data
    await User.deleteMany({});
    await Address.deleteMany({});
    console.log('Cleared existing users and addresses');

    // Create users with addresses
    for (const userData of testUsers) {
      console.log(`Creating user: ${userData.name} (${userData.email})`);
      
      // Create the user (password will be automatically hashed by the User model)
      const user = new User({
        name: userData.name,
        email: userData.email,
        password: userData.password, // Will be hashed by pre-save middleware
        phone: userData.phone,
        role: userData.role,
        emailVerified: userData.emailVerified,
        preferences: userData.preferences
      });
      
      await user.save();
      console.log(`✅ Created user: ${user.name}`);
      
      // Create addresses for this user
      if (userData.addresses && userData.addresses.length > 0) {
        for (const addressData of userData.addresses) {
          const address = new Address({
            ...addressData,
            user: user._id
          });
          await address.save();
          console.log(`  ✅ Created address: ${address.type} - ${address.city}, ${address.state}`);
        }
      }
    }

    const totalUsers = await User.countDocuments();
    const totalAddresses = await Address.countDocuments();
    
    console.log('\n=== USER DATA SETUP SUMMARY ===');
    console.log(`Database: ${mongoURI.includes('mongodb.net') ? 'MongoDB Atlas (Cloud)' : 'Local MongoDB'}`);
    console.log(`Total users created: ${totalUsers}`);
    console.log(`Total addresses created: ${totalAddresses}`);
    
    // Display user summary
    const users = await User.find({}, 'name email role').lean();
    console.log('\nCreated users:');
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    console.log('\n👤 Test Credentials:');
    console.log('Regular User: vedant@example.com / password123');
    console.log('Admin User: admin@shoemarnet.com / adminpass123');

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    console.log('User data setup completed successfully!');

  } catch (error) {
    console.error('Error setting up user data:', error);
    process.exit(1);
  }
}

setupAtlasUserData();
