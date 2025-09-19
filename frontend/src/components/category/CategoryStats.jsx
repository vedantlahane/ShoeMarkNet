import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

// Utils
import { trackEvent } from '../../utils/analytics';

// Constants
const STAT_CARDS_DATA = [
  {
    id: 'totalProducts',
    title: 'Total Products',
    icon: 'fas fa-box',
    color: 'from-blue-500 to-cyan-500',
    trend: '+12%',
    trendDirection: 'up'
  },
  {
    id: 'totalSales',
    title: 'Total Sales',
    icon: 'fas fa-dollar-sign',
    color: 'from-green-500 to-emerald-500',
    trend: '+8.5%',
    trendDirection: 'up'
  },
  {
    id: 'avgRating',
    title: 'Average Rating',
    icon: 'fas fa-star',
    color: 'from-yellow-500 to-orange-500',
    trend: '+0.3',
    trendDirection: 'up'
  },
  {
    id: 'viewCount',
    title: 'Total Views',
    icon: 'fas fa-eye',
    color: 'from-purple-500 to-pink-500',
    trend: '+15%',
    trendDirection: 'up'
  }
];

const TIME_PERIODS = [
  { id: '7d', label: '7 Days', days: 7 },
  { id: '30d', label: '30 Days', days: 30 },
  { id: '90d', label: '90 Days', days: 90 },
  { id: '1y', label: '1 Year', days: 365 }
];

const CategoryStats = ({
  categoryId,
  categoryName = 'Category',
  showCharts = true,
  showTrends = true,
  showComparison = false,
  variant = 'default', // default, compact, detailed
  className = ''
}) => {
  // State management
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [animateElements, setAnimateElements] = useState(false);
  const [activeMetric, setActiveMetric] = useState('totalProducts');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - replace with actual API calls based on your services
  const [statsData, setStatsData] = useState({
    totalProducts: 1247,
    totalSales: 125670,
    avgRating: 4.6,
    viewCount: 89234,
    topSellingProducts: [
      { name: 'Nike Air Max 90', sales: 234, revenue: 25890 },
      { name: 'Adidas Ultraboost', sales: 198, revenue: 22340 },
      { name: 'Jordan 1 Retro', sales: 167, revenue: 28950 }
    ],
    salesTrend: [
      { date: '2024-01-01', value: 1200 },
      { date: '2024-01-08', value: 1350 },
      { date: '2024-01-15', value: 1180 },
      { date: '2024-01-22', value: 1420 },
      { date: '2024-01-29', value: 1590 }
    ],
    categoryBreakdown: [
      { name: 'Running', count: 423, percentage: 34 },
      { name: 'Basketball', count: 312, percentage: 25 },
      { name: 'Casual', count: 298, percentage: 24 },
      { name: 'Athletic', count: 214, percentage: 17 }
    ]
  });

  // Initialize animations
  useEffect(() => {
    setTimeout(() => setAnimateElements(true), 100);
  }, []);

  // Handle period change
  const handlePeriodChange = useCallback((periodId) => {
    setSelectedPeriod(periodId);
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    trackEvent('category_stats_period_changed', {
      category_id: categoryId,
      category_name: categoryName,
      period: periodId
    });
  }, [categoryId, categoryName]);

  // Format number with commas and abbreviations
  const formatNumber = useCallback((num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  }, []);

  // Get metric value
  const getMetricValue = useCallback((metricId) => {
    switch (metricId) {
      case 'totalProducts':
        return formatNumber(statsData.totalProducts);
      case 'totalSales':
        return '$' + formatNumber(statsData.totalSales);
      case 'avgRating':
        return statsData.avgRating.toFixed(1);
      case 'viewCount':
        return formatNumber(statsData.viewCount);
      default:
        return '0';
    }
  }, [statsData, formatNumber]);

  // Render stat cards
  const renderStatCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {STAT_CARDS_DATA.map((stat, index) => (
        <div
          key={stat.id}
          className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 cursor-pointer group ${
            animateElements ? 'animate-fade-in-up' : 'opacity-0'
          }`}
          style={{ animationDelay: `${index * 0.1}s` }}
          onClick={() => setActiveMetric(stat.id)}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
              <i className={`${stat.icon} text-white text-lg`}></i>
            </div>
            {showTrends && (
              <div className={`flex items-center text-sm font-semibold ${
                stat.trendDirection === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                <i className={`fas fa-arrow-${stat.trendDirection} mr-1`}></i>
                {stat.trend}
              </div>
            )}
          </div>

          {/* Value */}
          <div className="mb-2">
            <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">
              {isLoading ? (
                <div className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded h-8 w-20"></div>
              ) : (
                getMetricValue(stat.id)
              )}
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {stat.title}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000 ease-out`}
              style={{ 
                width: activeMetric === stat.id ? '100%' : '70%',
                animationDelay: `${index * 0.2}s`
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render top products
  const renderTopProducts = () => (
    <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl ${
      animateElements ? 'animate-fade-in-up' : 'opacity-0'
    }`} style={{ animationDelay: '0.6s' }}>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <i className="fas fa-trophy mr-3 text-yellow-500"></i>
        Top Selling Products
        <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
          (Last {TIME_PERIODS.find(p => p.id === selectedPeriod)?.label})
        </span>
      </h3>

      <div className="space-y-4">
        {statsData.topSellingProducts.map((product, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl hover:bg-white/20 transition-all duration-200"
          >
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                'bg-gradient-to-r from-orange-600 to-orange-800'
              }`}>
                {index + 1}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {product.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {product.sales} sales
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-900 dark:text-white">
                ${formatNumber(product.revenue)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Revenue
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render category breakdown
  const renderCategoryBreakdown = () => (
    <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl ${
      animateElements ? 'animate-fade-in-up' : 'opacity-0'
    }`} style={{ animationDelay: '0.8s' }}>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <i className="fas fa-chart-pie mr-3 text-purple-500"></i>
        Category Breakdown
      </h3>

      <div className="space-y-4">
        {statsData.categoryBreakdown.map((category, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900 dark:text-white">
                {category.name}
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {category.count} products
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {category.percentage}%
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r transition-all duration-1000 ease-out ${
                  index === 0 ? 'from-blue-500 to-cyan-500' :
                  index === 1 ? 'from-green-500 to-emerald-500' :
                  index === 2 ? 'from-purple-500 to-pink-500' :
                  'from-orange-500 to-red-500'
                }`}
                style={{ 
                  width: `${category.percentage}%`,
                  animationDelay: `${index * 0.2}s`
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render charts placeholder
  const renderCharts = () => (
    <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl ${
      animateElements ? 'animate-fade-in-up' : 'opacity-0'
    }`} style={{ animationDelay: '1s' }}>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <i className="fas fa-chart-line mr-3 text-green-500"></i>
        Sales Trend
        <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
          (Last {TIME_PERIODS.find(p => p.id === selectedPeriod)?.label})
        </span>
      </h3>

      {/* Chart Placeholder */}
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 text-center">
        <i className="fas fa-chart-area text-gray-400 text-6xl mb-4"></i>
        <h4 className="font-semibold text-gray-600 dark:text-gray-400 mb-2">Interactive Charts</h4>
        <p className="text-gray-500 dark:text-gray-500 text-sm">
          Chart integration coming soon...
        </p>
        <div className="mt-4 grid grid-cols-5 gap-2">
          {statsData.salesTrend.map((point, index) => (
            <div
              key={index}
              className="bg-blue-500 rounded opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
              style={{ height: `${Math.random() * 60 + 20}px` }}
              title={`$${formatNumber(point.value)} on ${point.date}`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-8 ${className}`}>
      
      {/* Header */}
      <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl ${
        animateElements ? 'animate-fade-in-up' : 'opacity-0'
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              <i className="fas fa-chart-bar mr-3"></i>
              {categoryName} Analytics
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive insights and performance metrics
            </p>
          </div>

          {/* Time Period Selector */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-1">
            <div className="flex space-x-1">
              {TIME_PERIODS.map((period) => (
                <button
                  key={period.id}
                  onClick={() => handlePeriodChange(period.id)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                    selectedPeriod === period.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Cards */}
      {renderStatCards()}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        {renderTopProducts()}

        {/* Category Breakdown */}
        {renderCategoryBreakdown()}
      </div>

      {/* Charts Section */}
      {showCharts && renderCharts()}

      {/* Summary Section */}
      <div className={`bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white ${
        animateElements ? 'animate-fade-in-up' : 'opacity-0'
      }`} style={{ animationDelay: '1.2s' }}>
        <h3 className="text-2xl font-bold mb-6">
          <i className="fas fa-lightbulb mr-3"></i>
          Key Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6">
            <div className="flex items-center mb-3">
              <i className="fas fa-trending-up text-green-300 text-2xl mr-3"></i>
              <h4 className="font-bold">Growth Trend</h4>
            </div>
            <p className="text-white/90 text-sm">
              Category performance shows consistent upward trend with 12% growth in products and 8.5% increase in sales.
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6">
            <div className="flex items-center mb-3">
              <i className="fas fa-users text-blue-300 text-2xl mr-3"></i>
              <h4 className="font-bold">Customer Satisfaction</h4>
            </div>
            <p className="text-white/90 text-sm">
              Average rating of 4.6/5 indicates high customer satisfaction with improved product quality and service.
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6">
            <div className="flex items-center mb-3">
              <i className="fas fa-bullseye text-purple-300 text-2xl mr-3"></i>
              <h4 className="font-bold">Opportunities</h4>
            </div>
            <p className="text-white/90 text-sm">
              Focus on running and basketball segments which show highest engagement and conversion rates.
            </p>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
    </div>
  );
};

export default CategoryStats;
