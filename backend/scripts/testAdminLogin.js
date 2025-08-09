const axios = require('axios');

async function testAdminLogin() {
  const passwords = ['password123', 'adminpass123', 'admin123', 'shoemark123', 'admin'];
  
  for (const password of passwords) {
    try {
      console.log(`Testing password: ${password}`);
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'admin@shoemarnet.com',
        password: password
      });
      
      console.log('✅ SUCCESS! Admin login worked with password:', password);
      console.log('Admin role:', response.data.user.role);
      console.log('Token:', response.data.token.substring(0, 20) + '...');
      return password;
      
    } catch (error) {
      console.log(`❌ Failed with password: ${password}`);
    }
  }
  
  console.log('❌ No working password found');
}

testAdminLogin();
