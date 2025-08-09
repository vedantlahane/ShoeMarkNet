const mongoose = require('mongoose');
const User = require('../models/User');

async function createAdminUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/shoemark');
    
    // Delete existing admin test user if exists
    await User.deleteOne({ email: 'admintest@example.com' });
    
    // Create new admin user
    const adminUser = new User({
      name: 'Admin Test User',
      email: 'admintest@example.com',
      password: 'admintest123',
      role: 'admin',
      isActive: true,
      isEmailVerified: true
    });
    
    await adminUser.save();
    console.log('✅ Admin user created successfully');
    console.log('   Email: admintest@example.com');
    console.log('   Password: admintest123');
    console.log('   Role:', adminUser.role);
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createAdminUser();
