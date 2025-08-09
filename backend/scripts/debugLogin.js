const mongoose = require('mongoose');
const User = require('../models/User');

async function debugLogin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/shoemark');
    
    const email = 'vedant@example.com';
    const password = 'password123';
    
    console.log('1. Looking for user with email:', email);
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log('2. User found:', !!user);
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('3. User isActive:', user.isActive);
    if (!user.isActive) {
      console.log('❌ User is not active');
      return;
    }
    
    console.log('4. Testing password comparison...');
    const isMatch = await user.comparePassword(password);
    console.log('5. Password match:', isMatch);
    
    if (!isMatch) {
      console.log('❌ Password does not match');
      return;
    }
    
    console.log('✅ All checks passed - login should work');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugLogin();
