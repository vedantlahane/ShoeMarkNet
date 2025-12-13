import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';

import PageMeta from '../components/seo/PageMeta';

import adminService from '../services/adminService';

// Components
import LoadingSpinner from '../components/common/feedback/LoadingSpinner';
import ErrorMessage from '../components/common/feedback/ErrorMessage';
import StatsCard from './dashboard/StatsCard';
import RevenueChart from './dashboard/RevenueChart';
import OrdersChart from './dashboard/OrdersChart';
import RecentOrdersTable from './dashboard/RecentOrdersTable';
import InventoryAlerts from './dashboard/InventoryAlerts';
import QuickActionGrid from './dashboard/QuickActionGrid';
import TopProductsWidget from './dashboard/TopProductsWidget';
import CustomerAnalytics from './dashboard/CustomerAnalytics';
import LiveActivityFeed from './dashboard/LiveActivityFeed';

// Hooks
import useWebSocket from '../hooks/useWebSocket';
import useLocalStorage from '../hooks/useLocalStorage';

// Utils
import { trackEvent } from '../utils/analytics';
import { formatCurrency, formatNumber } from '../utils/helpers';

// Constants
const REFRESH_INTERVAL = 30000; // 30 seconds

const DashboardOverview = ({ realtimeData, onDataUpdate, isLoading, onQuickAction }) => {

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
  const isFetchingRef = useRef(false);
  const refreshTimeoutRef = useRef(null);

  // Fetch comprehensive dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;

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
      isFetchingRef.current = false;
    }
  }, [selectedTimeRange, onDataUpdate]);

  const scheduleRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    refreshTimeoutRef.current = setTimeout(() => {
      fetchDashboardData();
    }, 1000);
  }, [fetchDashboardData]);

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
  }, [selectedTimeRange, fetchDashboardData]);

  // Auto-refresh dashboard data
  useEffect(() => {
    const interval = setInterval(() => {
      if (!refreshing) {
        scheduleRefresh();
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [refreshing, scheduleRefresh]);

  // Handle real-time updates
  useEffect(() => {
    if (lastMessage && isConnected) {
      if (lastMessage.type === 'dashboard_update') {
        setDashboardData(prev => ({
          ...prev,
          ...lastMessage.payload
        }));
      }
    }
  }, [lastMessage, isConnected]);

  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

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
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="admin-surface text-center">
          <LoadingSpinner size="large" />
          <h3 className="mt-4 text-base font-semibold">Loading dashboard</h3>
          <p className="mt-1 text-[13px] text-slate-500">
            <i className="fa-solid fa-database mr-1" />
            Fetching the latest analytics…
          </p>
        </div>
      </div>
    );
  }

  if (!enhancedMetrics) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <ErrorMessage
          message="Failed to load dashboard data"
          onRetry={fetchDashboardData}
          className="mx-auto max-w-md"
        />
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Admin Dashboard | ShoeMarkNet Control Center"
        description="Comprehensive admin dashboard with real-time analytics, order management, and business insights for ShoeMarkNet."
        robots="noindex, nofollow"
      />
      <section className="space-y-6">
        <div className={`${animateStats ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <header className="admin-surface">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <span className="admin-meta-chip">
                  <i className="fa-solid fa-gauge-high" />
                  Overview
                </span>
                <h1 className="admin-section-heading">Admin Dashboard</h1>
                <p className="admin-section-subheading flex items-center gap-2">
                  <i className="fa-solid fa-calendar-days" />
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    {isConnected ? 'Live updates enabled' : 'Offline'}
                  </span>
                  {refreshing && (
                    <span className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                      <span className="h-3 w-3 animate-spin border border-blue-500 border-t-transparent" />
                      Refreshing…
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="flex items-center gap-2 text-[13px] font-medium" htmlFor="dashboard-range">
                  <span>Period</span>
                  <select
                    id="dashboard-range"
                    value={selectedTimeRange}
                    onChange={(e) => handleTimeRangeChange(e.target.value)}
                    className="border border-slate-300 px-2 py-1 text-[13px] font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-900"
                  >
                    <option value="1d">Last 24 hours</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="1y">Last year</option>
                  </select>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="inline-flex h-9 w-9 items-center justify-center border border-slate-300 text-slate-600 transition hover:border-blue-400 hover:text-blue-600 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300"
                    title="Refresh dashboard"
                  >
                    <i className={`fa-solid fa-arrow-rotate-right ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
                    className="inline-flex h-9 w-9 items-center justify-center border border-slate-300 text-slate-600 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-600 dark:text-slate-300"
                    title="Toggle advanced metrics"
                  >
                    <i className="fa-solid fa-chart-simple" />
                  </button>
                </div>

                <div className="border border-slate-300 px-3 py-2 text-left text-slate-700 dark:border-slate-600 dark:text-slate-200">
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em]">Orders today</p>
                  <p className="text-lg font-semibold">{enhancedMetrics.orders.today}</p>
                </div>
              </div>
            </div>
          </header>
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
          <QuickActionGrid onAction={(action) => onQuickAction?.(action.id)} />
        </div>
      </section>
    </>
  );
};

export default DashboardOverview;
