const mongoose = require('mongoose');
const { populateUserTestData } = require('./populateUserTestData');

const setupTestData = async () => {
  try {
    console.log('🔗 Connecting to database...');
    
    // Connect to MongoDB (use your actual connection string)
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shoemark';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Database connected successfully');
    console.log(`📍 Connected to: ${mongoURI}`);
    
    // Populate user test data
    await populateUserTestData();
    
    console.log('\n🎯 Test data setup completed!');
    console.log('You can now test the user endpoints with the following credentials:');
    console.log('\n👤 Regular User:');
    console.log('   Email: vedant@example.com');
    console.log('   Password: password123');
    console.log('\n👑 Admin User:');
    console.log('   Email: admin@shoemarnet.com');
    console.log('   Password: adminpass123');
    
    console.log('\n📊 Additional Test Users:');
    console.log('   • johndoe@example.com / securepass456');
    console.log('   • alice.johnson@example.com / alicepass789');
    console.log('   • bob.wilson@example.com / bobpass321');
    console.log('   • sarah.chen@example.com / sarahpass456');
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Start your backend server: npm start');
    console.log('2. Run endpoint tests: node scripts/testUserEndpoints.js');
    console.log('3. Or use Postman/Thunder Client with the credentials above');
    
    await mongoose.connection.close();
    console.log('\n🔐 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

if (require.main === module) {
  setupTestData();
}

module.exports = setupTestData;
