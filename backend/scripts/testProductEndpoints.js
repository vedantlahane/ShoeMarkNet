const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testProductEndpoints() {
  console.log('🧪 Testing Product Endpoints\n');

  try {
    // Test 1: Get all products
    console.log('1. Testing GET /api/products');
    const allProductsResponse = await axios.get(`${BASE_URL}/products`);
    console.log('✅ Status:', allProductsResponse.status);
    console.log('✅ Products found:', allProductsResponse.data.products.length);
    console.log('✅ Pagination:', allProductsResponse.data.pagination);
    
    if (allProductsResponse.data.products.length > 0) {
      const firstProduct = allProductsResponse.data.products[0];
      console.log('✅ First product:', firstProduct.name, '-', '$' + firstProduct.price);
      
      // Test 2: Get single product by ID
      console.log('\n2. Testing GET /api/products/:id');
      const singleProductResponse = await axios.get(`${BASE_URL}/products/${firstProduct._id}`);
      console.log('✅ Status:', singleProductResponse.status);
      console.log('✅ Product:', singleProductResponse.data.name);
      
      // Test 3: Get products with filters
      console.log('\n3. Testing GET /api/products with filters');
      const filteredResponse = await axios.get(`${BASE_URL}/products?brand=Nike&limit=5`);
      console.log('✅ Status:', filteredResponse.status);
      console.log('✅ Nike products found:', filteredResponse.data.products.length);
      
      // Test 4: Get featured products
      console.log('\n4. Testing GET /api/products with featured filter');
      const featuredResponse = await axios.get(`${BASE_URL}/products?isFeatured=true`);
      console.log('✅ Status:', featuredResponse.status);
      console.log('✅ Featured products found:', featuredResponse.data.products.length);
      
      // Test 5: Search products
      console.log('\n5. Testing GET /api/products with search');
      const searchResponse = await axios.get(`${BASE_URL}/products?search=Nike`);
      console.log('✅ Status:', searchResponse.status);
      console.log('✅ Search results found:', searchResponse.data.products.length);
      
    } else {
      console.log('❌ No products found in response');
    }

  } catch (error) {
    console.error('❌ Error testing product endpoints:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
  }
}

testProductEndpoints();
