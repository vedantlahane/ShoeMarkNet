const asyncHandler = require('express-async-handler');
const Campaign = require('../models/Campaign');

// @desc    Get all active campaigns
// @route   GET /api/campaigns/active
// @access  Public
exports.getActiveCampaigns = asyncHandler(async (req, res, next) => {
    const now = new Date();

    const campaigns = await Campaign.find({
        status: 'active',
        isActive: true,
        isPublic: true,
        startDate: { $lte: now },
        endDate: { $gte: now }
    })
        .sort({ priority: -1, endDate: 1 }) // High priority first, then ending soonest
        .select('name slug description type discount startDate endDate bannerImage ctaUrl marketing.hashtags');

    res.status(200).json({
        success: true,
        count: campaigns.length,
        data: campaigns
    });
});

// @desc    Get single campaign by slug
// @route   GET /api/campaigns/:slug
// @access  Public
exports.getCampaignBySlug = asyncHandler(async (req, res, next) => {
    const campaign = await Campaign.findOne({
        slug: req.params.slug,
        isActive: true,
        isPublic: true
    });

    if (!campaign) {
        res.status(404);
        throw new Error('Campaign not found');
    }

    res.status(200).json({
        success: true,
        data: campaign
    });
});
