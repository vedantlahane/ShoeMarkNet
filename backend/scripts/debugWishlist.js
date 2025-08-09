const axios = require('axios');

async function testWishlist() {
  try {
    // Login first
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'vedant@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Test wishlist
    const wishlistResponse = await axios.get('http://localhost:5000/api/wishlist', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Wishlist response:', wishlistResponse.data);
    
  } catch (error) {
    console.log('❌ Error details:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message || error.message);
    console.log('Stack:', error.response?.data?.stack || 'No stack trace');
  }
}

testWishlist();
