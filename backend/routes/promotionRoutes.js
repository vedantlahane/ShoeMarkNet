const express = require('express');
const { getActivePromotions } = require('../controllers/promotionController');

const router = express.Router();

router.get('/', getActivePromotions);

module.exports = router;
