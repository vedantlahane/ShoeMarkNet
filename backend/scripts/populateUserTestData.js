const mongoose = require('mongoose');
const User = require('../models/User');
const Address = require('../models/Address');
const { testUsers, testAddresses } = require('../data/testUserData');

const populateUserTestData = async () => {
  try {
    console.log('🔄 Starting user test data population...');
    
    // Clear existing test data (optional - remove if you want to keep existing data)
    console.log('🗑️  Clearing existing test users and addresses...');
    const testEmails = testUsers.map(u => u.email);
    await User.deleteMany({ email: { $in: testEmails } });
    
    // Get all user IDs that will be deleted to clean up their addresses
    const usersToDelete = await User.find({ email: { $in: testEmails } }, '_id');
    const userIdsToDelete = usersToDelete.map(u => u._id);
    await Address.deleteMany({ user: { $in: userIdsToDelete } });
    
    // Create users
    console.log('👥 Creating test users...');
    const createdUsers = [];
    
    for (const userData of testUsers) {
      const user = new User(userData);
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`✅ Created user: ${savedUser.name} (${savedUser.email})`);
    }
    
    // Create addresses and link them to users
    console.log('🏠 Creating test addresses...');
    let addressIndex = 0;
    
    for (let i = 0; i < createdUsers.length; i++) {
      const user = createdUsers[i];
      
      // Each user gets at least one address, some get more
      let addressCount = 1;
      if (i === 0) addressCount = 2; // Vedant gets 2 addresses
      
      for (let j = 0; j < addressCount && addressIndex < testAddresses.length; j++) {
        const addressData = {
          ...testAddresses[addressIndex],
          user: user._id
        };
        
        const address = new Address(addressData);
        const savedAddress = await address.save();
        console.log(`✅ Created address for ${user.name}: ${savedAddress.city}, ${savedAddress.country}`);
        addressIndex++;
      }
    }
    
    console.log('🎉 User test data population completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Created ${createdUsers.length} users`);
    console.log(`   - Created ${addressIndex} addresses`);
    
    return {
      users: createdUsers,
      message: 'Test data populated successfully'
    };
    
  } catch (error) {
    console.error('❌ Error populating user test data:', error);
    throw error;
  }
};

// Function to get user test data for API testing
const getUserTestData = () => {
  return {
    validUser: {
      email: "vedant@example.com",
      password: "password123"
    },
    adminUser: {
      email: "admin@shoemarnet.com",
      password: "adminpass123"
    },
    newUser: {
      name: "Test User",
      email: "testuser@example.com",
      phone: "+91-1234567890",
      password: "testpass123",
      source: "web"
    },
    updateProfile: {
      name: "Updated Name",
      phone: "+91-9999888877"
    },
    changePassword: {
      currentPassword: "password123",
      newPassword: "newpassword123"
    },
    newAddress: {
      fullName: "Test Address User",
      addressLine1: "Test Street 123",
      addressLine2: "Test Building",
      city: "Test City",
      state: "Test State",
      postalCode: "123456",
      country: "Test Country",
      phone: "+91-1234567890",
      isDefault: false,
      addressType: "shipping"
    }
  };
};

module.exports = {
  populateUserTestData,
  getUserTestData
};
