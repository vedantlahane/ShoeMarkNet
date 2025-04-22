const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { updateLeadScore } = require('./leadScoreController');

// Create a new order
const createOrder = async (req, res) => {
  try {
    const { items, paymentMethod, shippingAddress } = req.body;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items provided' });
    }

    // Calculate total price
    let totalPrice = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }
      
      // Check if enough stock
      if (product.countInStock < item.quantity) {
        return res.status(400).json({ 
          message: `Not enough stock for ${product.name}. Available: ${product.countInStock}` 
        });
      }
      
      totalPrice += product.price * item.quantity;
      
      // Update product stock
      product.countInStock -= item.quantity;
      await product.save();
    }

    const order = new Order({
      user: req.user.id,
      items,
      totalPrice,
      paymentMethod,
      shippingAddress,
    });
    
    await order.save();

    // Clear user's cart if order was created from cart
    if (req.body.fromCart) {
      await Cart.findOneAndDelete({ user: req.user.id });
    }

    // Update lead score for placing an order
    updateLeadScore(req.user.id, 'place_order');

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

// Get user's orders
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name image price')
      .sort({ createdAt: -1 });
      
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('user', 'name email')
      .populate('items.product', 'name image price');
      
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if the order belongs to the user or user is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this order' });
    }
    
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

// Update order payment
const updateOrderPayment = async (req, res) => {
  try {
    const { paymentResult } = req.body;
    
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if the order belongs to the user
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }
    
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = paymentResult;
    
    const updatedOrder = await order.save();
    
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error updating payment', error: error.message });
  }
};

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if the order belongs to the user
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }
    
    // Only allow cancellation if order is not delivered
    if (order.isDelivered) {
      return res.status(400).json({ message: 'Cannot cancel delivered order' });
    }
    
    // Restore product stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      product.countInStock += item.quantity;
      await product.save();
    }
    
    order.status = 'cancelled';
    await order.save();
    
    res.status(200).json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling order', error: error.message });
  }
};

// Get all orders (Admin)
const getAllOrders = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Update order status (Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    order.status = status;
    
    // If status is 'delivered', update delivery info
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
    
    await order.save();
    
    res.status(200).json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
};

// Delete order (Admin)
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    await order.remove();
    
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting order', error: error.message });
  }
};

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
