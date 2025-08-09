const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api';

// Test credentials
let authToken = '';
let testUserId = '';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = (color, message) => console.log(`${color}${message}${colors.reset}`);

class EndpointTester {
  constructor() {
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
  }

  async test(endpoint, method = 'GET', data = null, headers = {}) {
    this.totalTests++;
    try {
      const config = {
        method,
        url: `${BASE_URL}${endpoint}`,
        headers,
        ...(data && { data })
      };

      const response = await axios(config);
      log(colors.green, `✅ ${method} ${endpoint} - Status: ${response.status}`);
      this.passedTests++;
      return response.data;
    } catch (error) {
      const status = error.response?.status || 'No Response';
      const message = error.response?.data?.message || error.message;
      log(colors.red, `❌ ${method} ${endpoint} - Status: ${status} - ${message}`);
      this.failedTests++;
      return null;
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    log(colors.bold + colors.blue, '📊 TEST SUMMARY');
    console.log('='.repeat(60));
    log(colors.blue, `Total Tests: ${this.totalTests}`);
    log(colors.green, `Passed: ${this.passedTests}`);
    log(colors.red, `Failed: ${this.failedTests}`);
    log(colors.yellow, `Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);
    console.log('='.repeat(60));
  }
}

async function testAllEndpoints() {
  const tester = new EndpointTester();
  
  console.log('🚀 Starting comprehensive endpoint testing...\n');

  // =================== AUTHENTICATION TESTS ===================
  log(colors.bold + colors.blue, '🔐 AUTHENTICATION ENDPOINTS');
  console.log('='.repeat(50));

  // Login with test user
  const loginData = {
    email: 'vedant@example.com',
    password: 'password123'
  };
  
  const loginResponse = await tester.test('/auth/login', 'POST', loginData);
  if (loginResponse) {
    authToken = loginResponse.token;
    testUserId = loginResponse.user.id;
    log(colors.green, `🎯 Logged in as: ${loginResponse.user.name}`);
  }

  // Register new user
  await tester.test('/auth/register', 'POST', {
    name: 'Test Register User',
    email: `testregister${Date.now()}@example.com`,
    password: 'password123'
  });

  // =================== USER ENDPOINTS ===================
  log(colors.bold + colors.blue, '\n👥 USER ENDPOINTS');
  console.log('='.repeat(50));

  const authHeaders = { Authorization: `Bearer ${authToken}` };
  
  await tester.test('/users/profile', 'GET', null, authHeaders);
  await tester.test('/users/profile', 'PUT', { name: 'Updated Name' }, authHeaders);
  await tester.test('/users/addresses', 'GET', null, authHeaders);
  await tester.test('/users/admin', 'GET', null, authHeaders);

  // =================== PRODUCT ENDPOINTS ===================
  log(colors.bold + colors.blue, '\n👟 PRODUCT ENDPOINTS');
  console.log('='.repeat(50));

  await tester.test('/products');
  await tester.test('/products?page=1&limit=5');
  await tester.test('/products?category=Nike');
  await tester.test('/products?minPrice=50&maxPrice=200');
  
  // Get a product ID for further tests
  const productsResponse = await tester.test('/products?limit=1');
  let testProductId = '';
  if (productsResponse && productsResponse.products && productsResponse.products.length > 0) {
    testProductId = productsResponse.products[0]._id;
    await tester.test(`/products/${testProductId}`);
  }

  // =================== CATEGORY ENDPOINTS ===================
  log(colors.bold + colors.blue, '\n📂 CATEGORY ENDPOINTS');
  console.log('='.repeat(50));

  await tester.test('/categories');
  
  const categoriesResponse = await tester.test('/categories');
  if (categoriesResponse && categoriesResponse.length > 0) {
    const testCategoryId = categoriesResponse[0]._id;
    await tester.test(`/categories/${testCategoryId}`);
  }

  // =================== CART ENDPOINTS ===================
  log(colors.bold + colors.blue, '\n🛒 CART ENDPOINTS');
  console.log('='.repeat(50));

  await tester.test('/cart', 'GET', null, authHeaders);
  
  if (testProductId) {
    await tester.test('/cart', 'POST', {
      productId: testProductId,
      quantity: 2,
      variant: { size: '10' }
    }, authHeaders);
    
    await tester.test('/cart', 'GET', null, authHeaders);
    
    // Get cart to find an item ID for update/remove
    const cartResponse = await tester.test('/cart', 'GET', null, authHeaders);
    if (cartResponse && cartResponse.items && cartResponse.items.length > 0) {
      const itemId = cartResponse.items[0]._id;
      await tester.test(`/cart/${itemId}`, 'PUT', {
        quantity: 3
      }, authHeaders);
      
      await tester.test(`/cart/${itemId}`, 'DELETE', null, authHeaders);
    }
  }

  await tester.test('/cart', 'DELETE', null, authHeaders);

  // =================== WISHLIST ENDPOINTS ===================
  log(colors.bold + colors.blue, '\n❤️  WISHLIST ENDPOINTS');
  console.log('='.repeat(50));

  await tester.test('/wishlist', 'GET', null, authHeaders);
  
  if (testProductId) {
    await tester.test('/wishlist', 'POST', {
      productId: testProductId
    }, authHeaders);
    
    await tester.test('/wishlist', 'GET', null, authHeaders);
    
    await tester.test(`/wishlist/check/${testProductId}`, 'GET', null, authHeaders);
    
    await tester.test(`/wishlist/${testProductId}`, 'DELETE', null, authHeaders);
  }

  // =================== ORDER ENDPOINTS ===================
  log(colors.bold + colors.blue, '\n📦 ORDER ENDPOINTS');
  console.log('='.repeat(50));

  await tester.test('/orders', 'GET', null, authHeaders);
  
  // Get an order ID for testing
  const ordersResponse = await tester.test('/orders', 'GET', null, authHeaders);
  if (ordersResponse && ordersResponse.length > 0) {
    const testOrderId = ordersResponse[0]._id;
    await tester.test(`/orders/${testOrderId}`, 'GET', null, authHeaders);
  }
  
  // Admin order endpoints
  await tester.test('/orders/admin/all', 'GET', null, authHeaders);

  // =================== REVIEW ENDPOINTS ===================
  log(colors.bold + colors.blue, '\n⭐ REVIEW ENDPOINTS');
  console.log('='.repeat(50));

  if (testProductId) {
    await tester.test(`/products/${testProductId}/reviews`, 'GET');
    
    // Get all products to find one without review from this user
    const allProductsResponse = await tester.test('/products?limit=5');
    if (allProductsResponse && allProductsResponse.products && allProductsResponse.products.length > 1) {
      // Use the second product for review test
      const reviewProductId = allProductsResponse.products[1]._id;
      
      await tester.test(`/products/${reviewProductId}/reviews`, 'POST', {
        rating: 5,
        comment: 'Great product! Love it!'
      }, authHeaders);
      
      // Get reviews again to see the new one
      await tester.test(`/products/${reviewProductId}/reviews`, 'GET');
    }
  }
  
  // Admin review endpoints
  await tester.test('/reviews/admin', 'GET', null, authHeaders);

  // =================== SEARCH ENDPOINTS ===================
  log(colors.bold + colors.blue, '\n🔍 SEARCH ENDPOINTS');
  console.log('='.repeat(50));

  await tester.test('/search?q=Nike');
  await tester.test('/search?q=Adidas');
  await tester.test('/search/popular', 'GET');
  await tester.test('/search/suggestions?q=Air');

  // =================== ADMIN ENDPOINTS (if accessible) ===================
  log(colors.bold + colors.blue, '\n👑 ADMIN ENDPOINTS (Basic Check)');
  console.log('='.repeat(50));

  await tester.test('/admin/users', 'GET', null, authHeaders);
  await tester.test('/admin/products', 'GET', null, authHeaders);
  await tester.test('/admin/orders', 'GET', null, authHeaders);
  await tester.test('/admin/dashboard', 'GET', null, authHeaders);

  // Print final summary
  tester.printSummary();
}

// Run the tests
testAllEndpoints().catch(error => {
  console.error('❌ Test execution failed:', error.message);
});
