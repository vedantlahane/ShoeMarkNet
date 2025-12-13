const express = require('express');
const router = express.Router();

const { getHomeOverview } = require('../controllers/homeController');

router.get('/overview', getHomeOverview);

module.exports = router;
