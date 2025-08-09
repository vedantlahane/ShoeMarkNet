const mongoose = require('mongoose');
const User = require('../models/User');

async function checkUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/shoemark');
    const user = await User.findOne({ email: 'vedant@example.com' });
    console.log('User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('User details:', {
        name: user.name,
        email: user.email,
        hasPassword: !!user.password,
        isActive: user.isActive,
        role: user.role,
        status: user.status // Check if status field exists
      });
      
      console.log('All user fields:', Object.keys(user.toObject()));
      
      // Test password comparison
      const isMatch = await user.comparePassword('password123');
      console.log('Password comparison result:', isMatch);
    }
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkUser();
