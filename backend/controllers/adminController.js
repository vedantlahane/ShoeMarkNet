const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');
const Campaign = require('../models/Campaign');
const Setting = require('../models/Setting');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Get total revenue
    const orders = await Order.find({ status: { $ne: 'cancelled' } });
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    
    // Get order count
    const orderCount = orders.length;
    
    // Get user count
    const userCount = await User.countDocuments();
    
    // Get product count
    const productCount = await Product.countDocuments();
    
    // Get low stock products
    const lowStockProducts = await Product.find({ countInStock: { $lt: 10 } })
      .select('name countInStock')
      .limit(5);
    
    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');
    
    // Get top selling products
    const topSellingProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);
    
    // Populate product details for top selling products
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
};

// Get sales report
const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    
    // Build main filter
    const filter = {};
    if (Object.keys(dateFilter).length > 0) filter.createdAt = dateFilter;
    
    // Get orders
    let orders = await Order.find(filter)
      .populate({
        path: 'items.product',
        select: 'name price category'
      });
    
    // Filter by category if specified
    if (category) {
      orders = orders.filter(order => 
        order.items.some(item => 
          item.product && item.product.category && 
          item.product.category.toString() === category
        )
      );
    }
    
    // Calculate sales data
    const salesData = orders.map(order => ({
      orderId: order._id,
      date: order.createdAt,
      customer: order.user,
      total: order.totalPrice,
      status: order.status
    }));
    
    // Calculate summary
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
};

// Get inventory report
const getInventoryReport = async (req, res) => {
  try {
    // Get all products with inventory information
    const products = await Product.find()
      .select('name price countInStock category')
      .populate('category', 'name');
    
    // Calculate inventory value
    const totalValue = products.reduce((sum, product) => 
      sum + (product.price * product.countInStock), 0
    );
    
    // Group by category
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
    
    // Get low stock items
    const lowStockItems = products
      .filter(product => product.countInStock < 10)
      .map(product => ({
        id: product._id,
        name: product.name,
        price: product.price,
        stock: product.countInStock,
        category: product.category ? product.category.name : 'Uncategorized'
      }));
    
    // Get out of stock items
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
};

// Get customer analytics
const getCustomerAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    
    // Get user registrations over time
    const userFilter = {};
    if (Object.keys(dateFilter).length > 0) userFilter.createdAt = dateFilter;
    
    const users = await User.find(userFilter).select('createdAt source score');
    
    // Group users by registration source
    const sourceBreakdown = {};
    users.forEach(user => {
      const source = user.source || 'direct';
      if (!sourceBreakdown[source]) {
        sourceBreakdown[source] = 0;
      }
      sourceBreakdown[source] += 1;
    });
    
    // Get order data for customer value analysis
    const orderFilter = {};
    if (Object.keys(dateFilter).length > 0) orderFilter.createdAt = dateFilter;
    
    const orders = await Order.find(orderFilter)
      .populate('user', 'name email');
    
    // Calculate customer lifetime value
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
    
    // Convert to array and sort by total spent
    const topCustomers = Object.values(customerValue)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);
    
    // Calculate average order value per customer
    const customerAOV = Object.values(customerValue).map(customer => ({
      user: customer.user,
      averageOrderValue: customer.orderCount > 0 ? 
        customer.totalSpent / customer.orderCount : 0
    })).sort((a, b) => b.averageOrderValue - a.averageOrderValue)
      .slice(0, 10);
    
    // Get lead score distribution
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
};

// Get lead score data
const getLeadScoreData = async (req, res) => {
  try {
    // Get users with lead scores
    const users = await User.find()
      .select('name email score createdAt lastLogin')
      .sort({ score: -1 });
    
    // Format user data
    const userData = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      score: user.score,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }));
    
    // Calculate score distribution
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
};

// Update system settings
const updateSettings = async (req, res) => {
  try {
    const { 
      siteName, 
      logo, 
      contactEmail, 
      supportPhone, 
      shippingFee, 
      taxRate,
      enableReviews,
      requireLoginForCheckout,
      maintenanceMode
    } = req.body;
    
    // Find existing settings or create new
    let settings = await Setting.findOne();
    
    if (!settings) {
      settings = new Setting({});
    }
    
    // Update fields
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
};

// Create marketing campaign
const createCampaign = async (req, res) => {
  try {
    const { 
      name, 
      type, 
      targetAudience, 
      discount, 
      startDate, 
      endDate, 
      description,
      products,
      categories
    } = req.body;
    
    // Validate required fields
    if (!name || !type) {
      return res.status(400).json({ message: 'Name and type are required' });
    }
    
    // Create campaign
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
};

// Get all campaigns
const getCampaigns = async (req, res) => {
  try {
    const { active, type } = req.query;
    
    // Build filter
    const filter = {};
    
    // Filter by active status
    if (active === 'true') {
      const now = new Date();
      filter.startDate = { $lte: now };
      filter.endDate = { $gte: now };
    } else if (active === 'false') {
      const now = new Date();
      filter.$or = [
        { startDate: { $gt: now } },
        { endDate: { $lt: now } }
      ];
    }
    
    // Filter by type
    if (type) {
      filter.type = type;
    }
    
    const campaigns = await Campaign.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching campaigns', error: error.message });
  }
};

// Update campaign
const updateCampaign = async (req, res) => {
  try {
    const campaignId = req.params.id;
    const updateData = req.body;
    
    const campaign = await Campaign.findById(campaignId);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // Update fields
    Object.keys(updateData).forEach(key => {
      // Handle date fields
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
};

// Delete campaign
const deleteCampaign = async (req, res) => {
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
};
const getUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (role) {
      filter.role = role;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(filter)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort({ createdAt: -1 });
    
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      message: 'Error fetching users', 
      error: error.message 
    });
  }
};
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
