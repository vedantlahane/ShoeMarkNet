const axios = require('axios');

async function testOrders() {
  try {
    // Login first
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'vedant@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Test orders
    const ordersResponse = await axios.get('http://localhost:5000/api/orders', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Orders response:', ordersResponse.data.length, 'orders found');
    if (ordersResponse.data.length > 0) {
      console.log('Sample order:', Object.keys(ordersResponse.data[0]));
    }
    
  } catch (error) {
    console.log('❌ Error details:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message || error.message);
  }
}

testOrders();
