const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = require('../app');
const User = require('../models/User');
const Coupon = require('../models/Coupon');

const createUserAndToken = async (overrides = {}) => {
  const user = await User.create({
    name: overrides.name || 'Test User',
    email: overrides.email || `user-${Date.now()}@example.com`,
    password: overrides.password || 'Password123!',
    role: overrides.role || 'user'
  });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return { user, token };
};

describe('POST /api/orders/validate-coupon', () => {
  it('validates a coupon successfully', async () => {
    const { user, token } = await createUserAndToken();

    const coupon = await Coupon.create({
      code: 'SAVE10',
      type: 'percentage',
      value: 10,
      minPurchase: 100,
      usageLimit: { total: 10, perUser: 2 },
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    const response = await request(app)
      .post('/api/orders/validate-coupon')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: coupon.code, cartTotal: 200 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.discountAmount).toBeCloseTo(20, 5);
    expect(response.body.data.finalAmount).toBeCloseTo(180, 5);
    expect(response.body.meta.usageLimit.perUser).toBe(2);
  });

  it('fails validation when coupon is expired', async () => {
    const { token } = await createUserAndToken();

    await Coupon.create({
      code: 'OLD50',
      type: 'fixed',
      value: 50,
      minPurchase: 50,
      usageLimit: { total: 5, perUser: 1 },
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isActive: true
    });

    const response = await request(app)
      .post('/api/orders/validate-coupon')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: 'OLD50', cartTotal: 150 });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toMatch(/expired/i);
  });

  it('fails validation when minimum purchase not met', async () => {
    const { token } = await createUserAndToken();

    await Coupon.create({
      code: 'SAVE25',
      type: 'percentage',
      value: 25,
      minPurchase: 200,
      usageLimit: { total: 10, perUser: 1 },
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    const response = await request(app)
      .post('/api/orders/validate-coupon')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: 'SAVE25', cartTotal: 150 });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toMatch(/Minimum purchase/i);
  });

  it('fails validation when usage limit exceeded for user', async () => {
    const { user, token } = await createUserAndToken();

    const coupon = await Coupon.create({
      code: 'ONCE',
      type: 'fixed',
      value: 30,
      minPurchase: 50,
      usageLimit: { total: 10, perUser: 1 },
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    coupon.userUsage.set(String(user._id), 1);
    await coupon.save();

    const response = await request(app)
      .post('/api/orders/validate-coupon')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: 'ONCE', cartTotal: 120 });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toMatch(/maximum number of times/i);
  });
});
