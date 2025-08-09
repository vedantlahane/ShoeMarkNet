const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');
const Campaign = require('../models/Campaign');
const Setting = require('../models/Setting');
const asyncHandler = require('express-async-handler');

/**
 * @description Fetches key statistics for the admin dashboard.
 * @route GET /api/admin/dashboard/stats
 * @access Private/Admin
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    // Fetch all orders that are not cancelled to calculate revenue and order count
    const orders = await Order.find({ status: { $ne: 'cancelled' } });
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const orderCount = orders.length;

    // Get total counts for users and products
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();

    // Find and select low-stock products (count < 10) for a quick overview
    const lowStockProducts = await Product.find({ countInStock: { $lt: 10 } })
      .select('name countInStock')
      .limit(5);

    // Fetch the 5 most recent orders, populating user details
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    // Use MongoDB aggregation to find top-selling products
    const topSellingProducts = await Order.aggregate([
      { $unwind: '$items' }, // Deconstructs the items array into a stream of documents
      { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' } } }, // Groups by product ID and sums the quantity
      { $sort: { totalSold: -1 } }, // Sorts in descending order of total sold
      { $limit: 5 } // Takes the top 5
    ]);

    // Populate the product details from the `Product` model onto the aggregated results
    const topProducts = await Product.populate(topSellingProducts, {
      path: '_id',
      select: 'name price image'
    });

    const formattedTopProducts = topProducts.map(item => ({
      product: item._id,
      totalSold: item.totalSold
    }));

    res.status(200).json({
      totalRevenue,
      orderCount,
      userCount,
      productCount,
      lowStockProducts,
      recentOrders,
      topSellingProducts: formattedTopProducts
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
});

/**
 * @description Generates a sales report based on a date range and optional category filter.
 * @route GET /api/admin/reports/sales
 * @access Private/Admin
 */
const getSalesReport = asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const filter = {};
    if (Object.keys(dateFilter).length > 0) filter.createdAt = dateFilter;

    let orders = await Order.find(filter)
      .populate({
        path: 'items.product',
        select: 'name price category'
      });

    // Manually filter orders by category after fetching, as it's more complex to do directly in the query
    if (category) {
      orders = orders.filter(order =>
        order.items.some(item =>
          item.product && item.product.category &&
          item.product.category.toString() === category
        )
      );
    }

    const salesData = orders.map(order => ({
      orderId: order._id,
      date: order.createdAt,
      customer: order.user,
      total: order.totalPrice,
      status: order.status
    }));

    const totalSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    res.status(200).json({
      salesData,
      summary: {
        totalSales,
        totalOrders,
        averageOrderValue
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating sales report', error: error.message });
  }
});

/**
 * @description Generates an inventory report, including stock value and low/out-of-stock items.
 * @route GET /api/admin/reports/inventory
 * @access Private/Admin
 */
const getInventoryReport = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find()
      .select('name price countInStock category')
      .populate('category', 'name');

    // Calculate total inventory value
    const totalValue = products.reduce((sum, product) =>
      sum + (product.price * product.countInStock), 0
    );

    const categoryGroups = {};
    products.forEach(product => {
      const categoryName = product.category ? product.category.name : 'Uncategorized';
      if (!categoryGroups[categoryName]) {
        categoryGroups[categoryName] = {
          count: 0,
          value: 0,
          items: []
        };
      }
      categoryGroups[categoryName].count += 1;
      categoryGroups[categoryName].value += product.price * product.countInStock;
      categoryGroups[categoryName].items.push({
        id: product._id,
        name: product.name,
        price: product.price,
        stock: product.countInStock,
        value: product.price * product.countInStock
      });
    });

    const lowStockItems = products
      .filter(product => product.countInStock < 10)
      .map(product => ({
        id: product._id,
        name: product.name,
        price: product.price,
        stock: product.countInStock,
        category: product.category ? product.category.name : 'Uncategorized'
      }));

    const outOfStockItems = products
      .filter(product => product.countInStock === 0)
      .map(product => ({
        id: product._id,
        name: product.name,
        price: product.price,
        category: product.category ? product.category.name : 'Uncategorized'
      }));

    res.status(200).json({
      summary: {
        totalProducts: products.length,
        totalValue,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length
      },
      categoryBreakdown: categoryGroups,
      lowStockItems,
      outOfStockItems
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating inventory report', error: error.message });
  }
});

/**
 * @description Provides customer analytics, including source breakdown and top customers.
 * @route GET /api/admin/reports/customers
 * @access Private/Admin
 */
const getCustomerAnalytics = asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const userFilter = {};
    if (Object.keys(dateFilter).length > 0) userFilter.createdAt = dateFilter;

    // Get all users created within the specified date range
    const users = await User.find(userFilter).select('createdAt source score');
    const sourceBreakdown = {};
    users.forEach(user => {
      const source = user.source || 'direct';
      if (!sourceBreakdown[source]) {
        sourceBreakdown[source] = 0;
      }
      sourceBreakdown[source] += 1;
    });

    const orderFilter = {};
    if (Object.keys(dateFilter).length > 0) orderFilter.createdAt = dateFilter;
    
    // Fetch orders to calculate customer lifetime value
    const orders = await Order.find(orderFilter)
      .populate('user', 'name email');

    const customerValue = {};
    orders.forEach(order => {
      if (!order.user) return;
      const userId = order.user._id.toString();
      if (!customerValue[userId]) {
        customerValue[userId] = {
          user: {
            id: order.user._id,
            name: order.user.name,
            email: order.user.email
          },
          orderCount: 0,
          totalSpent: 0
        };
      }
      customerValue[userId].orderCount += 1;
      customerValue[userId].totalSpent += order.totalPrice;
    });

    const topCustomers = Object.values(customerValue)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    const customerAOV = Object.values(customerValue).map(customer => ({
      user: customer.user,
      averageOrderValue: customer.orderCount > 0 ?
        customer.totalSpent / customer.orderCount : 0
    })).sort((a, b) => b.averageOrderValue - a.averageOrderValue)
      .slice(0, 10);
    
    // Distribute users into lead score ranges
    const leadScoreRanges = {
      'Cold (0-20)': users.filter(user => user.score >= 0 && user.score <= 20).length,
      'Warm (21-50)': users.filter(user => user.score >= 21 && user.score <= 50).length,
      'Hot (51-80)': users.filter(user => user.score >= 51 && user.score <= 80).length,
      'Very Hot (81+)': users.filter(user => user.score >= 81).length
    };

    res.status(200).json({
      userCount: users.length,
      sourceBreakdown,
      topCustomers,
      customerAOV,
      leadScoreDistribution: leadScoreRanges
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating customer analytics', error: error.message });
  }
});

/**
 * @description Fetches all users and their lead score data for reporting.
 * @route GET /api/admin/reports/leads
 * @access Private/Admin
 */
const getLeadScoreData = asyncHandler(async (req, res) => {
  try {
    const users = await User.find()
      .select('name email score createdAt lastLogin')
      .sort({ score: -1 });

    const userData = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      score: user.score,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }));

    const scoreDistribution = {
      'Cold (0-20)': users.filter(user => user.score >= 0 && user.score <= 20).length,
      'Warm (21-50)': users.filter(user => user.score >= 21 && user.score <= 50).length,
      'Hot (51-80)': users.filter(user => user.score >= 51 && user.score <= 80).length,
      'Very Hot (81+)': users.filter(user => user.score >= 81).length
    };

    res.status(200).json({
      leads: userData,
      scoreDistribution
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lead score data', error: error.message });
  }
});

/**
 * @description Creates or updates system-wide settings.
 * @route POST /api/admin/settings
 * @access Private/Admin
 */
const updateSettings = asyncHandler(async (req, res) => {
  try {
    const {
      siteName, logo, contactEmail, supportPhone, shippingFee, taxRate,
      enableReviews, requireLoginForCheckout, maintenanceMode
    } = req.body;
    
    // Find the single settings document or create a new one
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting({});
    }

    // Update fields if they are present in the request body
    if (siteName !== undefined) settings.siteName = siteName;
    if (logo !== undefined) settings.logo = logo;
    if (contactEmail !== undefined) settings.contactEmail = contactEmail;
    if (supportPhone !== undefined) settings.supportPhone = supportPhone;
    if (shippingFee !== undefined) settings.shippingFee = shippingFee;
    if (taxRate !== undefined) settings.taxRate = taxRate;
    if (enableReviews !== undefined) settings.enableReviews = enableReviews;
    if (requireLoginForCheckout !== undefined) settings.requireLoginForCheckout = requireLoginForCheckout;
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;

    await settings.save();
    res.status(200).json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings', error: error.message });
  }
});

/**
 * @description Creates a new marketing campaign.
 * @route POST /api/admin/campaigns
 * @access Private/Admin
 */
const createCampaign = asyncHandler(async (req, res) => {
  try {
    const {
      name, type, targetAudience, discount, startDate, endDate, description, products, categories
    } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: 'Name and type are required' });
    }

    const campaign = new Campaign({
      name,
      type,
      targetAudience,
      discount,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      description,
      products,
      categories,
      createdBy: req.user.id
    });

    await campaign.save();
    res.status(201).json({ message: 'Campaign created successfully', campaign });
  } catch (error) {
    res.status(500).json({ message: 'Error creating campaign', error: error.message });
  }
});

/**
 * @description Gets all marketing campaigns with optional filters.
 * @route GET /api/admin/campaigns
 * @access Private/Admin
 */
const getCampaigns = asyncHandler(async (req, res) => {
  try {
    const { active, type } = req.query;
    const filter = {};
    const now = new Date();
    
    // Filter campaigns by active status
    if (active === 'true') {
      filter.startDate = { $lte: now };
      filter.endDate = { $gte: now };
    } else if (active === 'false') {
      filter.$or = [
        { startDate: { $gt: now } },
        { endDate: { $lt: now } }
      ];
    }
    
    if (type) filter.type = type;

    const campaigns = await Campaign.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching campaigns', error: error.message });
  }
});

/**
 * @description Updates a specific marketing campaign.
 * @route PUT /api/admin/campaigns/:id
 * @access Private/Admin
 */
const updateCampaign = asyncHandler(async (req, res) => {
  try {
    const campaignId = req.params.id;
    const updateData = req.body;
    
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // Update fields from the request body
    Object.keys(updateData).forEach(key => {
      if (key === 'startDate' || key === 'endDate') {
        campaign[key] = updateData[key] ? new Date(updateData[key]) : campaign[key];
      } else {
        campaign[key] = updateData[key];
      }
    });

    await campaign.save();
    res.status(200).json({ message: 'Campaign updated successfully', campaign });
  } catch (error) {
    res.status(500).json({ message: 'Error updating campaign', error: error.message });
  }
});

/**
 * @description Deletes a specific marketing campaign.
 * @route DELETE /api/admin/campaigns/:id
 * @access Private/Admin
 */
const deleteCampaign = asyncHandler(async (req, res) => {
  try {
    const campaignId = req.params.id;
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    await campaign.remove();
    res.status(200).json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting campaign', error: error.message });
  }
});

/**
 * @description Gets a list of users for administrative purposes, with optional filters.
 * @route GET /api/admin/users
 * @access Private/Admin
 */
const getUsers = asyncHandler(async (req, res) => {
  try {
    const { role, status, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(filter)
      .select('-password -resetPasswordToken -resetPasswordExpire') // Exclude sensitive info
      .sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

module.exports = {
  getDashboardStats,
  getSalesReport,
  getInventoryReport,
  getCustomerAnalytics,
  getLeadScoreData,
  updateSettings,
  createCampaign,
  getCampaigns,
  updateCampaign,
  deleteCampaign,
  getUsers
};
