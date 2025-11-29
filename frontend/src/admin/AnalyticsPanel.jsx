import React, { useState, useEffect } from 'react';
import { FaUsers, FaArrowUp, FaArrowDown, FaChartBar, FaCalendarAlt } from 'react-icons/fa';

const AnalyticsPanel = ({ className = "" }) => {
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalUsers: 0,
      totalOrders: 0,
      totalRevenue: 0,
      conversionRate: 0
    },
    trends: {
      userGrowth: 0,
      orderGrowth: 0,
      revenueGrowth: 0
    },
    timeframe: 'month'
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        // Mock data - replace with actual API call
        const mockData = {
          overview: {
            totalUsers: 15847,
            totalOrders: 3291,
            totalRevenue: 127430,
            conversionRate: 3.2
          },
          trends: {
            userGrowth: 12.5,
            orderGrowth: 8.3,
            revenueGrowth: 15.7
          },
          timeframe: analyticsData.timeframe
        };
        
        setAnalyticsData(mockData);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [analyticsData.timeframe]);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const StatCard = ({ title, value, trend, icon: Icon, prefix = '', suffix = '' }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {prefix}{loading ? '...' : formatNumber(value)}{suffix}
          </p>
        </div>
        <div className={`p-3 rounded-full ${
          trend >= 0 ? 'bg-green-100' : 'bg-red-100'
        }`}>
          <Icon className={`w-6 h-6 ${
            trend >= 0 ? 'text-green-600' : 'text-red-600'
          }`} />
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-4 flex items-center">
          {trend >= 0 ? (
            <FaArrowUp className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <FaArrowDown className="w-4 h-4 text-red-500 mr-1" />
          )}
          <span className={`text-sm font-medium ${
            trend >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {Math.abs(trend)}%
          </span>
          <span className="text-sm text-gray-500 ml-1">
            vs last {analyticsData.timeframe}
          </span>
        </div>
      )}
    </div>
  );

  const timeframeOptions = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  return (
    <div className={`analytics-panel ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <FaChartBar className="mr-3 text-blue-600" />
          Analytics Overview
        </h2>
        
        <div className="flex items-center space-x-4">
          <select
            value={analyticsData.timeframe}
            onChange={(e) => setAnalyticsData(prev => ({
              ...prev,
              timeframe: e.target.value
            }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            {timeframeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={analyticsData.overview.totalUsers}
          trend={analyticsData.trends.userGrowth}
          icon={FaUsers}
        />
        
        <StatCard
          title="Total Orders"
          value={analyticsData.overview.totalOrders}
          trend={analyticsData.trends.orderGrowth}
          icon={FaChartBar}
        />
        
        <StatCard
          title="Total Revenue"
          value={analyticsData.overview.totalRevenue}
          trend={analyticsData.trends.revenueGrowth}
          icon={FaArrowUp}
          prefix="$"
        />
        
        <StatCard
          title="Conversion Rate"
          value={analyticsData.overview.conversionRate}
          icon={FaCalendarAlt}
          suffix="%"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow dark:shadow-none border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Revenue Trend</h3>
          <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded">
            <p className="text-slate-500 dark:text-slate-400">Revenue chart would go here</p>
          </div>
        </div>

        {/* Orders Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow dark:shadow-none border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Order Volume</h3>
          <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded">
            <p className="text-slate-500 dark:text-slate-400">Orders chart would go here</p>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="mt-8 bg-white dark:bg-slate-900 rounded-lg shadow dark:shadow-none border border-slate-200 dark:border-slate-800 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Key Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {loading ? '...' : '67.2%'}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Customer Retention</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
              {loading ? '...' : '$89.50'}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Average Order Value</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              {loading ? '...' : '4.7'}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Customer Satisfaction</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
