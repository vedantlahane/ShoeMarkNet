const User = require('../models/User');

/**
 * @description A service function to update a user's lead score based on their actions.
 * This function can be called from various controllers (e.g., cart, product, auth)
 * to track user engagement and intent. It supports Mongoose sessions for transactions.
 * @param {string} userId - The ID of the user to update.
 * @param {string} action - The action the user performed (e.g., 'login', 'place_order').
 * @param {object} options - Optional parameters, such as a Mongoose session.
 */
const updateLeadScore = async (userId, action, options = {}) => {
  try {
    // Extract the session from options, if provided.
    const { session } = options;
    
    // Find the user by ID. The `.session(session)` part ensures this operation
    // is part of a larger transaction if one is active.
    const user = await User.findById(userId).session(session);
    if (!user) {
      console.warn(`User ${userId} not found for lead score update`);
      return;
    }

    let scoreChange = 0;

    // Determine the score change based on the user's action
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
        // If the action is not recognized, do nothing
        return;
    }

    // Update the user's lead score in the database
    user.score += scoreChange;
    // Pass the session to the save operation to ensure atomicity
    await user.save({ session });

    console.log(`Lead score updated for user ${userId}: ${scoreChange} (new score: ${user.score})`);
  } catch (error) {
    console.error('Error updating lead score:', error);
    // Do not throw the error to avoid interrupting the main API flow
  }
};

module.exports = { updateLeadScore };
