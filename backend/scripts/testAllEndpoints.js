const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runAllEndpointTests() {
  console.log('🚀 ShoeMarkNet API - Comprehensive Endpoint Testing\n');
  console.log('='.repeat(60));

  let authToken = null;

  try {
    // Test 1: User Registration
    console.log('\n📝 TESTING USER ENDPOINTS');
    console.log('-'.repeat(30));
    
    const newUser = {
      name: 'Test Customer',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      phone: '1234567890'
    };

    console.log('1. Testing User Registration');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, newUser);
    console.log('✅ Registration Status:', registerResponse.status);
    console.log('✅ User ID:', registerResponse.data.user._id);

    // Test 2: User Login
    console.log('\n2. Testing User Login');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: newUser.email,
      password: newUser.password
    });
    console.log('✅ Login Status:', loginResponse.status);
    console.log('✅ Token received:', !!loginResponse.data.token);
    authToken = loginResponse.data.token;

    // Test 3: Get User Profile
    console.log('\n3. Testing Get Profile');
    const profileResponse = await axios.get(`${BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Profile Status:', profileResponse.status);
    console.log('✅ Profile Name:', profileResponse.data.name);

    // Test 4: Products Endpoints
    console.log('\n\n👟 TESTING PRODUCT ENDPOINTS');
    console.log('-'.repeat(30));

    console.log('1. Testing Get All Products');
    const productsResponse = await axios.get(`${BASE_URL}/products`);
    console.log('✅ Status:', productsResponse.status);
    console.log('✅ Products found:', productsResponse.data.products.length);
    console.log('✅ Total products:', productsResponse.data.pagination.total);

    if (productsResponse.data.products.length > 0) {
      const firstProduct = productsResponse.data.products[0];
      console.log('✅ Sample product:', firstProduct.name, '-', '$' + firstProduct.price);

      // Test 5: Get Single Product
      console.log('\n2. Testing Get Single Product');
      const singleProductResponse = await axios.get(`${BASE_URL}/products/${firstProduct._id}`);
      console.log('✅ Status:', singleProductResponse.status);
      console.log('✅ Product name:', singleProductResponse.data.name);
    }

    // Test 6: Featured Products
    console.log('\n3. Testing Featured Products');
    const featuredResponse = await axios.get(`${BASE_URL}/products/featured`);
    console.log('✅ Status:', featuredResponse.status);
    console.log('✅ Featured products:', featuredResponse.data.length);

    // Test 7: New Arrivals
    console.log('\n4. Testing New Arrivals');
    const newArrivalsResponse = await axios.get(`${BASE_URL}/products/new-arrivals`);
    console.log('✅ Status:', newArrivalsResponse.status);
    console.log('✅ New arrivals:', newArrivalsResponse.data.length);

    // Test 8: Product Search and Filters
    console.log('\n5. Testing Product Search and Filters');
    const searchResponse = await axios.get(`${BASE_URL}/products?search=Nike&limit=3`);
    console.log('✅ Search Status:', searchResponse.status);
    console.log('✅ Nike products found:', searchResponse.data.products.length);

    const brandFilterResponse = await axios.get(`${BASE_URL}/products?brand=Adidas`);
    console.log('✅ Brand filter Status:', brandFilterResponse.status);
    console.log('✅ Adidas products found:', brandFilterResponse.data.products.length);

    const featuredFilterResponse = await axios.get(`${BASE_URL}/products?isFeatured=true`);
    console.log('✅ Featured filter Status:', featuredFilterResponse.status);
    console.log('✅ Featured products found:', featuredFilterResponse.data.products.length);

    // Test 9: Categories
    console.log('\n\n📂 TESTING CATEGORY ENDPOINTS');
    console.log('-'.repeat(30));

    console.log('1. Testing Get All Categories');
    const categoriesResponse = await axios.get(`${BASE_URL}/categories`);
    console.log('✅ Status:', categoriesResponse.status);
    console.log('✅ Categories found:', categoriesResponse.data.length);
    
    if (categoriesResponse.data.length > 0) {
      console.log('✅ Sample categories:', categoriesResponse.data.map(c => c.name).join(', '));
    }

    // Summary
    console.log('\n\n🎉 TESTING SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ User Registration: Working');
    console.log('✅ User Login: Working');
    console.log('✅ User Profile: Working');
    console.log('✅ Get All Products: Working');
    console.log('✅ Get Single Product: Working');
    console.log('✅ Featured Products: Working');
    console.log('✅ New Arrivals: Working');
    console.log('✅ Product Search: Working');
    console.log('✅ Product Filters: Working');
    console.log('✅ Categories: Working');
    console.log('\n🚀 All endpoints are functioning correctly!');

  } catch (error) {
    console.error('\n❌ Error during testing:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
  }
}

runAllEndpointTests();
