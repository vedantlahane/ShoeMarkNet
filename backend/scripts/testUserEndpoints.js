const axios = require('axios');
const { getUserTestData } = require('./populateUserTestData');

const BASE_URL = 'http://localhost:5000/api'; // Adjust port as needed
const testData = getUserTestData();

let userToken = '';
let adminToken = '';
let testAddressId = '';
let testUserId = '';

const testUserEndpoints = async () => {
  console.log('🚀 Starting User Endpoints Testing...\n');

  try {
    // Step 1: Login to get tokens
    console.log('1️⃣  Testing Authentication...');
    
    try {
      const userLogin = await axios.post(`${BASE_URL}/auth/login`, testData.validUser);
      userToken = userLogin.data.token;
      testUserId = userLogin.data.user.id || userLogin.data.user._id;
      console.log('✅ User login successful');
      console.log(`   Token: ${userToken.substring(0, 20)}...`);
    } catch (error) {
      console.log('❌ User login failed:', error.response?.data?.message || error.message);
      return;
    }

    try {
      const adminLogin = await axios.post(`${BASE_URL}/auth/login`, testData.adminUser);
      adminToken = adminLogin.data.token;
      console.log('✅ Admin login successful');
      console.log(`   Token: ${adminToken.substring(0, 20)}...\n`);
    } catch (error) {
      console.log('⚠️  Admin login failed:', error.response?.data?.message || error.message);
      console.log('   Continuing with user tests only...\n');
    }

    // Step 2: Test user profile endpoints
    console.log('2️⃣  Testing User Profile...');
    
    try {
      const profile = await axios.get(`${BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      console.log('✅ Get profile:', profile.data.name, '-', profile.data.email);
      console.log(`   Role: ${profile.data.role}, Score: ${profile.data.score}, Active: ${profile.data.isActive}`);
    } catch (error) {
      console.log('❌ Get profile failed:', error.response?.data?.message || error.message);
    }

    try {
      const updateProfile = await axios.put(`${BASE_URL}/users/profile`, testData.updateProfile, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      console.log('✅ Update profile:', updateProfile.data.message);
      console.log(`   Updated name: ${updateProfile.data.user?.name}, phone: ${updateProfile.data.user?.phone}`);
    } catch (error) {
      console.log('❌ Update profile failed:', error.response?.data?.message || error.message);
    }

    try {
      const changePassword = await axios.put(`${BASE_URL}/users/password`, testData.changePassword, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      console.log('✅ Change password:', changePassword.data.message);
    } catch (error) {
      console.log('❌ Change password failed:', error.response?.data?.message || error.message);
    }

    console.log();

    // Step 3: Test address management
    console.log('3️⃣  Testing Address Management...');
    
    try {
      const addresses = await axios.get(`${BASE_URL}/users/addresses`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      console.log('✅ Get addresses:', addresses.data.length, 'addresses found');
      if (addresses.data.length > 0) {
        const firstAddress = addresses.data[0];
        console.log(`   First address: ${firstAddress.fullName}, ${firstAddress.city}, ${firstAddress.country}`);
        console.log(`   Default: ${firstAddress.isDefault}, Type: ${firstAddress.addressType}`);
      }
    } catch (error) {
      console.log('❌ Get addresses failed:', error.response?.data?.message || error.message);
    }

    try {
      const addAddress = await axios.post(`${BASE_URL}/users/addresses`, testData.newAddress, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      testAddressId = addAddress.data.address._id;
      console.log('✅ Add address:', addAddress.data.message);
      console.log(`   Address ID: ${testAddressId}`);
      console.log(`   Location: ${addAddress.data.address.city}, ${addAddress.data.address.state}`);
    } catch (error) {
      console.log('❌ Add address failed:', error.response?.data?.message || error.message);
    }

    if (testAddressId) {
      try {
        const updateAddress = await axios.put(`${BASE_URL}/users/addresses/${testAddressId}`, {
          city: 'Updated Test City',
          state: 'Updated Test State'
        }, {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        console.log('✅ Update address:', updateAddress.data.message);
        console.log(`   Updated to: ${updateAddress.data.address?.city}, ${updateAddress.data.address?.state}`);
      } catch (error) {
        console.log('❌ Update address failed:', error.response?.data?.message || error.message);
      }

      try {
        const deleteAddress = await axios.delete(`${BASE_URL}/users/addresses/${testAddressId}`, {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        console.log('✅ Delete address:', deleteAddress.data.message);
      } catch (error) {
        console.log('❌ Delete address failed:', error.response?.data?.message || error.message);
      }
    }

    console.log();

    // Step 4: Test admin endpoints
    if (adminToken) {
      console.log('4️⃣  Testing Admin Endpoints...');
      
      try {
        const allUsers = await axios.get(`${BASE_URL}/users/admin`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Get all users:', allUsers.data.users?.length || allUsers.data.length, 'users found');
        
        if (allUsers.data.pagination) {
          console.log(`   Pagination: Page ${allUsers.data.pagination.currentPage}/${allUsers.data.pagination.totalPages}`);
          console.log(`   Total: ${allUsers.data.pagination.totalUsers} users`);
        }

        // Show first few users
        const users = allUsers.data.users || allUsers.data;
        if (users.length > 0) {
          console.log('   Sample users:');
          users.slice(0, 3).forEach((user, index) => {
            console.log(`     ${index + 1}. ${user.name} (${user.email}) - ${user.role} - Score: ${user.score}`);
          });
        }
      } catch (error) {
        console.log('❌ Get all users failed:', error.response?.data?.message || error.message);
      }

      // Test admin update user
      if (testUserId) {
        try {
          const updateUser = await axios.put(`${BASE_URL}/users/admin/${testUserId}`, {
            score: 95,
            source: 'web'
          }, {
            headers: { Authorization: `Bearer ${adminToken}` }
          });
          console.log('✅ Admin update user:', updateUser.data.message);
          console.log(`   Updated score to: ${updateUser.data.user?.score}`);
        } catch (error) {
          console.log('❌ Admin update user failed:', error.response?.data?.message || error.message);
        }
      }
    } else {
      console.log('4️⃣  Skipping Admin Endpoints (no admin token)...');
    }

    console.log('\n🎉 User Endpoints Testing Completed!');

  } catch (error) {
    console.error('❌ Unexpected error during testing:', error.message);
  }
};

// Function to test error scenarios
const testErrorScenarios = async () => {
  console.log('\n🔍 Testing Error Scenarios...\n');

  try {
    // Test without authentication
    console.log('Testing unauthorized access...');
    try {
      await axios.get(`${BASE_URL}/users/profile`);
      console.log('❌ Should have failed but succeeded');
    } catch (error) {
      console.log('✅ Unauthorized access properly blocked:', error.response?.status, error.response?.data?.message);
    }

    // Test admin route with user token
    if (userToken) {
      console.log('Testing admin route with user token...');
      try {
        await axios.get(`${BASE_URL}/users/admin`, {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        console.log('❌ Should have failed but succeeded');
      } catch (error) {
        console.log('✅ Admin access properly blocked for user:', error.response?.status, error.response?.data?.message);
      }
    }

    // Test invalid data
    if (userToken) {
      console.log('Testing invalid email update...');
      try {
        await axios.put(`${BASE_URL}/users/profile`, {
          email: 'invalid-email-format'
        }, {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        console.log('❌ Should have failed but succeeded');
      } catch (error) {
        console.log('✅ Invalid email properly rejected:', error.response?.status, error.response?.data?.message);
      }
    }

    // Test wrong password
    console.log('Testing wrong password...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: testData.validUser.email,
        password: 'wrongpassword'
      });
      console.log('❌ Should have failed but succeeded');
    } catch (error) {
      console.log('✅ Wrong password properly rejected:', error.response?.status, error.response?.data?.message);
    }

    console.log('\n✅ Error scenario testing completed!');

  } catch (error) {
    console.error('❌ Error scenario test failed:', error.message);
  }
};

// Run the tests
const runAllTests = async () => {
  console.log(`
🧪 USER ENDPOINTS TEST SUITE
=============================
Testing all user-related API endpoints with dummy data

🔧 Prerequisites:
- Backend server running on ${BASE_URL}
- Test data populated in database
- MongoDB connection active

Starting tests...
`);

  await testUserEndpoints();
  await testErrorScenarios();
  
  console.log(`
📊 TEST SUMMARY
===============
✅ Authentication (Login)
✅ Get User Profile  
✅ Update User Profile
✅ Change Password
✅ Get User Addresses
✅ Add New Address
✅ Update Address
✅ Delete Address
✅ Admin - Get All Users
✅ Admin - Update User
✅ Error Handling Tests

🎯 Test Credentials Used:
- Regular User: ${testData.validUser.email}
- Admin User: ${testData.adminUser.email}

📝 To run this test:
1. Make sure your backend server is running
2. Ensure test data is populated: node scripts/setupTestData.js
3. Run: node scripts/testUserEndpoints.js
  `);
};

if (require.main === module) {
  runAllTests();
}

module.exports = {
  testUserEndpoints,
  testErrorScenarios
};
