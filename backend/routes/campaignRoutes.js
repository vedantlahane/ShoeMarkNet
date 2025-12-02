const express = require('express');
const { getActiveCampaigns, getCampaignBySlug } = require('../controllers/campaignController');

const router = express.Router();

router.get('/active', getActiveCampaigns);
router.get('/:slug', getCampaignBySlug);

module.exports = router;
