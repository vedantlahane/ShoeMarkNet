const asyncHandler = require('express-async-handler');
const Campaign = require('../models/Campaign');

const buildPromotionPayload = (campaign) => ({
  id: campaign._id,
  name: campaign.name,
  description: campaign.description,
  bannerImage: campaign.bannerImage || campaign.marketing?.bannerImage || null,
  ctaUrl: campaign.ctaUrl || campaign.marketing?.landingPageUrl || null,
  priority: campaign.priority,
  startDate: campaign.startDate,
  endDate: campaign.endDate,
  code: campaign.code,
  type: campaign.type,
  discount: campaign.discount,
  metadata: {
    status: campaign.status,
    isActive: campaign.isActive
  }
});

/**
 * @description Fetches all public, active promotions sorted by priority.
 * @route GET /api/promotions
 * @access Public
 */
const getActivePromotions = asyncHandler(async (req, res) => {
  const now = new Date();

  const promotions = await Campaign.find({
    isPublic: true,
    isActive: true,
    status: 'active',
    startDate: { $lte: now },
    endDate: { $gte: now }
  })
    .sort({ priority: -1, startDate: 1 })
    .lean();

  const payload = promotions.map(buildPromotionPayload);

  if (typeof res.success === 'function') {
    return res.success('Active promotions retrieved successfully', { promotions: payload }, {
      count: payload.length
    });
  }

  return res.status(200).json({
    message: 'Active promotions retrieved successfully',
    promotions: payload,
    meta: { count: payload.length }
  });
});

module.exports = {
  getActivePromotions
};
