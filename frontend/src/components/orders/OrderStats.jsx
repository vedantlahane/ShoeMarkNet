import React from 'react';
import { formatCurrency, formatNumber, formatPercentage } from '../../utils/helpers';

const OrderStats = ({ stats, realtimeData, animateCards, className = '' }) => {
  const statsData = [
    {
      title: 'Total Orders',
      value: formatNumber(stats.totalOrders || 0),
      icon: 'fa-shopping-cart',
      color: 'from-blue-500 to-blue-600',
      change: realtimeData?.orderGrowth || '+12%',
      positive: true,
      subtitle: 'All time orders'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue || 0),
      icon: 'fa-dollar-sign',
      color: 'from-green-500 to-green-600',
      change: realtimeData?.revenueGrowth || '+24%',
      positive: true,
      subtitle: 'Gross revenue'
    },
    {
      title: 'Paid Orders',
      value: formatNumber(stats.paidOrders || 0),
      icon: 'fa-check-circle',
      color: 'from-emerald-500 to-emerald-600',
      change: formatPercentage(stats.conversionRate || 0),
      positive: true,
      subtitle: 'Payment rate'
    },
    {
      title: 'Processing',
      value: formatNumber(stats.processingOrders || 0),
      icon: 'fa-cog',
      color: 'from-yellow-500 to-orange-500',
      change: stats.processingOrders > 10 ? 'High' : 'Normal',
      positive: stats.processingOrders <= 10,
      subtitle: 'Awaiting fulfillment'
    },
    {
      title: 'Delivered',
      value: formatNumber(stats.deliveredOrders || 0),
      icon: 'fa-truck',
      color: 'from-purple-500 to-purple-600',
      change: '+15%',
      positive: true,
      subtitle: 'Completed orders'
    },
    {
      title: 'Avg Order Value',
      value: formatCurrency(stats.avgOrderValue || 0),
      icon: 'fa-chart-bar',
      color: 'from-indigo-500 to-indigo-600',
      change: '+5%',
      positive: true,
      subtitle: 'Per order average'
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 ${className}`}>
      {statsData.map((stat, index) => (
        <div
          key={index}
          className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl hover:scale-105 transition-all duration-500 relative overflow-hidden group ${
            animateCards ? 'animate-fade-in-up' : 'opacity-0'
          }`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {/* Background Glow */}
          <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color}/20 rounded-full blur-xl`}></div>
          
          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                <i className={`fas ${stat.icon} text-white text-lg`}></i>
              </div>
              <div className={`text-xs font-medium px-3 py-1 rounded-full ${
                stat.positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <i className={`fas ${stat.positive ? 'fa-arrow-up' : 'fa-arrow-down'} mr-1`}></i>
                {stat.change}
              </div>
            </div>
            
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">{stat.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderStats;
