const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api';

// Test credentials
let adminToken = '';
let userToken = '';
let testUserId = '';
let testProductId = '';

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
    log(colors.bold + colors.blue, '📊 ADMIN PRIVILEGE TEST SUMMARY');
    console.log('='.repeat(60));
    log(colors.blue, `Total Tests: ${this.totalTests}`);
    log(colors.green, `Passed: ${this.passedTests}`);
    log(colors.red, `Failed: ${this.failedTests}`);
    log(colors.yellow, `Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);
    console.log('='.repeat(60));
  }
}

async function testWithAdminPrivileges() {
  const tester = new EndpointTester();
  
  console.log('🚀 Starting comprehensive endpoint testing with ADMIN PRIVILEGES...\n');

  // =================== AUTHENTICATION TESTS ===================
  log(colors.bold + colors.blue, '🔐 AUTHENTICATION ENDPOINTS');
  console.log('='.repeat(50));

  // Login with admin user
  const adminLoginData = {
    email: 'admin@shoemarnet.com',
    password: 'adminpass123'
  };
  
        const adminLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'admin@shoemarnet.com',
        password: 'adminpass123'  // Correct admin password
      });
      if (adminLoginResponse.data) {
        adminToken = adminLoginResponse.data.token;
        log(colors.green, `🎯 Admin logged in as: ${adminLoginResponse.data.user.name} (Role: ${adminLoginResponse.data.user.role})`);
      }

  // Login with regular user too
  const userLoginData = {
    email: 'vedant@example.com',
    password: 'password123'
  };
  
  const userLoginResponse = await tester.test('/auth/login', 'POST', userLoginData);
  if (userLoginResponse) {
    userToken = userLoginResponse.token;
    testUserId = userLoginResponse.user.id;
    log(colors.green, `🎯 User logged in as: ${userLoginResponse.user.name}`);
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

  const userAuthHeaders = { Authorization: `Bearer ${userToken}` };
  const adminAuthHeaders = { Authorization: `Bearer ${adminToken}` };
  
  await tester.test('/users/profile', 'GET', null, userAuthHeaders);
  await tester.test('/users/profile', 'PUT', { name: 'Updated Name' }, userAuthHeaders);
  await tester.test('/users/addresses', 'GET', null, userAuthHeaders);
  await tester.test('/users/admin', 'GET', null, adminAuthHeaders); // Admin endpoint

  // =================== PRODUCT ENDPOINTS ===================
  log(colors.bold + colors.blue, '\n👟 PRODUCT ENDPOINTS');
  console.log('='.repeat(50));

  await tester.test('/products');
  await tester.test('/products?page=1&limit=5');
  await tester.test('/products?category=Nike');
  await tester.test('/products?minPrice=50&maxPrice=200');
  
  // Get a product ID for further tests
  const productsResponse = await tester.test('/products?limit=1');
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

  await tester.test('/cart', 'GET', null, userAuthHeaders);
  
  if (testProductId) {
    await tester.test('/cart', 'POST', {
      productId: testProductId,
      quantity: 2,
      variant: { size: '10' }
    }, userAuthHeaders);
    
    await tester.test('/cart', 'GET', null, userAuthHeaders);
    
    // Get cart to find an item ID for update/remove
    const cartResponse = await tester.test('/cart', 'GET', null, userAuthHeaders);
    if (cartResponse && cartResponse.items && cartResponse.items.length > 0) {
      const itemId = cartResponse.items[0]._id;
      await tester.test(`/cart/${itemId}`, 'PUT', {
        quantity: 3
      }, userAuthHeaders);
      
      await tester.test(`/cart/${itemId}`, 'DELETE', null, userAuthHeaders);
    }
  }

  await tester.test('/cart', 'DELETE', null, userAuthHeaders);

  // =================== WISHLIST ENDPOINTS ===================
  log(colors.bold + colors.blue, '\n❤️  WISHLIST ENDPOINTS');
  console.log('='.repeat(50));

  await tester.test('/wishlist', 'GET', null, userAuthHeaders);
  
  if (testProductId) {
    await tester.test('/wishlist', 'POST', {
      productId: testProductId
    }, userAuthHeaders);
    
    await tester.test('/wishlist', 'GET', null, userAuthHeaders);
    
    await tester.test(`/wishlist/check/${testProductId}`, 'GET', null, userAuthHeaders);
    
    await tester.test(`/wishlist/${testProductId}`, 'DELETE', null, userAuthHeaders);
  }

  // =================== ORDER ENDPOINTS ===================
  log(colors.bold + colors.blue, '\n📦 ORDER ENDPOINTS');
  console.log('='.repeat(50));

  await tester.test('/orders', 'GET', null, userAuthHeaders);
  
  // Get an order ID for testing
  const ordersResponse = await tester.test('/orders', 'GET', null, userAuthHeaders);
  if (ordersResponse && ordersResponse.length > 0) {
    const testOrderId = ordersResponse[0]._id;
    await tester.test(`/orders/${testOrderId}`, 'GET', null, userAuthHeaders);
  }
  
  // Admin order endpoints
  await tester.test('/orders/admin/all', 'GET', null, adminAuthHeaders);

  // =================== REVIEW ENDPOINTS ===================
  log(colors.bold + colors.blue, '\n⭐ REVIEW ENDPOINTS');
  console.log('='.repeat(50));

  if (testProductId) {
    await tester.test(`/products/${testProductId}/reviews`, 'GET');
    
    // Get all products to find one without review from this user
    const allProductsResponse = await tester.test('/products?limit=8');
    if (allProductsResponse && allProductsResponse.products && allProductsResponse.products.length > 1) {
      // Try different products for review test
      for (let i = 1; i < Math.min(allProductsResponse.products.length, 4); i++) {
        const reviewProductId = allProductsResponse.products[i]._id;
        const reviewResult = await tester.test(`/products/${reviewProductId}/reviews`, 'POST', {
          rating: 5,
          comment: `Great product! Review from test ${i}`
        }, userAuthHeaders);
        
        if (reviewResult) {
          // If successful, get reviews again
          await tester.test(`/products/${reviewProductId}/reviews`, 'GET');
          break;
        }
      }
    }
  }
  
  // Admin review endpoints
  await tester.test('/reviews/admin', 'GET', null, adminAuthHeaders);

  // =================== SEARCH ENDPOINTS ===================
  log(colors.bold + colors.blue, '\n🔍 SEARCH ENDPOINTS');
  console.log('='.repeat(50));

  await tester.test('/search?q=Nike');
  await tester.test('/search?q=Adidas');
  await tester.test('/search/popular', 'GET');
  await tester.test('/search/suggestions?q=Air');

  // =================== ADMIN ENDPOINTS ===================
  log(colors.bold + colors.blue, '\n👑 ADMIN ENDPOINTS (With Admin Privileges)');
  console.log('='.repeat(50));

  await tester.test('/admin/users', 'GET', null, adminAuthHeaders);
  await tester.test('/admin/products', 'GET', null, adminAuthHeaders);
  await tester.test('/admin/orders', 'GET', null, adminAuthHeaders);
  await tester.test('/admin/dashboard', 'GET', null, adminAuthHeaders);

  // Print final summary
  tester.printSummary();
}

// Run the tests
testWithAdminPrivileges().catch(error => {
  console.error('❌ Test execution failed:', error.message);
});
