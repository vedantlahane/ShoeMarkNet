// controllers/leadScoreController.js

const User = require('../models/User');

// Function to update lead score
const updateLeadScore = async (userId, action, options = {}) => {
  try {
    // Extract session if provided (for transaction support)
    const { session } = options;
    
    const user = await User.findById(userId).session(session);
    if (!user) {
      console.warn(`User ${userId} not found for lead score update`);
      return;
    }

    let scoreChange = 0;

    switch (action) {
      case 'register':
        scoreChange = user.source === 'referral' ? 10 : 5;
        break;
      case 'login':
        scoreChange = 2;
        break;
      case 'view_product':
        scoreChange = 3;
        break;
      case 'add_to_cart':
        scoreChange = 5;
        break;
      case 'add_to_wishlist':
        scoreChange = 3;
        break;
      case 'place_order':
        scoreChange = 10;
        break;
      case 'abandoned_cart':
        scoreChange = -5;
        break;
      case 'no_purchase_after_views':
        scoreChange = -5;
        break;
      default:
        return;
    }

    // Update the user's lead score
    user.score += scoreChange;
    await user.save({ session });

    console.log(`Lead score updated for user ${userId}: ${scoreChange} (new score: ${user.score})`);
  } catch (error) {
    console.error('Error updating lead score:', error);
    // Don't throw error to prevent breaking the main flow
  }
};

module.exports = { updateLeadScore };