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
 * Update the status of an order
 * @param {string} orderId - The ID of the order to update
 * @param {Object} updates - Status updates to apply
 * @returns {Promise} - Promise resolving to the updated order
 */
const updateOrderStatus = async (orderId, updates) => {
  try {
    const response = await api.put(`/orders/${orderId}/status`, updates);
    return response.data;
  } catch (error) {
    console.error(`Error updating status for order ${orderId}:`, error);
    throw error;
  }
};

/**
 * Get all orders (admin only)
 * @param {Object} queryParams - Optional query parameters for filtering
 * @returns {Promise} - Promise resolving to an array of all orders
 */
const getAllOrders = async (queryParams = {}) => {
  try {
    const queryString = new URLSearchParams(queryParams).toString();
    const url = queryString ? `/admin/orders?${queryString}` : '/admin/orders';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching all orders:', error);
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
};

export default orderService;
