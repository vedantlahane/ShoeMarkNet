const mongoose = require('mongoose');
const User = require('../models/User');

async function checkPasswords() {
  try {
    await mongoose.connect('mongodb://localhost:27017/shoemark');
    
    const vedant = await User.findOne({ email: 'vedant@example.com' });
    const testUser = await User.findOne({ email: 'testuser@example.com' });
    
    console.log('=== PASSWORD COMPARISON ===');
    console.log('Vedant password (from test data):', vedant.password.substring(0, 20) + '...');
    console.log('Test user password (from API):', testUser.password.substring(0, 20) + '...');
    
    console.log('Vedant password is hashed:', vedant.password.startsWith('$2b$'));
    console.log('Test user password is hashed:', testUser.password.startsWith('$2b$'));
    
    // Test password comparison
    console.log('\n=== TESTING PASSWORD COMPARISON ===');
    const vedantMatch = await vedant.comparePassword('password123');
    const testUserMatch = await testUser.comparePassword('testpass123');
    
    console.log('Vedant password matches:', vedantMatch);
    console.log('Test user password matches:', testUserMatch);
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkPasswords();
