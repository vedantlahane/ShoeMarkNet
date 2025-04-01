const Order = require('../models/Order');
const Shoe = require('../models/Shoe');
const { updateLeadScore } = require('./leadScoreController'); // Lead score logic

// Create a new order
const createOrder = async (req, res) => {
  try {
    const { items, paymentMethod, shippingAddress } = req.body;

    // Calculate total price
    let totalPrice = 0;
    for (const item of items) {
      const shoe = await Shoe.findById(item.shoe);
      totalPrice += shoe.price * item.quantity; // Assumes price is in the shoe document
    }

    const order = new Order({
      user: req.user.id,
      items,
      totalPrice,
      paymentMethod,
      shippingAddress,
    });
    
    await order.save();

    // Update lead score for placing an order
    updateLeadScore(req.user.id, 'place_order');

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error });
  }
};

// Get user's orders
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate('items.shoe');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error });
  }
};

// Update order status (Admin functionality)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  updateOrderStatus,
};
