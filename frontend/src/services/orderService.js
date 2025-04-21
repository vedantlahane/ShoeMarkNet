// src/services/orderService.js
import api from '../utils/api';

/**
 * Create a new order
 * @param {Object} orderData - Order information including items, shipping address, payment method
 * @returns {Promise} - Promise resolving to the created order
 */
const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

/**
 * Get all orders for the current user
 * @returns {Promise} - Promise resolving to an array of orders
 */
const getUserOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

/**
 * Get a specific order by ID
 * @param {string} orderId - The ID of the order to fetch
 * @returns {Promise} - Promise resolving to the order details
 */
const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

/**
 * Update the payment status of an order
 * @param {string} orderId - The ID of the order to update
 * @param {Object} paymentResult - Payment information from payment processor
 * @returns {Promise} - Promise resolving to the updated order
 */
const updateOrderPayment = async (orderId, paymentResult) => {
  const response = await api.put(`/orders/${orderId}/pay`, paymentResult);
  return response.data;
};

/**
 * Cancel an order
 * @param {string} orderId - The ID of the order to cancel
 * @returns {Promise} - Promise resolving to the canceled order
 */
const cancelOrder = async (orderId) => {
  const response = await api.put(`/orders/${orderId}/cancel`);
  return response.data;
};

/**
 * Admin function to get all orders in the system
 * @param {Object} filters - Optional filters for orders (status, date range, etc.)
 * @returns {Promise} - Promise resolving to an array of all orders
 */
const getAllOrders = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  // Add filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });
  
  const response = await api.get(`/orders/admin?${queryParams.toString()}`);
  return response.data;
};

/**
 * Admin function to update order status
 * @param {string} orderId - The ID of the order to update
 * @param {string} status - New status for the order
 * @returns {Promise} - Promise resolving to the updated order
 */
const updateOrderStatus = async (orderId, status) => {
  const response = await api.put(`/orders/${orderId}/status`, { status });
  return response.data;
};

const orderService = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderPayment,
  cancelOrder,
  getAllOrders,
  updateOrderStatus
};

export default orderService;
