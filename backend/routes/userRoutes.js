const express = require('express');
const User = require('../models/user'); // Import the User model
const UserController = require('../controllers/userController');

const router = express.Router();
const userController = new UserController(User); // Pass the User model

// Change the routes to use the root path since they are already mounted on '/api/users'.
router.post('/', userController.createUser.bind(userController));
router.get('/:id', userController.getUser.bind(userController));
router.delete('/:id', userController.deleteUser.bind(userController));

module.exports = router;