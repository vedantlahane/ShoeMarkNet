const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function checkAdminCredentials() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (adminUser) {
      console.log('Admin user details:');
      console.log('Email:', adminUser.email);
      console.log('Name:', adminUser.name);
      console.log('Role:', adminUser.role);
      
      const bcrypt = require('bcryptjs');
      const isMatch = await bcrypt.compare('password123', adminUser.password);
      console.log('Password matches password123:', isMatch);
      
      if (!isMatch) {
        console.log('Setting new password...');
        adminUser.password = 'password123';
        await adminUser.save();
        console.log('✅ Password updated');
      }
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAdminCredentials();
