// utils/leadScoring.js

const User = require('../models/User');

// Lead scoring configuration
const LEAD_SCORE_ACTIONS = {
  // Account actions
  register: 10,
  verify_email: 15,
  complete_profile: 20,
  
  // Engagement actions
  login: 2,
  view_product: 3,
  search_product: 2,
  
  // High-intent actions
  add_to_cart: 10,
  add_to_wishlist: 8,
  remove_from_cart: -5,
  
  // Purchase actions
  place_order: 50,
  complete_payment: 30,
  leave_review: 15,
  
  // Negative actions
  cancel_order: -20,
  return_product: -15,
  inactive_30_days: -10,
  inactive_60_days: -20,
};

// Lead score thresholds
const LEAD_SCORE_THRESHOLDS = {
  cold: 0,
  warm: 50,
  hot: 100,
  customer: 200,
  vip: 500,
};

// Update user's lead score
const updateLeadScore = async (userId, action, options = {}) => {
  const { session } = options;
  
  try {
    // Get the score value for the action
    const scoreChange = LEAD_SCORE_ACTIONS[action];
    
    if (scoreChange === undefined) {
      console.warn(`Unknown lead score action: ${action}`);
      return null;
    }
    
    // Find and update user score
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        $inc: { score: scoreChange },
        $set: { lastLogin: new Date() } // Update last activity
      },
      { 
        new: true, 
        session,
        runValidators: true
      }
    );
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Log the action (you might want to create a separate collection for this)
    console.log(`Lead score updated: User ${userId}, Action: ${action}, Change: ${scoreChange}, New Score: ${user.score}`);
    
    return {
      userId: user._id,
      score: user.score,
      action,
      scoreChange,
      status: getLeadStatus(user.score)
    };
  } catch (error) {
    console.error('Error updating lead score:', error);
    // Don't throw the error, just log it to prevent breaking the main flow
    return null;
  }
};

// Get lead status based on score
const getLeadStatus = (score) => {
  if (score >= LEAD_SCORE_THRESHOLDS.vip) return 'vip';
  if (score >= LEAD_SCORE_THRESHOLDS.customer) return 'customer';
  if (score >= LEAD_SCORE_THRESHOLDS.hot) return 'hot';
  if (score >= LEAD_SCORE_THRESHOLDS.warm) return 'warm';
  return 'cold';
};

// Get user's current lead status
const getUserLeadStatus = async (userId) => {
  try {
    const user = await User.findById(userId).select('score');
    if (!user) return null;
    
    return {
      score: user.score,
      status: getLeadStatus(user.score)
    };
  } catch (error) {
    console.error('Error getting user lead status:', error);
    return null;
  }
};

// Bulk update lead scores (for scheduled tasks)
const bulkUpdateLeadScores = async (updates) => {
  const results = [];
  
  for (const update of updates) {
    try {
      const result = await updateLeadScore(update.userId, update.action);
      if (result) {
        results.push({ success: true, ...result });
      }
    } catch (error) {
      results.push({ 
        success: false, 
        userId: update.userId, 
        error: error.message 
      });
    }
  }
  
  return results;
};

// Calculate lead score decay for inactive users
const applyLeadScoreDecay = async () => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now - 60 * 24 * 60 * 60 * 1000);
    
    // Find users inactive for 30-60 days
    const inactiveUsers30 = await User.find({
      lastLogin: { $lt: thirtyDaysAgo, $gte: sixtyDaysAgo },
      score: { $gt: 0 } // Only decay if score is positive
    });
    
    // Find users inactive for 60+ days
    const inactiveUsers60 = await User.find({
      lastLogin: { $lt: sixtyDaysAgo },
      score: { $gt: 0 }
    });
    
    // Apply decay
    const updates = [];
    
    for (const user of inactiveUsers30) {
      updates.push({
        userId: user._id,
        action: 'inactive_30_days'
      });
    }
    
    for (const user of inactiveUsers60) {
      updates.push({
        userId: user._id,
        action: 'inactive_60_days'
      });
    }
    
    return await bulkUpdateLeadScores(updates);
  } catch (error) {
    console.error('Error applying lead score decay:', error);
    throw error;
  }
};

// Get lead score analytics
const getLeadScoreAnalytics = async () => {
  try {
    const users = await User.find({}).select('score source');
    
    const analytics = {
      total: users.length,
      byStatus: {
        cold: 0,
        warm: 0,
        hot: 0,
        customer: 0,
        vip: 0
      },
      bySource: {},
      averageScore: 0,
      topScore: 0
    };
    
    let totalScore = 0;
    
    users.forEach(user => {
      const status = getLeadStatus(user.score);
      analytics.byStatus[status]++;
      
      // Track by source
      if (!analytics.bySource[user.source]) {
        analytics.bySource[user.source] = { count: 0, totalScore: 0 };
      }
      analytics.bySource[user.source].count++;
      analytics.bySource[user.source].totalScore += user.score;
      
      totalScore += user.score;
      if (user.score > analytics.topScore) {
        analytics.topScore = user.score;
      }
    });
    
    analytics.averageScore = users.length > 0 ? Math.round(totalScore / users.length) : 0;
    
    // Calculate average score by source
    Object.keys(analytics.bySource).forEach(source => {
      const sourceData = analytics.bySource[source];
      sourceData.averageScore = Math.round(sourceData.totalScore / sourceData.count);
    });
    
    return analytics;
  } catch (error) {
    console.error('Error getting lead score analytics:', error);
    throw error;
  }
};

// Get top leads
const getTopLeads = async (limit = 10, minScore = 0) => {
  try {
    const topLeads = await User.find({ score: { $gte: minScore } })
      .sort({ score: -1 })
      .limit(limit)
      .select('name email score source lastLogin');
    
    return topLeads.map(user => ({
      ...user.toObject(),
      status: getLeadStatus(user.score)
    }));
  } catch (error) {
    console.error('Error getting top leads:', error);
    throw error;
  }
};

// Reset user score (admin function)
const resetUserScore = async (userId, newScore = 0) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { score: newScore },
      { new: true }
    );
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return {
      userId: user._id,
      score: user.score,
      status: getLeadStatus(user.score)
    };
  } catch (error) {
    console.error('Error resetting user score:', error);
    throw error;
  }
};

module.exports = {
  updateLeadScore,
  getLeadStatus,
  getUserLeadStatus,
  bulkUpdateLeadScores,
  applyLeadScoreDecay,
  getLeadScoreAnalytics,
  getTopLeads,
  resetUserScore,
  LEAD_SCORE_ACTIONS,
  LEAD_SCORE_THRESHOLDS
};