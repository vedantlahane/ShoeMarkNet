const User = require('../models/User');
const Address = require('../models/Address');
const SearchHistory = require('../models/SearchHistory');

/**
 * @description Get the profile of the authenticated user.
 * @route GET /api/users/profile
 * @access Private
 */
const getUserProfile = async (req, res) => {
  try {
    // Find the user by ID, excluding the password hash for security
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    // Handle any server-side errors
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

/**
 * @description Update the profile of the authenticated user.
 * @route PUT /api/users/profile
 * @access Private
 */
const updateUserProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    // If the email is being updated, check if it's already in use by another user
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== req.user.id) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Find and update the user, returning the new document and running validators
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

/**
 * @description Change the password for the authenticated user.
 * @route PUT /api/users/profile/password
 * @access Private
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Use the Mongoose instance method to compare the current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
    
    // Hash the new password and save the user document
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
};

/**
 * @description Get all addresses for the authenticated user.
 * @route GET /api/users/addresses
 * @access Private
 */
const getUserAddresses = async (req, res) => {
  try {
    // Find all addresses belonging to the current user
    const addresses = await Address.find({ user: req.user.id });
    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching addresses', error: error.message });
  }
};

/**
 * @description Add a new address for the authenticated user.
 * @route POST /api/users/addresses
 * @access Private
 */
const addUserAddress = async (req, res) => {
  try {
    const { fullName, addressLine1, addressLine2, city, state, postalCode, country, phone, isDefault } = req.body;
    
    // If the new address is marked as default, unset the default flag on all other addresses
    if (isDefault) {
      await Address.updateMany(
        { user: req.user.id, isDefault: true },
        { isDefault: false }
      );
    }

    // Create a new address document
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

/**
 * @description Update a specific address for the authenticated user.
 * @route PUT /api/users/addresses/:addressId
 * @access Private
 */
const updateUserAddress = async (req, res) => {
  try {
    const addressId = req.params.addressId;
    const updateData = req.body;
    
    const address = await Address.findById(addressId);
    if (!address) return res.status(404).json({ message: 'Address not found' });
    
    // Ensure the authenticated user owns the address
    if (address.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this address' });
    }
    
    // If the address is being set as default, update all others first
    if (updateData.isDefault) {
      await Address.updateMany(
        { user: req.user.id, isDefault: true },
        { isDefault: false }
      );
    }
    
    // Find and update the address
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

/**
 * @description Delete a specific address for the authenticated user.
 * @route DELETE /api/users/addresses/:addressId
 * @access Private
 */
const deleteUserAddress = async (req, res) => {
  try {
    const addressId = req.params.addressId;
    const address = await Address.findById(addressId);
    
    if (!address) return res.status(404).json({ message: 'Address not found' });
    
    // Ensure the authenticated user owns the address
    if (address.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this address' });
    }
    
    // Delete the address
    await address.remove();
    res.status(200).json({ message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting address', error: error.message });
  }
};

// ====================================================================
// ========================= ADMIN ROUTES =============================
// ====================================================================

/**
 * @description Get all users with optional search, filtering, and pagination.
 * @route GET /api/users
 * @access Private/Admin
 */
const getAllUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;
    const filters = {};
    
    // Build the query filters
    if (role) filters.role = role;
    if (search) {
      // Case-insensitive search on name and email fields
      filters.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const users = await User.find(filters)
      .select('-password')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }); // Sort by most recent first
    
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

/**
 * @description Update a user's profile by their ID (Admin only).
 * @route PUT /api/users/:userId
 * @access Private/Admin
 */
const updateUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { name, email, role, isActive } = req.body;
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Update user properties only if they are provided in the request body
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

/**
 * @description Delete a user and their associated addresses by ID (Admin only).
 * @route DELETE /api/users/:userId
 * @access Private/Admin
 */
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Prevent an admin from deleting their own account
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    // Remove the user and all of their addresses
    await user.remove();
    await Address.deleteMany({ user: userId });
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

/**
 * @description Bulk update multiple users (Admin only).
 * @route POST /api/users/bulk-update
 * @access Private/Admin
 */
const bulkUpdateUsers = async (req, res) => {
  try {
    const { userIds, updates } = req.body;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'Invalid userIds array' });
    }
    
    if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'Invalid updates object' });
    }
    
    const bulkOps = userIds.map(userId => ({
      updateOne: {
        filter: { _id: userId },
        update: { $set: updates }
      }
    }));
    
    const result = await User.bulkWrite(bulkOps);
    
    res.status(200).json({ 
      message: 'Users updated successfully',
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error bulk updating users', error: error.message });
  }
};

/**
 * @description Get the authenticated user's search history with pagination.
 * @route GET /api/users/search-history
 * @access Private
 */
const getUserSearchHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const searchHistory = await SearchHistory.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await SearchHistory.countDocuments({ user: req.user.id });
    
    res.status(200).json({
      searchHistory,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching search history', error: error.message });
  }
};

/**
 * @description Clear the authenticated user's search history.
 * @route DELETE /api/users/search-history
 * @access Private
 */
const clearUserSearchHistory = async (req, res) => {
  try {
    await SearchHistory.deleteMany({ user: req.user.id });
    res.status(200).json({ message: 'Search history cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing search history', error: error.message });
  }
};

/**
 * @description Update the authenticated user's notification preferences.
 * @route PUT /api/users/preferences
 * @access Private
 */
const updateUserPreferences = async (req, res) => {
  try {
    const { newsletter, marketing } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          'preferences.newsletter': newsletter,
          'preferences.marketing': marketing
        }
      },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ 
      message: 'Preferences updated successfully', 
      preferences: user.preferences 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating preferences', error: error.message });
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
  deleteUser,
  bulkUpdateUsers,
  getUserSearchHistory,
  clearUserSearchHistory,
  updateUserPreferences
};
