const mongoose = require('mongoose');

const { computeRealtimeStats, stopRealtimeLoop } = require('../services/realtimeService');
const Order = require('../models/Order');
const User = require('../models/User');

const buildAddress = () => ({
  fullName: 'Realtime User',
  addressLine1: '1 Main St',
  city: 'Realtime',
  state: 'RT',
  postalCode: '54321',
  country: 'Realtime',
  phone: '+1234567890'
});

describe('Realtime stats calculations', () => {
  afterEach(() => {
    stopRealtimeLoop();
  });

  it('computes daily metrics correctly', async () => {
    const userToday = await User.create({
      name: 'Realtime Admin',
      email: `rt-${Date.now()}@example.com`,
      password: 'Password123!',
      lastLogin: new Date()
    });

    const userInactive = await User.create({
      name: 'Inactive User',
      email: `inactive-${Date.now()}@example.com`,
      password: 'Password123!',
      lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000)
    });

    const productId = new mongoose.Types.ObjectId();

    await Order.create({
      user: userToday._id,
      items: [{ product: productId, quantity: 1, price: 120 }],
      paymentMethod: 'credit_card',
      shippingAddress: buildAddress(),
      status: 'processing',
      createdAt: new Date()
    });

    await Order.create({
      user: userToday._id,
      items: [{ product: productId, quantity: 2, price: 80 }],
      paymentMethod: 'credit_card',
      shippingAddress: buildAddress(),
      status: 'cancelled',
      createdAt: new Date()
    });

    await Order.create({
      user: userToday._id,
      items: [{ product: productId, quantity: 1, price: 150 }],
      paymentMethod: 'credit_card',
      shippingAddress: buildAddress(),
      status: 'delivered',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    });

    const stats = await computeRealtimeStats();

    expect(stats.ordersToday).toBe(1);
    expect(stats.pendingOrders).toBe(1);
    expect(stats.activeUsers).toBe(1);
    expect(stats.revenueToday).toBeCloseTo(120, 5);
  });
});
