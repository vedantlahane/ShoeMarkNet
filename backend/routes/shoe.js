const express = require('express');
const router = express.Router();
const ShoeController = require('../controllers/shoeController');

router.get('/', ShoeController.getAllShoes);
router.get('/:id', ShoeController.getShoeById);
router.get('/search', ShoeController.searchShoes);
router.get('/filter', ShoeController.filterShoes);

module.exports = router;