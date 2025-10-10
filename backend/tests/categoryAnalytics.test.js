const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = require('../app');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

const buildAddress = () => ({
  fullName: 'Test User',
  addressLine1: '123 Test St',
  city: 'Testville',
  state: 'TS',
  postalCode: '12345',
  country: 'Testland',
  phone: '+1234567890'
});

const createAdminToken = async () => {
  const adminUser = await User.create({
    name: 'Admin User',
    email: `admin-${Date.now()}@example.com`,
    password: 'SecurePass123!',
    role: 'admin'
  });

  return jwt.sign(
    { id: adminUser._id, role: adminUser.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

describe('GET /api/admin/analytics/categories/:categoryId', () => {
  it('returns aggregated analytics for category and caches subsequent requests', async () => {
    const token = await createAdminToken();
    const customer = await User.create({
      name: 'Customer',
      email: `customer-${Date.now()}@example.com`,
      password: 'Customer123!'
    });

    const category = await Category.create({
      name: 'Sneakers',
      description: 'Test sneakers'
    });

    const product = await Product.create({
      name: 'Runner Sneaker',
      description: 'Comfortable running sneaker.',
      brand: 'TestBrand',
      category: category._id,
      price: 100,
      countInStock: 100,
      images: ['image.jpg']
    });

    await Order.create({
      user: customer._id,
      items: [{ product: product._id, quantity: 2, price: 100 }],
      paymentMethod: 'credit_card',
      shippingAddress: buildAddress(),
      status: 'delivered',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    });

    await Order.create({
      user: customer._id,
      items: [{ product: product._id, quantity: 1, price: 150 }],
      paymentMethod: 'credit_card',
      shippingAddress: buildAddress(),
      status: 'processing',
      createdAt: new Date()
    });

    const firstResponse = await request(app)
      .get(`/api/admin/analytics/categories/${category._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(firstResponse.body.success).toBe(true);
    expect(firstResponse.body.data.totals.totalOrders).toBe(2);
    expect(firstResponse.body.data.totals.totalUnits).toBe(3);
    expect(firstResponse.body.data.totals.totalRevenue).toBeCloseTo(350, 5);
    expect(firstResponse.body.data.topProducts[0].id).toBe(String(product._id));
    expect(firstResponse.body.meta.cached).toBe(false);

    const secondResponse = await request(app)
      .get(`/api/admin/analytics/categories/${category._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(secondResponse.body.meta.cached).toBe(true);
  });

  it('returns 404 for nonexistent category', async () => {
    const token = await createAdminToken();
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .get(`/api/admin/analytics/categories/${fakeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.error.message).toMatch(/Category not found/i);
  });
});
