// src/services/orderService.js
import api from '../utils/api';

const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.append(key, value);
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

const unwrapOrder = (data) => (
  data?.order ?? data ?? null
);

const normalizeOrderList = (data) => {
  if (Array.isArray(data)) {
    return {
      orders: data,
      pagination: null,
      totalOrders: data.length,
    };
  }

  if (data && Array.isArray(data.orders)) {
    return {
      orders: data.orders,
      pagination: data.pagination ?? null,
      totalOrders: data.total ?? data.totalOrders ?? data.pagination?.total ?? data.orders.length,
      message: data.message,
    };
  }

  return {
    orders: [],
    pagination: null,
    totalOrders: 0,
    message: data?.message,
  };
};

const getUserOrders = async (params = {}) => {
  try {
    const queryString = buildQueryString(params);
    const { data } = await api.get(`/orders${queryString}`);
    return normalizeOrderList(data);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

const getOrderById = async (orderId) => {
  try {
    const { data } = await api.get(`/orders/${orderId}`);
    return unwrapOrder(data);
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    throw error;
  }
};

const createOrder = async (orderData) => {
  try {
    const { data } = await api.post('/orders', orderData);
    return {
      order: unwrapOrder(data),
      message: data?.message,
    };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

const updateOrderPayment = async (orderId, paymentResult) => {
  try {
    const { data } = await api.put(`/orders/${orderId}/pay`, { paymentResult });
    return {
      order: unwrapOrder(data),
      message: data?.message,
    };
  } catch (error) {
    console.error(`Error updating payment for order ${orderId}:`, error);
    throw error;
  }
};

const cancelOrder = async (orderId, reason) => {
  try {
    const payload = reason ? { reason } : undefined;
    const { data } = await api.put(`/orders/${orderId}/cancel`, payload);
    return {
      order: unwrapOrder(data),
      message: data?.message,
    };
  } catch (error) {
    console.error(`Error canceling order ${orderId}:`, error);
    throw error;
  }
};

const updateOrderStatus = async (orderId, updates) => {
  try {
    const { data } = await api.put(`/orders/admin/${orderId}`, updates);
    return unwrapOrder(data);
  } catch (error) {
    console.error(`Error updating status for order ${orderId}:`, error);
    throw error;
  }
};

const getAllOrders = async (queryParams = {}) => {
  try {
    const queryString = buildQueryString(queryParams);
    const { data } = await api.get(`/orders/admin/all${queryString}`);
    return normalizeOrderList(data);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    throw error;
  }
};

const deleteOrder = async (orderId) => {
  try {
    const { data } = await api.delete(`/orders/admin/${orderId}`);
    return data;
  } catch (error) {
    console.error(`Error deleting order ${orderId}:`, error);
    throw error;
  }
};

const exportOrders = async (orders, format = 'csv') => {
  try {
    const safeOrders = Array.isArray(orders) ? orders : [];

    if (format === 'json') {
      return JSON.stringify(safeOrders, null, 2);
    }

    const headers = [
      'ID',
      'Order Number',
      'Customer',
      'Email',
      'Status',
      'Paid',
      'Delivered',
      'Total',
      'Created At'
    ];

    const rows = safeOrders.map((order) => {
      const values = [
        order._id,
        order.orderNumber || order.orderId || '',
        `"${(order.user?.name || order.shippingAddress?.name || 'Guest').replace(/"/g, '""')}"`,
        order.user?.email || order.shippingAddress?.email || '',
        order.status || (order.isDelivered ? 'delivered' : 'pending'),
        order.isPaid ? 'Yes' : 'No',
        order.isDelivered ? 'Yes' : 'No',
        Number(order.totalPrice || 0),
        order.createdAt ? new Date(order.createdAt).toISOString() : ''
      ];
      return values.join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  } catch (error) {
    console.error('Error exporting orders:', error);
    throw error;
  }
};

const getOrderStats = async (filters = {}) => {
  try {
    const queryString = buildQueryString(filters);
    const { data } = await api.get(`/orders/admin/stats${queryString}`);
    return data;
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    throw error;
  }
};

const trackOrder = async (orderId) => {
  try {
    const { data } = await api.get(`/orders/${orderId}/track`);
    return {
      order: unwrapOrder(data),
      message: data?.message,
    };
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
  exportOrders,
};

export default orderService;
