const request = require('supertest');
const mongoose = require('mongoose');

const app = require('../app');
const Campaign = require('../models/Campaign');

const createCampaign = (overrides = {}) => ({
  name: overrides.name || `Campaign ${Math.random().toString(36).slice(2, 6)}`,
  type: overrides.type || 'promotion',
  targetAudience: overrides.targetAudience || { segments: ['all'], specificUsers: [] },
  discount: overrides.discount || { type: 'percentage', value: 10 },
  startDate: overrides.startDate || new Date(Date.now() - 60 * 60 * 1000),
  endDate: overrides.endDate || new Date(Date.now() + 60 * 60 * 1000),
  createdBy: overrides.createdBy || new mongoose.Types.ObjectId(),
  status: overrides.status || 'active',
  isActive: overrides.isActive !== undefined ? overrides.isActive : true,
  isPublic: overrides.isPublic !== undefined ? overrides.isPublic : true,
  priority: overrides.priority !== undefined ? overrides.priority : 0,
  bannerImage: overrides.bannerImage,
  ctaUrl: overrides.ctaUrl || 'https://example.com'
});

describe('GET /api/promotions', () => {
  it('returns only active public promotions sorted by priority', async () => {
    await Campaign.create([
      createCampaign({ name: 'Public High Priority', priority: 5 }),
      createCampaign({ name: 'Public Low Priority', priority: 1 }),
      createCampaign({ name: 'Non Public', isPublic: false }),
      createCampaign({ name: 'Expired', endDate: new Date(Date.now() - 2 * 60 * 60 * 1000) }),
      createCampaign({ name: 'Paused', status: 'paused' })
    ]);

    const response = await request(app).get('/api/promotions');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.promotions).toHaveLength(2);
    expect(response.body.data.promotions[0].name).toBe('Public High Priority');
    expect(response.body.data.promotions[1].name).toBe('Public Low Priority');
    expect(response.body.data.promotions[0].priority).toBeGreaterThanOrEqual(response.body.data.promotions[1].priority);
  });

  it('returns empty list when no promotions are active', async () => {
    await request(app)
      .get('/api/promotions')
      .expect(200)
      .expect(res => {
        expect(res.body.data.promotions).toEqual([]);
        expect(res.body.meta.count).toBe(0);
      });
  });
});
