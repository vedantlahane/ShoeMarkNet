// src/services/orderService.js
import api from '../utils/api';

/**
 * Get all orders for the current user
 * @returns {Promise} - Promise resolving to an array of orders
 */
const getUserOrders = async () => {
  try {
    const response = await api.get('/orders');
    return response.data;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

/**
 * Get a specific order by ID
 * @param {string} orderId - The ID of the order to fetch
 * @returns {Promise} - Promise resolving to the order details
 */
const getOrderById = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    throw error;
  }
};

/**
 * Create a new order
 * @param {Object} orderData - Order information including items, shipping address, payment method
 * @returns {Promise} - Promise resolving to the created order
 */
const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Update the payment status of an order
 * @param {string} orderId - The ID of the order to update
 * @param {Object} paymentResult - Payment information from payment processor
 * @returns {Promise} - Promise resolving to the updated order
 */
const updateOrderPayment = async (orderId, paymentResult) => {
  try {
    const response = await api.put(`/orders/${orderId}/pay`, paymentResult);
    return response.data;
  } catch (error) {
    console.error(`Error updating payment for order ${orderId}:`, error);
    throw error;
  }
};

/**
 * Cancel an order
 * @param {string} orderId - The ID of the order to cancel
 * @returns {Promise} - Promise resolving to the canceled order
 */
const cancelOrder = async (orderId) => {
  try {
    const response = await api.put(`/orders/${orderId}/cancel`);
    return response.data;
  } catch (error) {
    console.error(`Error canceling order ${orderId}:`, error);
    throw error;
  }
};

/**
 * Update the status of an order (admin only)
 * @param {string} orderId - The ID of the order to update
 * @param {Object} updates - Status updates to apply
 * @returns {Promise} - Promise resolving to the updated order
 */
const updateOrderStatus = async (orderId, updates) => {
  try {
    const response = await api.put(`/orders/admin/${orderId}`, updates);
    return response.data;
  } catch (error) {
    console.error(`Error updating status for order ${orderId}:`, error);
    throw error;
  }
};

/**
 * Get all orders (admin only)
 * @param {Object} queryParams - Optional query parameters for filtering
 * @returns {Promise} - Promise resolving to orders with pagination
 */
const getAllOrders = async (queryParams = {}) => {
  try {
    const queryString = new URLSearchParams(queryParams).toString();
    const url = queryString ? `/orders/admin/all?${queryString}` : '/orders/admin/all';
    const response = await api.get(url);
    return response.data; // Returns { orders, pagination }
  } catch (error) {
    console.error('Error fetching all orders:', error);
    throw error;
  }
};

/**
 * Delete an order (admin only)
 * @param {string} orderId - The ID of the order to delete
 * @returns {Promise} - Promise resolving to success message
 */
const deleteOrder = async (orderId) => {
  try {
    const response = await api.delete(`/orders/admin/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting order ${orderId}:`, error);
    throw error;
  }
};

/**
 * Get order statistics for dashboard
 * @param {Object} filters - Optional date range filters
 * @returns {Promise} - Promise resolving to order statistics
 */
const getOrderStats = async (filters = {}) => {
  try {
    const queryString = new URLSearchParams(filters).toString();
    const url = queryString ? `/orders/admin/stats?${queryString}` : '/orders/admin/stats';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    throw error;
  }
};

/**
 * Track order delivery status
 * @param {string} orderId - The ID of the order to track
 * @returns {Promise} - Promise resolving to tracking information
 */
const trackOrder = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}/track`);
    return response.data;
  } catch (error) {
    console.error(`Error tracking order ${orderId}:`, error);
    throw error;
  }
};

const orderService = {
  getUserOrders,
  getOrderById,
  createOrder,
  updateOrderPayment,
  cancelOrder,
  updateOrderStatus,
  getAllOrders,
  deleteOrder,
  getOrderStats,
  trackOrder,
};

export default orderService;
