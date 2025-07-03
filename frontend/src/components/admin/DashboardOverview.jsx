// src/components/admin/DashboardOverview.jsx
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const DashboardOverview = () => {
  const { products } = useSelector(state => state.product);
  const { orders } = useSelector(state => state.order);
  const { users } = useSelector(state => state.auth);
  const [animateStats, setAnimateStats] = useState(false);
  
  // Calculate enhanced metrics
  const totalRevenue = orders?.reduce((sum, order) => sum + order.totalPrice, 0) || 0;
  const pendingOrders = orders?.filter(order => !order.isDelivered).length || 0;
  const lowStockProducts = products?.filter(product => product.countInStock <= 5).length || 0;
  const todaysOrders = orders?.filter(order => {
    const today = new Date().toDateString();
    return new Date(order.createdAt).toDateString() === today;
  }).length || 0;

  // Calculate growth metrics
  const lastMonthRevenue = orders?.filter(order => {
    const orderDate = new Date(order.createdAt);
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    return orderDate >= lastMonth;
  }).reduce((sum, order) => sum + order.totalPrice, 0) || 0;

  const revenueGrowth = lastMonthRevenue > 0 ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue * 100) : 0;

  useEffect(() => {
    if (products && orders && users) {
      console.log('Dashboard data loaded');
      setTimeout(() => setAnimateStats(true), 100);
    }
  }, [products, orders, users]);
    
  if (!products || !orders || !users) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex justify-center items-center h-96">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-12 text-center shadow-2xl">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              <i className="fas fa-chart-line mr-2 text-blue-500"></i>
              Loading Dashboard
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              <i className="fas fa-database mr-2"></i>
              Fetching your analytics data...
            </p>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                <i className="fas fa-tachometer-alt mr-3"></i>
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                <i className="fas fa-calendar-day mr-2"></i>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="text-right">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-2xl shadow-lg">
                <div className="text-2xl font-bold">{todaysOrders}</div>
                <div className="text-sm text-green-100">Orders Today</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Total Revenue Card */}
        <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl hover:scale-105 transition-all duration-500 relative overflow-hidden ${animateStats ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-full blur-xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <i className="fas fa-dollar-sign text-white text-xl"></i>
              </div>
              <div className="text-right">
                <div className={`text-xs font-medium px-2 py-1 rounded-full ${revenueGrowth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  <i className={`fas ${revenueGrowth >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'} mr-1`}></i>
                  {Math.abs(revenueGrowth).toFixed(1)}%
                </div>
              </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">Total Revenue</h3>
            <p className="text-3xl font-black text-gray-900 dark:text-white">${totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              <i className="fas fa-chart-line mr-1"></i>
              All time earnings
            </p>
          </div>
        </div>
        
        {/* Total Products Card */}
        <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl hover:scale-105 transition-all duration-500 relative overflow-hidden ${animateStats ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-full blur-xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <i className="fas fa-box text-white text-xl"></i>
              </div>
              <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                <i className="fas fa-plus mr-1"></i>
                Active
              </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">Total Products</h3>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{products.length.toLocaleString()}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              <i className="fas fa-warehouse mr-1"></i>
              In inventory
            </p>
          </div>
        </div>
        
        {/* Pending Orders Card */}
        <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl hover:scale-105 transition-all duration-500 relative overflow-hidden ${animateStats ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-full blur-xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                <i className="fas fa-clock text-white text-xl"></i>
              </div>
              {pendingOrders > 0 && (
                <div className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full animate-pulse">
                  <i className="fas fa-exclamation-triangle mr-1"></i>
                  Urgent
                </div>
              )}
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">Pending Orders</h3>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{pendingOrders.toLocaleString()}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              <i className="fas fa-shipping-fast mr-1"></i>
              Awaiting fulfillment
            </p>
          </div>
        </div>
        
        {/* Total Users Card */}
        <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl hover:scale-105 transition-all duration-500 relative overflow-hidden ${animateStats ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-full blur-xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <i className="fas fa-users text-white text-xl"></i>
              </div>
              <div className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                <i className="fas fa-user-plus mr-1"></i>
                Growing
              </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">Total Users</h3>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{users.length.toLocaleString()}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              <i className="fas fa-user-friends mr-1"></i>
              Registered customers
            </p>
          </div>
        </div>
      </div>
      
      {/* Enhanced Action Items */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        
        {/* Recent Orders Section */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              <i className="fas fa-shopping-cart mr-3 text-blue-500"></i>
              Recent Orders
            </h2>
            <Link to="/admin/orders" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-2xl transition-all duration-200 transform hover:scale-105">
              <i className="fas fa-external-link-alt mr-2"></i>
              View All
            </Link>
          </div>
          
          {orders.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {orders.slice(0, 5).map((order, index) => (
                <div key={order._id} className={`bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-4 hover:bg-white/20 transition-all duration-200 animate-fade-in-up`} style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                        {order._id.substring(order._id.length - 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          Order #{order._id.substring(order._id.length - 8)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <i className="fas fa-calendar mr-1"></i>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          <i className="fas fa-dollar-sign mr-1 text-green-500"></i>
                          ${order.totalPrice?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        order.isPaid 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        <i className={`fas ${order.isPaid ? 'fa-check-circle' : 'fa-times-circle'} mr-1`}></i>
                        {order.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          order.isDelivered 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          <i className={`fas ${order.isDelivered ? 'fa-truck' : 'fa-clock'} mr-1`}></i>
                          {order.isDelivered ? 'Delivered' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-shopping-cart text-gray-400 text-2xl"></i>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg">No orders yet</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">Orders will appear here when customers start purchasing</p>
            </div>
          )}
        </div>
        
        {/* Low Stock Products Section */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              <i className="fas fa-exclamation-triangle mr-3 text-yellow-500"></i>
              Inventory Alerts
            </h2>
            <Link to="/admin/products" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-2 px-4 rounded-2xl transition-all duration-200 transform hover:scale-105">
              <i className="fas fa-warehouse mr-2"></i>
              Manage Stock
            </Link>
          </div>
          
          {lowStockProducts > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {products
                .filter(product => product.countInStock <= 5)
                .slice(0, 5)
                .map((product, index) => (
                  <div key={product._id} className={`bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-4 hover:bg-white/20 transition-all duration-200 animate-fade-in-up`} style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${
                          product.countInStock === 0 
                            ? 'bg-gradient-to-r from-red-500 to-red-600' 
                            : 'bg-gradient-to-r from-orange-500 to-yellow-500'
                        }`}>
                          <i className={`fas ${product.countInStock === 0 ? 'fa-times' : 'fa-exclamation'}`}></i>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{product.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <i className="fas fa-boxes mr-1"></i>
                            Stock: {product.countInStock} units
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            <i className="fas fa-tag mr-1"></i>
                            ${product.price}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          product.countInStock === 0 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          <i className={`fas ${product.countInStock === 0 ? 'fa-times-circle' : 'fa-exclamation-triangle'} mr-1`}></i>
                          {product.countInStock === 0 ? 'Out of Stock' : 'Low Stock'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-check-circle text-green-500 text-2xl"></i>
              </div>
              <p className="text-green-600 dark:text-green-400 text-lg font-semibold">All Products Well Stocked!</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">No inventory issues detected</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          <i className="fas fa-bolt mr-3 text-yellow-500"></i>
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: 'fa-plus', label: 'Add Product', color: 'from-blue-500 to-blue-600', link: '/admin/products/new' },
            { icon: 'fa-chart-bar', label: 'View Reports', color: 'from-green-500 to-green-600', link: '/admin/reports' },
            { icon: 'fa-users', label: 'Manage Users', color: 'from-purple-500 to-purple-600', link: '/admin/users' },
            { icon: 'fa-cog', label: 'Settings', color: 'from-gray-500 to-gray-600', link: '/admin/settings' }
          ].map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className={`bg-gradient-to-r ${action.color} hover:scale-105 transform transition-all duration-200 text-white rounded-2xl p-6 text-center shadow-lg group`}
            >
              <i className={`fas ${action.icon} text-2xl mb-3 group-hover:animate-bounce`}></i>
              <p className="font-semibold text-sm">{action.label}</p>
            </Link>
          ))}
        </div>
      </div>

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
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default DashboardOverview;
