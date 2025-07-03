// src/pages/Orders.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../components/common/Loader';
import { format } from 'date-fns';
import { FaSearch, FaEye, FaFileInvoice, FaTimesCircle } from 'react-icons/fa';

// Dummy orders data
const DUMMY_ORDERS = [
  {
    _id: 'ORD12345678',
    createdAt: '2025-06-08T10:30:00Z',
    totalPrice: 159.99,
    status: 'Processing',
    isPaid: true,
    isDelivered: false,
    orderItems: [
      { name: 'Running Shoes', qty: 1, price: 129.99 },
      { name: 'Athletic Socks', qty: 2, price: 15.00 }
    ],
    shippingAddress: { 
      fullName: 'Alice Doe',
      address: '123 Main St',
      city: 'New York',
      country: 'USA'
    }
  },
  {
    _id: 'ORD87654321',
    createdAt: '2025-06-02T15:15:00Z',
    totalPrice: 89.49,
    status: 'Delivered',
    isPaid: true,
    isDelivered: true,
    orderItems: [
      { name: 'Leather Loafers', qty: 1, price: 89.49 }
    ],
    shippingAddress: { 
      fullName: 'Bob Smith',
      address: '456 Oak Ave',
      city: 'Los Angeles',
      country: 'USA'
    }
  },
  {
    _id: 'ORD11223344',
    createdAt: '2025-05-28T09:00:00Z',
    totalPrice: 45.00,
    status: 'Cancelled',
    isPaid: false,
    isDelivered: false,
    orderItems: [
      { name: 'Summer Flip Flops', qty: 2, price: 22.50 }
    ],
    shippingAddress: { 
      fullName: 'Charlie Brown',
      address: '789 Pine St',
      city: 'Chicago',
      country: 'USA'
    }
  },
  {
    _id: 'ORD55667788',
    createdAt: '2025-05-20T14:30:00Z',
    totalPrice: 299.99,
    status: 'Shipped',
    isPaid: true,
    isDelivered: false,
    orderItems: [
      { name: 'Designer Sneakers', qty: 1, price: 249.99 },
      { name: 'Shoe Care Kit', qty: 1, price: 50.00 }
    ],
    shippingAddress: { 
      fullName: 'Diana Prince',
      address: '321 Hero Blvd',
      city: 'Metropolis',
      country: 'USA'
    }
  }
];

const Orders = () => {
  const navigate = useNavigate();

  // Simulate authentication (set to true for demo)
  const isAuthenticated = true;
  const user = { name: 'Demo User' };

  // State management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [animateElements, setAnimateElements] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const ordersPerPage = 6;

  // Trigger animations
  useEffect(() => {
    setAnimateElements(true);
  }, []);

  // Simulate fetching orders
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/orders');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setOrders(DUMMY_ORDERS);
      setLoading(false);
    }, 800);
  }, [isAuthenticated, navigate]);

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'PPP p');
    } catch {
      return 'Invalid date';
    }
  };

  // Get relative time
  const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 1) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return format(date, 'MMM d, yyyy');
  };

  // Format price
  const formatPrice = (price) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);

  // Get status configuration
  const getStatusConfig = (status) => {
    const configs = {
      processing: { 
        color: 'from-blue-500 to-cyan-500', 
        icon: 'fa-clock', 
        label: 'Processing',
        bgColor: 'bg-blue-100 text-blue-800'
      },
      shipped: { 
        color: 'from-purple-500 to-pink-500', 
        icon: 'fa-truck', 
        label: 'Shipped',
        bgColor: 'bg-purple-100 text-purple-800'
      },
      delivered: { 
        color: 'from-green-500 to-emerald-500', 
        icon: 'fa-check-circle', 
        label: 'Delivered',
        bgColor: 'bg-green-100 text-green-800'
      },
      cancelled: { 
        color: 'from-red-500 to-red-600', 
        icon: 'fa-times-circle', 
        label: 'Cancelled',
        bgColor: 'bg-red-100 text-red-800'
      }
    };
    return configs[status?.toLowerCase()] || configs.processing;
  };

  // Filter and search logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      searchTerm === '' ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.shippingAddress?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderItems?.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus =
      filterStatus === 'all' ||
      order.status?.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Calculate order statistics
  const orderStats = {
    total: orders.length,
    processing: orders.filter(o => o.status?.toLowerCase() === 'processing').length,
    shipped: orders.filter(o => o.status?.toLowerCase() === 'shipped').length,
    delivered: orders.filter(o => o.status?.toLowerCase() === 'delivered').length,
    totalValue: orders.reduce((sum, order) => sum + order.totalPrice, 0)
  };

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Enhanced handlers
  const handleCancelOrder = (orderId) => {
    setOrders(prev =>
      prev.map(order =>
        order._id === orderId ? { ...order, status: 'Cancelled' } : order
      )
    );
  };

  const handleDownloadInvoice = (orderId) => {
    // Simulate download with better feedback
    const order = orders.find(o => o._id === orderId);
    if (order) {
      alert(`📄 Invoice for order ${orderId} is being prepared for download...`);
    }
  };

  const toggleOrderSelection = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-500/20 backdrop-blur-xl border border-red-300/50 rounded-3xl p-12 text-center shadow-2xl max-w-md">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-exclamation-triangle text-white text-2xl"></i>
          </div>
          <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
            Error Loading Orders
          </h3>
          <p className="text-red-500 dark:text-red-300 mb-6">{error.message || 'Failed to load orders'}</p>
          <button
            onClick={() => setError(null)}
            className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200"
          >
            <i className="fas fa-redo mr-2"></i>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        
        {/* Enhanced Header */}
        <div className={`mb-8 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  <i className="fas fa-shopping-bag mr-3"></i>
                  Your Orders
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  <i className="fas fa-user mr-2"></i>
                  Welcome back, {user?.name}! Track and manage your purchases here.
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-blue-500/20 backdrop-blur-lg border border-blue-300/50 rounded-2xl px-4 py-2 text-blue-800 dark:text-blue-200">
                  <i className="fas fa-chart-line mr-2"></i>
                  {orderStats.total} Total Orders
                </div>
                <div className="bg-green-500/20 backdrop-blur-lg border border-green-300/50 rounded-2xl px-4 py-2 text-green-800 dark:text-green-200">
                  <i className="fas fa-dollar-sign mr-2"></i>
                  {formatPrice(orderStats.totalValue)} Spent
                </div>
              </div>
            </div>
          </div>
        </div>

        {(!orders || orders.length === 0) ? (
          /* Enhanced Empty State */
          <div className={`text-center py-16 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-12 shadow-2xl max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <i className="fas fa-shopping-bag text-4xl text-white"></i>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                No Orders Yet
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg leading-relaxed">
                You haven't placed any orders yet. Start exploring our amazing collection of shoes 
                and find your perfect pair today!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/products">
                  <button className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-2xl">
                    <i className="fas fa-shopping-cart mr-3"></i>
                    Start Shopping
                    <i className="fas fa-arrow-right ml-3"></i>
                  </button>
                </Link>
                <Link to="/categories">
                  <button className="bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 dark:text-white font-bold py-4 px-8 rounded-2xl hover:bg-white/30 transition-all duration-200">
                    <i className="fas fa-th-large mr-3"></i>
                    Browse Categories
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Enhanced Statistics Cards */}
            <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              {[
                { title: 'Processing', count: orderStats.processing, icon: 'fa-clock', color: 'from-blue-500 to-cyan-500' },
                { title: 'Shipped', count: orderStats.shipped, icon: 'fa-truck', color: 'from-purple-500 to-pink-500' },
                { title: 'Delivered', count: orderStats.delivered, icon: 'fa-check-circle', color: 'from-green-500 to-emerald-500' },
                { title: 'Total Value', count: formatPrice(orderStats.totalValue), icon: 'fa-dollar-sign', color: 'from-orange-500 to-red-500' }
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl hover:scale-105 transition-all duration-500"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <i className={`fas ${stat.icon} text-white text-lg`}></i>
                    </div>
                  </div>
                  <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">{stat.title}</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.count}</p>
                </div>
              ))}
            </div>

            {/* Enhanced Filters and Search */}
            <div className={`mb-8 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl">
                <div className="flex flex-col lg:flex-row gap-6">
                  
                  {/* Search */}
                  <div className="relative flex-1">
                    <input
                      type="text"
                      className="w-full pl-12 pr-4 py-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Search orders, products, or customer names..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <FaSearch className="text-gray-400" />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className="relative">
                    <select
                      className="appearance-none bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl px-6 py-3 pr-12 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all" className="bg-gray-800 text-white">All Statuses</option>
                      <option value="processing" className="bg-gray-800 text-white">Processing</option>
                      <option value="shipped" className="bg-gray-800 text-white">Shipped</option>
                      <option value="delivered" className="bg-gray-800 text-white">Delivered</option>
                      <option value="cancelled" className="bg-gray-800 text-white">Cancelled</option>
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <i className="fas fa-chevron-down text-gray-400"></i>
                    </div>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-1">
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

                  {/* Results Count */}
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <i className="fas fa-list-alt mr-2"></i>
                    <span>{filteredOrders.length} orders found</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Orders Display */}
            {viewMode === 'cards' ? (
              /* Cards View */
              <div className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
                {currentOrders.map((order, index) => {
                  const statusConfig = getStatusConfig(order.status);
                  return (
                    <div
                      key={order._id}
                      className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden shadow-2xl hover:scale-105 transition-all duration-500 group"
                    >
                      {/* Order Header */}
                      <div className={`bg-gradient-to-r ${statusConfig.color} p-6 text-white relative`}>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold mb-1">
                              #{order._id.substring(order._id.length - 8).toUpperCase()}
                            </h3>
                            <p className="text-blue-100">
                              <i className="fas fa-calendar mr-2"></i>
                              {getRelativeTime(order.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              {formatPrice(order.totalPrice)}
                            </div>
                            <p className="text-blue-100 text-sm">
                              {order.orderItems?.length || 0} items
                            </p>
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <div className="flex items-center justify-between">
                          <span className="bg-white/20 backdrop-blur-lg px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                            <i className={`fas ${statusConfig.icon} mr-2`}></i>
                            {statusConfig.label}
                          </span>
                          {order.isPaid && (
                            <span className="bg-green-500/30 px-3 py-1 rounded-full text-sm font-semibold">
                              <i className="fas fa-check-circle mr-1"></i>
                              Paid
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Order Content */}
                      <div className="p-6">
                        {/* Customer Info */}
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            <i className="fas fa-user mr-2 text-blue-500"></i>
                            Ship to:
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            {order.shippingAddress?.fullName}<br />
                            {order.shippingAddress?.address}<br />
                            {order.shippingAddress?.city}, {order.shippingAddress?.country}
                          </p>
                        </div>

                        {/* Order Items */}
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                            <i className="fas fa-box mr-2 text-purple-500"></i>
                            Items ({order.orderItems?.length || 0}):
                          </h4>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {order.orderItems?.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm">
                                <span className="text-gray-900 dark:text-white">{item.name}</span>
                                <span className="text-gray-600 dark:text-gray-400">
                                  {item.qty}x {formatPrice(item.price)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Link
                            to={`/orders/${order._id}`}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 text-center"
                          >
                            <FaEye className="inline mr-2" />
                            View Details
                          </Link>
                          
                          <button
                            onClick={() => handleDownloadInvoice(order._id)}
                            className="w-12 h-10 bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center justify-center transition-all duration-200"
                            title="Download Invoice"
                          >
                            <FaFileInvoice />
                          </button>
                          
                          {order.status !== 'cancelled' && order.status !== 'delivered' && (
                            <button
                              onClick={() => handleCancelOrder(order._id)}
                              className="w-12 h-10 bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center justify-center transition-all duration-200"
                              title="Cancel Order"
                            >
                              <FaTimesCircle />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Enhanced Table View */
              <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden shadow-2xl mb-8 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/20 dark:divide-gray-700/20">
                    <thead className="bg-white/10 backdrop-blur-lg">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                          <i className="fas fa-hashtag mr-2"></i>Order ID
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                          <i className="fas fa-calendar mr-2"></i>Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                          <i className="fas fa-dollar-sign mr-2"></i>Total
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                          <i className="fas fa-info-circle mr-2"></i>Status
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                          <i className="fas fa-cog mr-2"></i>Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/20 dark:divide-gray-700/20">
                      {currentOrders.map(order => {
                        const statusConfig = getStatusConfig(order.status);
                        return (
                          <tr key={order._id} className="hover:bg-white/10 transition-all duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className={`w-10 h-10 bg-gradient-to-r ${statusConfig.color} rounded-xl flex items-center justify-center text-white font-bold mr-3`}>
                                  {order._id.substring(order._id.length - 2).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  #{order._id.substring(order._id.length - 8).toUpperCase()}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {getRelativeTime(order.createdAt)}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {formatDate(order.createdAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {formatPrice(order.totalPrice)}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {order.orderItems?.length || 0} {order.orderItems?.length === 1 ? 'item' : 'items'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${statusConfig.color} text-white`}>
                                <i className={`fas ${statusConfig.icon} mr-1`}></i>
                                {statusConfig.label}
                              </span>
                              {order.isPaid && (
                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                  <i className="fas fa-check-circle mr-1"></i>
                                  Paid
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Link
                                  to={`/orders/${order._id}`}
                                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-all duration-200"
                                  title="View Order Details"
                                >
                                  <FaEye />
                                </Link>
                                <button
                                  onClick={() => handleDownloadInvoice(order._id)}
                                  className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-xl transition-all duration-200"
                                  title="Download Invoice"
                                >
                                  <FaFileInvoice />
                                </button>
                                {order.status !== 'cancelled' && order.status !== 'delivered' && (
                                  <button
                                    onClick={() => handleCancelOrder(order._id)}
                                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-xl transition-all duration-200"
                                    title="Cancel Order"
                                  >
                                    <FaTimesCircle />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
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
                            onClick={() => paginate(page)}
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
                      onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(-5px) rotate(-1deg); }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        
        select option {
          background-color: #1f2937;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default Orders;
