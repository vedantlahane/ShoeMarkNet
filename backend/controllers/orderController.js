const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
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
  const { items, paymentMethod, shippingAddress, fromCart = false, tax = 0, shippingFee = 0, discount = 0 } = req.body;

  // Validate that the order contains at least one item
  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No order items provided');
  }

  if (!paymentMethod) {
    res.status(400);
    throw new Error('Payment method is required');
  }

  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.addressLine1) {
    res.status(400);
    throw new Error('Valid shipping address is required');
  }

  const orderItems = [];
  const productUpdates = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Product not found: ${item.product}`);
    }

    if (!product.isActive) {
      res.status(400);
      throw new Error(`${product.name} is not available for purchase`);
    }

    let availableStock = product.countInStock;
    let variantMeta = {};
    if (item.variant && (item.variant.color || item.variant.size) && Array.isArray(product.variants)) {
      const variantColor = item.variant.color ? String(item.variant.color).toLowerCase() : null;
      const variantSize = item.variant.size ? String(item.variant.size).toLowerCase() : null;

      const matchedVariant = product.variants.find(v => {
        if (variantColor) {
          return v.color && v.color.toLowerCase() === variantColor;
        }
        if (variantSize) {
          return Array.isArray(v.sizes) && v.sizes.some(s => s.size && String(s.size).toLowerCase() === variantSize);
        }
        return false;
      });

      if (matchedVariant) {
        variantMeta.color = matchedVariant.color;
        variantMeta.colorCode = matchedVariant.colorCode;

        if (variantSize && Array.isArray(matchedVariant.sizes)) {
          const matchedSize = matchedVariant.sizes.find(s => s.size && String(s.size).toLowerCase() === variantSize);
          if (matchedSize) {
            availableStock = matchedSize.countInStock;
            variantMeta.size = matchedSize.size;
            variantMeta.price = matchedSize.price || product.price;
          } else {
            res.status(400);
            throw new Error(`Selected size is not available for ${product.name}`);
          }
        } else if (Array.isArray(matchedVariant.sizes)) {
          availableStock = matchedVariant.sizes.reduce((sum, s) => sum + (s.countInStock || 0), 0);
        }
      }
    }

    if (availableStock < item.quantity) {
      res.status(400);
      throw new Error(`Not enough stock for ${product.name}. Available: ${availableStock}`);
    }

    const unitPrice = variantMeta.price || product.price;
    const orderItem = {
      product: product._id,
      quantity: item.quantity,
      price: unitPrice,
      color: variantMeta.color || item.variant?.color,
      size: variantMeta.size || item.variant?.size
    };

    orderItems.push(orderItem);

    product.countInStock = Math.max(product.countInStock - item.quantity, 0);
    if (product.variants && product.variants.length > 0 && variantMeta.color) {
      const variantIndex = product.variants.findIndex(v => v.color === variantMeta.color);
      if (variantIndex > -1 && Array.isArray(product.variants[variantIndex].sizes) && variantMeta.size) {
        const sizeIndex = product.variants[variantIndex].sizes.findIndex(s => String(s.size) === String(variantMeta.size));
        if (sizeIndex > -1) {
          product.variants[variantIndex].sizes[sizeIndex].countInStock = Math.max(
            product.variants[variantIndex].sizes[sizeIndex].countInStock - item.quantity,
            0
          );
        }
      }
      product.syncStockFromVariants();
    }

    productUpdates.push(product.save());
  }

  const order = new Order({
    user: req.user.id,
    items: orderItems,
    paymentMethod,
    shippingAddress,
    tax,
    shippingFee,
    discount
  });

  await Promise.all([order.save(), ...productUpdates]);

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
 * @description Validate a coupon against the current user's cart or provided total.
 * @route POST /api/orders/validate-coupon
 * @access Private
 */
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, cartTotal } = req.body;

  if (!code || !code.trim()) {
    res.status(400);
    throw new Error('Coupon code is required');
  }

  const normalizedCode = code.trim().toUpperCase();
  const coupon = await Coupon.findOne({ code: normalizedCode });

  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }

  const now = new Date();
  if (!coupon.isCurrentlyValid(now)) {
    res.status(400);
    throw new Error('Coupon is not active or has expired');
  }

  const userId = req.user?.id;
  if (coupon.hasUserExceededLimit(userId)) {
    res.status(400);
    throw new Error('You have already used this coupon the maximum number of times');
  }

  if (coupon.usageLimit.total && coupon.usageCount >= coupon.usageLimit.total) {
    res.status(400);
    throw new Error('Coupon usage limit has been reached');
  }

  let total = Number(cartTotal);
  if (!total || Number.isNaN(total) || total <= 0) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      res.status(400);
      throw new Error('Unable to determine cart total for coupon validation');
    }
    total = cart.subtotal || cart.totalPrice || cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  if (total < coupon.minPurchase) {
    res.status(400);
    throw new Error(`Minimum purchase of ${coupon.minPurchase} is required for this coupon`);
  }

  const discountAmount = coupon.calculateDiscount(total);
  const finalAmount = Math.max(total - discountAmount, 0);

  const responsePayload = {
    coupon: {
      id: coupon._id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      maxDiscount: coupon.maxDiscount,
      minPurchase: coupon.minPurchase
    },
    cartTotal: total,
    discountAmount,
    finalAmount
  };

  if (typeof res.success === 'function') {
    return res.success('Coupon validated successfully', responsePayload, {
      usageLimit: coupon.usageLimit,
      usageCount: coupon.usageCount,
      userUsageCount: coupon.getUserUsageCount(userId)
    });
  }

  return res.status(200).json({
    message: 'Coupon validated successfully',
    ...responsePayload,
    meta: {
      usageLimit: coupon.usageLimit,
      usageCount: coupon.usageCount,
      userUsageCount: coupon.getUserUsageCount(userId)
    }
  });
});

/**
 * @description Get all orders for the authenticated user.
 * @route GET /api/orders
 * @access Private
 */
const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .populate('items.product', 'name images price slug')
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
  .populate('items.product', 'name images price slug');
    
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

      if (Array.isArray(product.variants) && product.variants.length > 0) {
        const matchedVariantIndex = product.variants.findIndex(v =>
          item.color && v.color && v.color.toLowerCase() === String(item.color).toLowerCase()
        );

        if (matchedVariantIndex > -1 && Array.isArray(product.variants[matchedVariantIndex].sizes) && item.size) {
          const matchedSizeIndex = product.variants[matchedVariantIndex].sizes.findIndex(s =>
            s.size && String(s.size).toLowerCase() === String(item.size).toLowerCase()
          );
          if (matchedSizeIndex > -1) {
            product.variants[matchedVariantIndex].sizes[matchedSizeIndex].countInStock += item.quantity;
          }
        }

        product.syncStockFromVariants();
      }

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
 * @description Get aggregate statistics for orders (admin dashboard).
 * @route GET /api/orders/admin/stats
 * @access Private/Admin
 */
const getOrderStats = asyncHandler(async (req, res) => {
  const { startDate, endDate, status } = req.query;

  const filters = {};

  if (status && status !== 'all') {
    filters.status = status;
  }

  let start = null;
  let end = null;

  if (startDate) {
    const parsedStart = new Date(startDate);
    if (!Number.isNaN(parsedStart.getTime())) {
      start = parsedStart;
    }
  }

  if (endDate) {
    const parsedEnd = new Date(endDate);
    if (!Number.isNaN(parsedEnd.getTime())) {
      end = parsedEnd;
    }
  }

  if (start || end) {
    filters.createdAt = {};
    if (start) {
      filters.createdAt.$gte = start;
    }
    if (end) {
      filters.createdAt.$lte = end;
    }
  }

  const orders = await Order.find(filters).select('totalPrice grandTotal isPaid isDelivered status createdAt');

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (order.grandTotal ?? order.totalPrice ?? 0), 0);
  const paidOrders = orders.filter(order => order.isPaid).length;
  const deliveredOrders = orders.filter(order => order.isDelivered).length;
  const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
  const processingOrders = orders.filter(order => order.status === 'processing').length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const pendingPayments = orders.filter(order => !order.isPaid).length;

  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const conversionRate = totalOrders > 0 ? (paidOrders / totalOrders) * 100 : 0;

  res.status(200).json({
    totalOrders,
    totalRevenue,
    paidOrders,
    deliveredOrders,
    cancelledOrders,
    processingOrders,
    pendingOrders,
  pendingPayments,
    avgOrderValue: averageOrderValue,
    conversionRate,
    filters: {
      startDate: start ? start.toISOString() : null,
      endDate: end ? end.toISOString() : null,
      status: status || 'all'
    }
  });
});

/**
 * @description Update the status of an order (e.g., from 'processing' to 'shipped').
 * @route PUT /api/orders/admin/:orderId/status
 * @access Private/Admin
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const {
    status,
    isPaid,
    paidAt,
    paymentResult,
    isDelivered,
    deliveredAt,
    trackingNumber,
    estimatedDelivery
  } = req.body;

  const order = await Order.findById(req.params.orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Update primary status if provided
  if (status && order.status !== status) {
    order.status = status;

    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    if (status === 'cancelled') {
      order.isDelivered = false;
      order.deliveredAt = undefined;
    }
  }

  // Update payment state
  if (typeof isPaid === 'boolean') {
    order.isPaid = isPaid;
    if (isPaid) {
      order.paidAt = paidAt ? new Date(paidAt) : order.paidAt || new Date();
    } else {
      order.paidAt = null;
    }
  }

  // Merge payment result metadata if supplied
  if (paymentResult && typeof paymentResult === 'object') {
    const existingPaymentResult = order.paymentResult && typeof order.paymentResult.toObject === 'function'
      ? order.paymentResult.toObject()
      : (order.paymentResult ? { ...order.paymentResult } : {});

    order.paymentResult = {
      ...existingPaymentResult,
      ...paymentResult
    };
  }

  // Update delivery flags if provided explicitly
  if (typeof isDelivered === 'boolean') {
    order.isDelivered = isDelivered;
    if (isDelivered) {
      order.deliveredAt = deliveredAt ? new Date(deliveredAt) : order.deliveredAt || new Date();
      if (!status) {
        order.status = 'delivered';
      }
    } else {
      order.deliveredAt = null;
      if (!status && order.status === 'delivered') {
        order.status = 'processing';
      }
    }
  }

  if (trackingNumber !== undefined) {
    order.trackingNumber = trackingNumber || null;
  }

  if (estimatedDelivery !== undefined) {
    order.estimatedDelivery = estimatedDelivery ? new Date(estimatedDelivery) : null;
  }

  const savedOrder = await order.save();
  const populatedOrder = await savedOrder.populate('user', 'name email');

  res.status(200).json(populatedOrder);
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
  getOrderStats,
  updateOrderStatus,
  deleteOrder,
  validateCoupon
};
