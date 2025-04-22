const User = require('../models/User');
const Address = require('../models/Address');
const bcrypt = require('bcrypt');

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== req.user.id) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      { name, email, phone }, 
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
};

// Get user addresses
const getUserAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.id });
    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching addresses', error: error.message });
  }
};

// Add user address
const addUserAddress = async (req, res) => {
  try {
    const { 
      fullName, 
      addressLine1, 
      addressLine2, 
      city, 
      state, 
      postalCode, 
      country, 
      phone, 
      isDefault 
    } = req.body;
    
    // If this is set as default, unset any existing default
    if (isDefault) {
      await Address.updateMany(
        { user: req.user.id, isDefault: true },
        { isDefault: false }
      );
    }
    
    const address = new Address({
      user: req.user.id,
      fullName,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefault: isDefault || false
    });
    
    await address.save();
    
    res.status(201).json({ message: 'Address added successfully', address });
  } catch (error) {
    res.status(500).json({ message: 'Error adding address', error: error.message });
  }
};

// Update user address
const updateUserAddress = async (req, res) => {
  try {
    const addressId = req.params.addressId;
    const updateData = req.body;
    
    // Find the address
    const address = await Address.findById(addressId);
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    // Check if address belongs to user
    if (address.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this address' });
    }
    
    // If setting as default, unset any existing default
    if (updateData.isDefault) {
      await Address.updateMany(
        { user: req.user.id, isDefault: true },
        { isDefault: false }
      );
    }
    
    // Update the address
    const updatedAddress = await Address.findByIdAndUpdate(
      addressId,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({ message: 'Address updated successfully', address: updatedAddress });
  } catch (error) {
    res.status(500).json({ message: 'Error updating address', error: error.message });
  }
};

// Delete user address
const deleteUserAddress = async (req, res) => {
  try {
    const addressId = req.params.addressId;
    
    // Find the address
    const address = await Address.findById(addressId);
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    // Check if address belongs to user
    if (address.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this address' });
    }
    
    await address.remove();
    
    res.status(200).json({ message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting address', error: error.message });
  }
};

// Get all users (Admin)
const getAllUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filters = {};
    if (role) filters.role = role;
    if (search) {
      filters.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }
    
    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Execute query
    const users = await User.find(filters)
      .select('-password')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    
    // Get total count for pagination
    const total = await User.countDocuments(filters);
    
    res.status(200).json({
      users,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Update user (Admin)
const updateUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { name, email, role, isActive } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    
    await user.save();
    
    res.status(200).json({ 
      message: 'User updated successfully', 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

// Delete user (Admin)
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't allow deleting self
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    await user.remove();
    
    // Also delete user's addresses
    await Address.deleteMany({ user: userId });
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  getAllUsers,
  updateUser,
  deleteUser
};
