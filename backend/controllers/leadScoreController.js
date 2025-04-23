const User = require('../models/User');

// Function to update lead score
const updateLeadScore = async (userId, action) => {
  try {
    const user = await User.findById(userId);
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
    await user.save();

    console.log(`Lead score updated for user ${userId}: ${scoreChange}`);
  } catch (error) {
    console.error('Error updating lead score:', error);
  }
};

module.exports = { updateLeadScore };
