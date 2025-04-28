import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateOrderStatus } from '../../redux/slices/orderSlice';

const OrderManagement = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector(state => state.order);
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Format date for better readability
  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);
  
  // Filter orders based on selected status - memoized to prevent recalculation
  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : statusFilter === 'paid' 
      ? orders?.filter(order => order.isPaid) 
      : statusFilter === 'unpaid' 
        ? orders?.filter(order => !order.isPaid) 
        : statusFilter === 'delivered' 
          ? orders?.filter(order => order.isDelivered) 
          : orders?.filter(order => !order.isDelivered);
  
  // Handle order status update
  const handleStatusUpdate = useCallback((orderId, field, value) => {
    dispatch(updateOrderStatus({ orderId, updates: { [field]: value } }));
  }, [dispatch]);
  
  if (!orders) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <p className="ml-3">Loading orders...</p>
    </div>;
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Order Management</h1>
        <div className="flex items-center">
          <label htmlFor="statusFilter" className="mr-2">Filter by Status:</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="all">All Orders</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="delivered">Delivered</option>
            <option value="processing">Processing</option>
          </select>
        </div>
      </div>
      
      {/* Orders List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders && filteredOrders.map(order => (
              <tr key={order._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">#{order._id.substring(order._id.length - 8)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{order.user?.name || 'Guest'}</div>
                  <div className="text-sm text-gray-500">{order.user?.email || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(order.createdAt)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">${order.totalPrice.toFixed(2)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={order.isPaid ? 'paid' : 'unpaid'}
                    onChange={(e) => handleStatusUpdate(order._id, 'isPaid', e.target.value === 'paid')}
                    className={`text-sm rounded px-2 py-1 ${
                      order.isPaid 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={order.isDelivered ? 'delivered' : 'processing'}
                    onChange={(e) => handleStatusUpdate(order._id, 'isDelivered', e.target.value === 'delivered')}
                    className={`text-sm rounded px-2 py-1 ${
                      order.isDelivered 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    <option value="delivered">Delivered</option>
                    <option value="processing">Processing</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button 
                    onClick={() => window.open(`/orders/${order._id}`, '_blank')}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagement;
