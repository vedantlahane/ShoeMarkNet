const express = require('express');
const UserController = require('../controllers/userController');

const router = express.Router();
const userController = new UserController();

router.post('/users', userController.createUser);
router.get('/users/:id', userController.getUser);
router.delete('/users/:id', userController.deleteUser);

module.exports = router;