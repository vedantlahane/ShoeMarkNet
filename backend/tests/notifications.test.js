const request = require('supertest');
const jwt = require('jsonwebtoken');

const app = require('../app');
const Notification = require('../models/Notification');
const User = require('../models/User');

const createAdminToken = async () => {
  const adminUser = await User.create({
    name: 'Admin Notifications',
    email: `admin-notify-${Date.now()}@example.com`,
    password: 'SecurePass123!',
    role: 'admin'
  });

  return jwt.sign(
    { id: adminUser._id, role: adminUser.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

describe('Admin notification endpoints', () => {
  it('fetches notifications with filters and pagination', async () => {
    const token = await createAdminToken();

    await Notification.create([
      { title: 'Order Spike', message: 'Orders increased by 40%', category: 'orders', priority: 'high' },
      { title: 'Low Inventory', message: 'Inventory is low', category: 'inventory', priority: 'critical' },
      { title: 'Marketing Update', message: 'New campaign launched', category: 'marketing', priority: 'medium', read: true }
    ]);

    const response = await request(app)
      .get('/api/admin/notifications?status=unread&category=orders')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.notifications).toHaveLength(1);
    expect(response.body.data.notifications[0].category).toBe('orders');
    expect(response.body.meta.pagination.total).toBe(1);
  });

  it('marks a notification as read', async () => {
    const token = await createAdminToken();
    const notification = await Notification.create({
      title: 'Critical Alert',
      message: 'System outage detected',
      category: 'system',
      priority: 'critical'
    });

    const response = await request(app)
      .patch(`/api/admin/notifications/${notification._id}/read`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.read).toBe(true);

    const updated = await Notification.findById(notification._id);
    expect(updated.read).toBe(true);
    expect(updated.readAt).toBeInstanceOf(Date);
  });

  it('marks all notifications as read', async () => {
    const token = await createAdminToken();
    await Notification.create([
      { title: 'N1', message: 'msg', category: 'general' },
      { title: 'N2', message: 'msg', category: 'general' }
    ]);

    const response = await request(app)
      .patch('/api/admin/notifications/read-all')
      .set('Authorization', `Bearer ${token}`)
      .send({ category: 'general' })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.updated).toBe(2);

    const countUnread = await Notification.countDocuments({ read: false });
    expect(countUnread).toBe(0);
  });
});
