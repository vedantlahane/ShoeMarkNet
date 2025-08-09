const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { updateLeadScore } = require('./leadScoreController');
const asyncHandler = require('express-async-handler');

// ====================================================================
// ==================== PROTECTED USER ROUTES =========================
// ====================================================================

/**
 * @description Create a new order from a user's cart or a custom item list.
 * This also handles stock reduction and optionally clears the user's cart.
 * @route POST /api/orders
 * @access Private
 */
const createOrder = asyncHandler(async (req, res) => {
  const { items, paymentMethod, shippingAddress, fromCart = false } = req.body;

  // Validate that the order contains at least one item
  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No order items provided');
  }

  let totalPrice = 0;
  // A list to hold the products we need to update
  const productsToUpdate = [];

  // Loop through each item to validate products, check stock, and calculate total price
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Product not found: ${item.product}`);
    }
    
    // Check if enough stock is available
    if (product.countInStock < item.quantity) {
      res.status(400);
      throw new Error(`Not enough stock for ${product.name}. Available: ${product.countInStock}`);
    }
    
    totalPrice += product.price * item.quantity;
    
    // Prepare the stock update without saving yet
    product.countInStock -= item.quantity;
    productsToUpdate.push(product.save());
  }
  
  // Create the order document
  const order = new Order({
    user: req.user.id,
    items,
    totalPrice,
    paymentMethod,
    shippingAddress,
  });
  
  // Save the order and update all product stocks concurrently
  await Promise.all([order.save(), ...productsToUpdate]);

  // If the order was created from the cart, clear it
  if (fromCart) {
    await Cart.findOneAndDelete({ user: req.user.id });
  }

  // Update the user's lead score for placing an order
  if (req.user && req.user.id) {
    await updateLeadScore(req.user.id, 'place_order');
  }
  
  res.status(201).json({ message: 'Order placed successfully', order });
});

/**
 * @description Get all orders for the authenticated user.
 * @route GET /api/orders
 * @access Private
 */
const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .populate('items.product', 'name image price')
    .sort({ createdAt: -1 }); // Sort by newest first
    
  res.status(200).json(orders);
});

/**
 * @description Get a specific order by its ID.
 * @route GET /api/orders/:orderId
 * @access Private
 */
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId)
    .populate('user', 'name email')
    .populate('items.product', 'name image price');
    
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  
  // Check if the authenticated user is the order owner or an admin
  if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to access this order');
  }
  
  res.status(200).json(order);
});

/**
 * @description Update an order's payment status after a successful transaction.
 * @route PUT /api/orders/:orderId/pay
 * @access Private
 */
const updateOrderPayment = asyncHandler(async (req, res) => {
  const { paymentResult } = req.body;
  
  const order = await Order.findById(req.params.orderId);
  
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  
  // Ensure the authenticated user owns the order
  if (order.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to update this order');
  }
  
  order.isPaid = true;
  order.paidAt = Date.now();
  order.paymentResult = paymentResult;
  
  const updatedOrder = await order.save();
  
  res.status(200).json(updatedOrder);
});

/**
 * @description Cancel an order and restore product stock.
 * @route PUT /api/orders/:orderId/cancel
 * @access Private
 */
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  
  // Ensure the user is the order owner
  if (order.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to cancel this order');
  }
  
  // Prevent cancellation if the order has already been delivered
  if (order.isDelivered) {
    res.status(400);
    throw new Error('Cannot cancel delivered order');
  }
  
  // Restore product stock to the original levels
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (product) {
      product.countInStock += item.quantity;
      await product.save();
    }
  }
  
  order.status = 'cancelled';
  await order.save();
  
  res.status(200).json({ message: 'Order cancelled successfully', order });
});

// ====================================================================
// ========================= ADMIN ROUTES =============================
// ====================================================================

/**
 * @description Get all orders, with optional filtering and pagination.
 * @route GET /api/orders/admin
 * @access Private/Admin
 */
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  
  const filters = {};
  if (status) filters.status = status;
  
  const skip = (Number(page) - 1) * Number(limit);
  
  const orders = await Order.find(filters)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));
    
  const total = await Order.countDocuments(filters);
  
  res.status(200).json({
    orders,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    }
  });
});

/**
 * @description Update the status of an order (e.g., from 'processing' to 'shipped').
 * @route PUT /api/orders/admin/:orderId/status
 * @access Private/Admin
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  const order = await Order.findById(req.params.orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  
  order.status = status;
  
  // If the status is 'delivered', update the delivery details
  if (status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }
  
  await order.save();
  
  res.status(200).json({ message: 'Order status updated', order });
});

/**
 * @description Delete an order by its ID.
 * @route DELETE /api/orders/admin/:orderId
 * @access Private/Admin
 */
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  
  await order.deleteOne();
  
  res.status(200).json({ message: 'Order deleted successfully' });
});

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderPayment,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  deleteOrder
};
