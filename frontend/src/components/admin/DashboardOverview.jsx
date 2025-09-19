import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Redux actions
import { fetchProducts } from '../../redux/slices/productSlice';
import { fetchAllOrders } from '../../redux/slices/orderSlice';
import { fetchUsers } from '../../redux/slices/authSlice';
import adminService from '../../services/adminService';

// Components
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import StatsCard from './dashboard/StatsCard';
import RevenueChart from './dashboard/RevenueChart';
import OrdersChart from './dashboard/OrdersChart';
import RecentOrdersTable from './dashboard/RecentOrdersTable';
import InventoryAlerts from './dashboard/InventoryAlerts';
import QuickActionGrid from './dashboard/QuickActionGrid';
// import PerformanceMetrics from './dashboard/PerformanceMetrics';
// import TopProductsWidget from './dashboard/TopProductsWidget';
// import CustomerAnalytics from './dashboard/CustomerAnalytics';
// import LiveActivityFeed from './dashboard/LiveActivityFeed';

// Hooks
import useWebSocket from '../../hooks/useWebSocket';
import useLocalStorage from '../../hooks/useLocalStorage';
import useDebounce from '../../hooks/useDebounce';

// Utils
import { trackEvent } from '../../utils/analytics';
import { formatCurrency, formatNumber, formatPercentage } from '../../utils/helpers';

// Constants
const REFRESH_INTERVAL = 30000; // 30 seconds
const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4'
};

const DashboardOverview = ({ stats, realtimeData, onDataUpdate, isLoading }) => {
  const dispatch = useDispatch();

  // Redux state
  const { products, loading: productsLoading } = useSelector(state => state.product);
  const { adminOrders, loading: ordersLoading } = useSelector(state => state.order);
  const { users, loading: usersLoading } = useSelector(state => state.auth);

  // WebSocket for real-time updates
  const { isConnected, lastMessage } = useWebSocket('/admin/dashboard');

  // Local state
  const [animateStats, setAnimateStats] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useLocalStorage('dashboardTimeRange', '7d');
  const [refreshing, setRefreshing] = useState(false);
  const [chartData, setChartData] = useState({
    revenue: [],
    orders: [],
    customers: []
  });
  const [activeMetric, setActiveMetric] = useState('revenue');
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);

  // Debounced refresh function
  const debouncedRefresh = useDebounce(() => {
    fetchDashboardData();
  }, 1000);

  // Initialize component
  useEffect(() => {
    const timer = setTimeout(() => setAnimateStats(true), 100);
    fetchDashboardData();
    
    // Track dashboard view
    trackEvent('admin_dashboard_viewed', {
      time_range: selectedTimeRange,
      timestamp: new Date().toISOString()
    });

    return () => clearTimeout(timer);
  }, [selectedTimeRange]);

  // Auto-refresh dashboard data
  useEffect(() => {
    const interval = setInterval(() => {
      if (!refreshing) {
        debouncedRefresh();
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [refreshing, debouncedRefresh]);

  // Handle real-time updates
  useEffect(() => {
    if (lastMessage && isConnected) {
      const data = JSON.parse(lastMessage.data);
      if (data.type === 'dashboard_update') {
        setDashboardData(prev => ({
          ...prev,
          ...data.payload
        }));
      }
    }
  }, [lastMessage, isConnected]);

  // Fetch comprehensive dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setRefreshing(true);
      
      const [dashboardStats, salesReport, customerAnalytics] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getSalesReport({ timeRange: selectedTimeRange }),
        adminService.getCustomerAnalytics({ timeRange: selectedTimeRange })
      ]);

      setDashboardData({
        ...dashboardStats,
        salesReport,
        customerAnalytics
      });

      // Update chart data
      setChartData({
        revenue: salesReport.revenueChart || [],
        orders: salesReport.ordersChart || [],
        customers: customerAnalytics.customersChart || []
      });

      if (onDataUpdate) {
        onDataUpdate(dashboardStats);
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [selectedTimeRange, onDataUpdate]);

  // Calculate enhanced metrics
  const enhancedMetrics = useMemo(() => {
    if (!dashboardData && (!products || !adminOrders?.items || !users)) {
      return null;
    }

    const ordersData = adminOrders?.items || [];
    const productsData = products || [];
    const usersData = users || [];

    // Revenue calculations
    const totalRevenue = ordersData.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const todayRevenue = ordersData
      .filter(order => {
        const today = new Date().toDateString();
        return new Date(order.createdAt).toDateString() === today;
      })
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    const lastMonthRevenue = ordersData
      .filter(order => {
        const orderDate = new Date(order.createdAt);
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return orderDate >= lastMonth;
      })
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    const revenueGrowth = lastMonthRevenue > 0 ? 
      ((totalRevenue - lastMonthRevenue) / lastMonthRevenue * 100) : 0;

    // Order calculations
    const totalOrders = ordersData.length;
    const pendingOrders = ordersData.filter(order => !order.isDelivered).length;
    const todaysOrders = ordersData.filter(order => {
      const today = new Date().toDateString();
      return new Date(order.createdAt).toDateString() === today;
    }).length;

    // Product calculations
    const totalProducts = productsData.length;
    const lowStockProducts = productsData.filter(product => 
      (product.countInStock || 0) <= 5
    ).length;
    const outOfStockProducts = productsData.filter(product => 
      (product.countInStock || 0) === 0
    ).length;

    // User calculations
    const totalUsers = usersData.length;
    const activeUsers = usersData.filter(user => {
      const lastActive = new Date(user.lastLogin || user.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return lastActive >= thirtyDaysAgo;
    }).length;

    // Advanced metrics
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const conversionRate = totalUsers > 0 ? (totalOrders / totalUsers) * 100 : 0;
    const customerLifetimeValue = activeUsers > 0 ? totalRevenue / activeUsers : 0;

    return {
      revenue: {
        total: totalRevenue,
        today: todayRevenue,
        growth: revenueGrowth,
        average: averageOrderValue
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        today: todaysOrders,
        fulfilled: totalOrders - pendingOrders
      },
      products: {
        total: totalProducts,
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts,
        inStock: totalProducts - outOfStockProducts
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        conversionRate,
        lifetimeValue: customerLifetimeValue
      }
    };
  }, [dashboardData, products, adminOrders, users]);

  // Handle metric selection
  const handleMetricSelect = useCallback((metric) => {
    setActiveMetric(metric);
    trackEvent('dashboard_metric_selected', {
      metric,
      time_range: selectedTimeRange
    });
  }, [selectedTimeRange]);

  // Handle time range change
  const handleTimeRangeChange = useCallback((range) => {
    setSelectedTimeRange(range);
    trackEvent('dashboard_time_range_changed', {
      from_range: selectedTimeRange,
      to_range: range
    });
  }, [selectedTimeRange, setSelectedTimeRange]);

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    fetchDashboardData();
    trackEvent('dashboard_manual_refresh');
  }, [fetchDashboardData]);

  if (isLoading || (!enhancedMetrics && (productsLoading || ordersLoading || usersLoading))) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex justify-center items-center h-96">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-12 text-center shadow-2xl">
            <LoadingSpinner size="large" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 mt-6">
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

  if (!enhancedMetrics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <ErrorMessage 
          message="Failed to load dashboard data"
          onRetry={fetchDashboardData}
          className="max-w-md mx-auto"
        />
      </div>
    );
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>Admin Dashboard | ShoeMarkNet Control Center</title>
        <meta name="description" content="Comprehensive admin dashboard with real-time analytics, order management, and business insights for ShoeMarkNet." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        
        {/* Enhanced Header */}
        <div className={`mb-8 ${animateStats ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    <i className="fas fa-tachometer-alt mr-3"></i>
                    Admin Dashboard
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-lg flex items-center">
                    <i className="fas fa-calendar-day mr-2"></i>
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  
                  {/* Connection Status */}
                  <div className="flex items-center mt-2 space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {isConnected ? 'Live Updates' : 'Offline'}
                      </span>
                    </div>
                    {refreshing && (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm text-blue-600 dark:text-blue-400">Refreshing...</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  
                  {/* Time Range Selector */}
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Period:</label>
                    <select
                      value={selectedTimeRange}
                      onChange={(e) => handleTimeRangeChange(e.target.value)}
                      className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="1d" className="bg-gray-800 text-white">Last 24 Hours</option>
                      <option value="7d" className="bg-gray-800 text-white">Last 7 Days</option>
                      <option value="30d" className="bg-gray-800 text-white">Last 30 Days</option>
                      <option value="90d" className="bg-gray-800 text-white">Last 90 Days</option>
                      <option value="1y" className="bg-gray-800 text-white">Last Year</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="w-10 h-10 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/30 transition-all duration-200 disabled:opacity-50"
                      title="Refresh Dashboard"
                    >
                      <i className={`fas fa-sync-alt ${refreshing ? 'animate-spin' : ''}`}></i>
                    </button>
                    
                    <button
                      onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
                      className="w-10 h-10 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-white/30 transition-all duration-200"
                      title="Advanced Metrics"
                    >
                      <i className="fas fa-chart-bar"></i>
                    </button>
                  </div>

                  {/* Today's Highlight */}
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-2xl shadow-lg">
                    <div className="text-2xl font-bold">{enhancedMetrics.orders.today}</div>
                    <div className="text-sm text-green-100">Orders Today</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(enhancedMetrics.revenue.total)}
            icon="fa-dollar-sign"
            color="from-blue-500 to-blue-600"
            change={enhancedMetrics.revenue.growth}
            subtitle="All time earnings"
            animateStats={animateStats}
            animationDelay="0.1s"
            onClick={() => handleMetricSelect('revenue')}
            isActive={activeMetric === 'revenue'}
          />
          
          <StatsCard
            title="Total Products"
            value={formatNumber(enhancedMetrics.products.total)}
            icon="fa-boxes"
            color="from-green-500 to-green-600"
            badge={{ text: `${enhancedMetrics.products.inStock} Active`, type: 'success' }}
            subtitle="In inventory"
            animateStats={animateStats}
            animationDelay="0.2s"
            onClick={() => handleMetricSelect('products')}
            isActive={activeMetric === 'products'}
          />
          
          <StatsCard
            title="Pending Orders"
            value={formatNumber(enhancedMetrics.orders.pending)}
            icon="fa-clock"
            color="from-yellow-500 to-orange-500"
            urgent={enhancedMetrics.orders.pending > 0}
            subtitle="Awaiting fulfillment"
            animateStats={animateStats}
            animationDelay="0.3s"
            onClick={() => handleMetricSelect('orders')}
            isActive={activeMetric === 'orders'}
          />
          
          <StatsCard
            title="Total Users"
            value={formatNumber(enhancedMetrics.users.total)}
            icon="fa-users"
            color="from-purple-500 to-purple-600"
            badge={{ text: `${enhancedMetrics.users.active} Active`, type: 'info' }}
            subtitle="Registered customers"
            animateStats={animateStats}
            animationDelay="0.4s"
            onClick={() => handleMetricSelect('users')}
            isActive={activeMetric === 'users'}
          />
        </div>

        {/* Advanced Metrics Panel */}
        {showAdvancedMetrics && (
          <div className={`mb-12 ${animateStats ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.5s' }}>
            <PerformanceMetrics
              metrics={enhancedMetrics}
              timeRange={selectedTimeRange}
              chartData={chartData}
            />
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
          <div className={`${animateStats ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
            <RevenueChart
              data={chartData.revenue}
              timeRange={selectedTimeRange}
              totalRevenue={enhancedMetrics.revenue.total}
              growth={enhancedMetrics.revenue.growth}
            />
          </div>
          
          <div className={`${animateStats ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.7s' }}>
            <OrdersChart
              data={chartData.orders}
              timeRange={selectedTimeRange}
              totalOrders={enhancedMetrics.orders.total}
              pending={enhancedMetrics.orders.pending}
            />
          </div>
        </div>

        {/* Enhanced Data Tables and Widgets */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
          
          {/* Recent Orders with Enhanced Features */}
          <div className={`${animateStats ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
            <RecentOrdersTable
              orders={adminOrders?.items || []}
              totalOrders={enhancedMetrics.orders.total}
              todaysOrders={enhancedMetrics.orders.today}
            />
          </div>
          
          {/* Enhanced Inventory Alerts */}
          <div className={`${animateStats ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.9s' }}>
            <InventoryAlerts
              products={products || []}
              lowStockCount={enhancedMetrics.products.lowStock}
              outOfStockCount={enhancedMetrics.products.outOfStock}
            />
          </div>
        </div>

        {/* Additional Widgets Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Top Products Widget */}
          <div className={`${animateStats ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '1.0s' }}>
            <TopProductsWidget
              products={products || []}
              orders={adminOrders?.items || []}
              timeRange={selectedTimeRange}
            />
          </div>
          
          {/* Customer Analytics Widget */}
          <div className={`${animateStats ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '1.1s' }}>
            <CustomerAnalytics
              users={users || []}
              orders={adminOrders?.items || []}
              metrics={enhancedMetrics.users}
            />
          </div>
          
          {/* Live Activity Feed */}
          <div className={`${animateStats ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '1.2s' }}>
            <LiveActivityFeed
              realtimeData={realtimeData}
              isConnected={isConnected}
            />
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div className={`${animateStats ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '1.3s' }}>
          <QuickActionGrid />
        </div>

        {/* Custom Styles */}
      </div>
    </>
  );
};

export default DashboardOverview;
