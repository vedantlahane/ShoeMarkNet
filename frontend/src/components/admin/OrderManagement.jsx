// src/components/admin/OrderManagement.jsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateOrderStatus } from '../../redux/slices/orderSlice';

const OrderManagement = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector(state => state.order);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [animateCards, setAnimateCards] = useState(false);

  // Trigger card animations
  useEffect(() => {
    setAnimateCards(true);
  }, []);

  // Format date for better readability
  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Get relative time
  const getRelativeTime = useCallback((dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 24) {
      return diffInHours < 1 ? 'Just now' : `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return formatDate(dateString);
    }
  }, [formatDate]);

  // Enhanced filtering and sorting
  const filteredAndSortedOrders = useMemo(() => {
    if (!orders) return [];

    let filtered = orders.filter(order => {
      // Status filter
      const statusMatch = statusFilter === 'all' || 
        (statusFilter === 'paid' && order.isPaid) ||
        (statusFilter === 'unpaid' && !order.isPaid) ||
        (statusFilter === 'delivered' && order.isDelivered) ||
        (statusFilter === 'processing' && !order.isDelivered);

      // Search filter
      const searchMatch = !searchTerm || 
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

      return statusMatch && searchMatch;
    });

    // Sort orders
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'totalPrice':
          aValue = a.totalPrice;
          bValue = b.totalPrice;
          break;
        case 'customer':
          aValue = a.user?.name || '';
          bValue = b.user?.name || '';
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [orders, statusFilter, searchTerm, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedOrders.length / ordersPerPage);
  const currentOrders = filteredAndSortedOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  // Calculate statistics
  const orderStats = useMemo(() => {
    if (!orders) return {};

    const totalOrders = orders.length;
    const paidOrders = orders.filter(order => order.isPaid).length;
    const deliveredOrders = orders.filter(order => order.isDelivered).length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalOrders,
      paidOrders,
      deliveredOrders,
      totalRevenue,
      avgOrderValue,
      pendingOrders: totalOrders - deliveredOrders
    };
  }, [orders]);

  // Handle order status update
  const handleStatusUpdate = useCallback((orderId, field, value) => {
    dispatch(updateOrderStatus({ orderId, updates: { [field]: value } }));
  }, [dispatch]);

  // Handle bulk actions
  const handleBulkAction = useCallback((action) => {
    selectedOrders.forEach(orderId => {
      switch (action) {
        case 'markPaid':
          handleStatusUpdate(orderId, 'isPaid', true);
          break;
        case 'markDelivered':
          handleStatusUpdate(orderId, 'isDelivered', true);
          break;
        default:
          break;
      }
    });
    setSelectedOrders([]);
    setShowBulkActions(false);
  }, [selectedOrders, handleStatusUpdate]);

  // Toggle order selection
  const toggleOrderSelection = useCallback((orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  }, []);

  // Get status color
  const getStatusColor = useCallback((order) => {
    if (order.isDelivered) return 'from-green-500 to-emerald-500';
    if (order.isPaid) return 'from-blue-500 to-cyan-500';
    return 'from-yellow-500 to-orange-500';
  }, []);

  // Get priority level
  const getPriorityLevel = useCallback((order) => {
    const orderAge = (new Date() - new Date(order.createdAt)) / (1000 * 60 * 60 * 24);
    if (!order.isPaid && orderAge > 7) return 'high';
    if (order.isPaid && !order.isDelivered && orderAge > 3) return 'medium';
    return 'low';
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="flex justify-center items-center h-96">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-12 text-center shadow-2xl">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              <i className="fas fa-shopping-cart mr-2 text-blue-500"></i>
              Loading Orders
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              <i className="fas fa-database mr-2"></i>
              Fetching order data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="flex justify-center items-center h-96">
          <div className="bg-red-500/20 backdrop-blur-xl border border-red-300/50 rounded-3xl p-12 text-center shadow-2xl max-w-md">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-exclamation-triangle text-white text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
              Error Loading Orders
            </h3>
            <p className="text-red-500 dark:text-red-300 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200"
            >
              <i className="fas fa-redo mr-2"></i>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="flex justify-center items-center h-96">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-12 text-center shadow-2xl max-w-md">
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-shopping-cart text-gray-400 text-3xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No Orders Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Orders will appear here when customers start placing them
            </p>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200">
              <i className="fas fa-plus mr-2"></i>
              Create Test Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                <i className="fas fa-shopping-cart mr-3"></i>
                Order Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                <i className="fas fa-chart-line mr-2"></i>
                Monitor and manage all customer orders
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105">
                <i className="fas fa-file-export mr-2"></i>
                Export Orders
              </button>
              <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105">
                <i className="fas fa-plus mr-2"></i>
                Add Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {[
          {
            title: 'Total Orders',
            value: orderStats.totalOrders?.toLocaleString() || '0',
            icon: 'fa-shopping-cart',
            color: 'from-blue-500 to-blue-600',
            change: '+12%',
            positive: true
          },
          {
            title: 'Total Revenue',
            value: `$${orderStats.totalRevenue?.toLocaleString() || '0'}`,
            icon: 'fa-dollar-sign',
            color: 'from-green-500 to-green-600',
            change: '+24%',
            positive: true
          },
          {
            title: 'Paid Orders',
            value: orderStats.paidOrders?.toLocaleString() || '0',
            icon: 'fa-check-circle',
            color: 'from-emerald-500 to-emerald-600',
            change: '+8%',
            positive: true
          },
          {
            title: 'Delivered',
            value: orderStats.deliveredOrders?.toLocaleString() || '0',
            icon: 'fa-truck',
            color: 'from-purple-500 to-purple-600',
            change: '+15%',
            positive: true
          },
          {
            title: 'Avg Order Value',
            value: `$${orderStats.avgOrderValue?.toFixed(0) || '0'}`,
            icon: 'fa-chart-bar',
            color: 'from-orange-500 to-orange-600',
            change: '+5%',
            positive: true
          }
        ].map((stat, index) => (
          <div
            key={index}
            className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl hover:scale-105 transition-all duration-500 relative overflow-hidden ${
              animateCards ? 'animate-fade-in-up' : 'opacity-0'
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/10 to-white/5 rounded-full blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <i className={`fas ${stat.icon} text-white text-lg`}></i>
                </div>
                <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  <i className={`fas ${stat.positive ? 'fa-arrow-up' : 'fa-arrow-down'} mr-1`}></i>
                  {stat.change}
                </div>
              </div>
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Controls */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl mb-8">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search orders, customers, or IDs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <i className="fas fa-search text-gray-400"></i>
              </div>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl px-6 py-3 pr-12 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="all" className="bg-gray-800 text-white">All Orders</option>
                <option value="paid" className="bg-gray-800 text-white">Paid</option>
                <option value="unpaid" className="bg-gray-800 text-white">Unpaid</option>
                <option value="delivered" className="bg-gray-800 text-white">Delivered</option>
                <option value="processing" className="bg-gray-800 text-white">Processing</option>
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <i className="fas fa-chevron-down text-gray-400"></i>
              </div>
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="appearance-none bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl px-6 py-3 pr-12 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="createdAt-desc" className="bg-gray-800 text-white">Newest First</option>
                <option value="createdAt-asc" className="bg-gray-800 text-white">Oldest First</option>
                <option value="totalPrice-desc" className="bg-gray-800 text-white">Highest Value</option>
                <option value="totalPrice-asc" className="bg-gray-800 text-white">Lowest Value</option>
                <option value="customer-asc" className="bg-gray-800 text-white">Customer A-Z</option>
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <i className="fas fa-sort text-gray-400"></i>
              </div>
            </div>
          </div>

          {/* View Mode and Bulk Actions */}
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  viewMode === 'cards' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <i className="fas fa-th-large"></i>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  viewMode === 'table' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <i className="fas fa-table"></i>
              </button>
            </div>

            {/* Bulk Actions */}
            {selectedOrders.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedOrders.length} selected
                </span>
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-2xl transition-all duration-200"
                >
                  <i className="fas fa-list mr-2"></i>
                  Bulk Actions
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bulk Actions Menu */}
        {showBulkActions && selectedOrders.length > 0 && (
          <div className="mt-4 p-4 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleBulkAction('markPaid')}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200"
              >
                <i className="fas fa-check-circle mr-2"></i>
                Mark as Paid
              </button>
              <button
                onClick={() => handleBulkAction('markDelivered')}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200"
              >
                <i className="fas fa-truck mr-2"></i>
                Mark as Delivered
              </button>
              <button
                onClick={() => setSelectedOrders([])}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200"
              >
                <i className="fas fa-times mr-2"></i>
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Orders Display */}
      {viewMode === 'cards' ? (
        /* Cards View */
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {currentOrders.map((order, index) => {
            const priority = getPriorityLevel(order);
            return (
              <div
                key={order._id}
                className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden shadow-2xl hover:scale-105 transition-all duration-500 relative group ${
                  animateCards ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                
                {/* Priority Indicator */}
                {priority !== 'low' && (
                  <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${
                    priority === 'high' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'
                  }`}></div>
                )}

                {/* Selection Checkbox */}
                <div className="absolute top-4 left-4 z-10">
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order._id)}
                    onChange={() => toggleOrderSelection(order._id)}
                    className="w-4 h-4 text-blue-600 bg-white/20 border-white/30 rounded focus:ring-blue-500"
                  />
                </div>

                <div className="p-6">
                  
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Order #{order._id.substring(order._id.length - 8)}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <i className="fas fa-clock mr-1"></i>
                        {getRelativeTime(order.createdAt)}
                      </p>
                    </div>
                    <div className={`w-12 h-12 bg-gradient-to-r ${getStatusColor(order)} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <i className={`fas ${
                        order.isDelivered ? 'fa-truck' : 
                        order.isPaid ? 'fa-credit-card' : 'fa-clock'
                      } text-white`}></i>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {order.user?.name?.charAt(0)?.toUpperCase() || 'G'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {order.user?.name || 'Guest User'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {order.user?.email || 'No email provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        ${order.totalPrice?.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Items</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {order.orderItems?.length || 0}
                      </p>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex gap-2 mb-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      order.isPaid 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      <i className={`fas ${order.isPaid ? 'fa-check-circle' : 'fa-times-circle'} mr-1`}></i>
                      {order.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      order.isDelivered 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      <i className={`fas ${order.isDelivered ? 'fa-truck' : 'fa-clock'} mr-1`}></i>
                      {order.isDelivered ? 'Delivered' : 'Processing'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(`/orders/${order._id}`, '_blank')}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200"
                    >
                      <i className="fas fa-eye mr-2"></i>
                      View Details
                    </button>
                    <div className="relative group">
                      <button className="w-10 h-10 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200">
                        <i className="fas fa-ellipsis-v"></i>
                      </button>
                      
                      {/* Quick Actions Dropdown */}
                      <div className="absolute bottom-full right-0 mb-2 w-48 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="p-2">
                          {!order.isPaid && (
                            <button
                              onClick={() => handleStatusUpdate(order._id, 'isPaid', true)}
                              className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 rounded-xl transition-all duration-200"
                            >
                              <i className="fas fa-check-circle mr-2 text-green-500"></i>
                              Mark as Paid
                            </button>
                          )}
                          {!order.isDelivered && (
                            <button
                              onClick={() => handleStatusUpdate(order._id, 'isDelivered', true)}
                              className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all duration-200"
                            >
                              <i className="fas fa-truck mr-2 text-blue-500"></i>
                              Mark as Delivered
                            </button>
                          )}
                          <button className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 rounded-xl transition-all duration-200">
                            <i className="fas fa-print mr-2 text-purple-500"></i>
                            Print Invoice
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden shadow-2xl mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/20 dark:divide-gray-700/20">
              <thead className="bg-white/10 backdrop-blur-lg">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === currentOrders.length && currentOrders.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOrders(currentOrders.map(order => order._id));
                        } else {
                          setSelectedOrders([]);
                        }
                      }}
                      className="w-4 h-4 text-blue-600 bg-white/20 border-white/30 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    <i className="fas fa-hashtag mr-2"></i>Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    <i className="fas fa-user mr-2"></i>Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    <i className="fas fa-calendar mr-2"></i>Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    <i className="fas fa-dollar-sign mr-2"></i>Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    <i className="fas fa-credit-card mr-2"></i>Payment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    <i className="fas fa-truck mr-2"></i>Delivery
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    <i className="fas fa-cog mr-2"></i>Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20 dark:divide-gray-700/20">
                {currentOrders.map((order, index) => (
                  <tr
                    key={order._id}
                    className={`hover:bg-white/10 transition-all duration-200 ${
                      animateCards ? 'animate-fade-in' : 'opacity-0'
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order._id)}
                        onChange={() => toggleOrderSelection(order._id)}
                        className="w-4 h-4 text-blue-600 bg-white/20 border-white/30 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xs mr-3">
                          {order._id.substring(order._id.length - 2).toUpperCase()}
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          #{order._id.substring(order._id.length - 8)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                          {order.user?.name?.charAt(0)?.toUpperCase() || 'G'}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.user?.name || 'Guest User'}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {order.user?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{formatDate(order.createdAt)}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{getRelativeTime(order.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        ${order.totalPrice?.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.isPaid ? 'paid' : 'unpaid'}
                        onChange={(e) => handleStatusUpdate(order._id, 'isPaid', e.target.value === 'paid')}
                        className={`text-sm rounded-xl px-3 py-2 font-semibold border-0 focus:ring-2 focus:ring-blue-400 ${
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
                        className={`text-sm rounded-xl px-3 py-2 font-semibold border-0 focus:ring-2 focus:ring-blue-400 ${
                          order.isDelivered 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        <option value="delivered">Delivered</option>
                        <option value="processing">Processing</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => window.open(`/orders/${order._id}`, '_blank')}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-105"
                        >
                          <i className="fas fa-eye mr-2"></i>
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((currentPage - 1) * ordersPerPage) + 1} to {Math.min(currentPage * ordersPerPage, filteredAndSortedOrders.length)} of {filteredAndSortedOrders.length} orders
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-10 h-10 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold transition-all duration-200 ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : 'bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return <span key={page} className="text-gray-400">...</span>;
                }
                return null;
              })}
              
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-10 h-10 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
        
        select option {
          background-color: #1f2937;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default OrderManagement;
