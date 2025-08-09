const axios = require('axios');

async function quickTest() {
  console.log('🔎 Quick API Status Check...\n');
  
  try {
    // Test login
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'vedant@example.com',
      password: 'password123'
    });
    console.log('✅ LOGIN: Success');
    const token = loginResponse.data.token;
    
    // Test products
    const productsResponse = await axios.get('http://localhost:5000/api/products?limit=1');
    console.log('✅ PRODUCTS: Success');
    
    // Test cart
    const cartResponse = await axios.get('http://localhost:5000/api/cart', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ CART: Success');
    
    // Test wishlist
    const wishlistResponse = await axios.get('http://localhost:5000/api/wishlist', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ WISHLIST: Success');
    
    console.log('\n🎉 All key endpoints are working!');
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data?.message || error.message);
  }
}

quickTest();
