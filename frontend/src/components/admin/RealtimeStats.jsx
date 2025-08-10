import React from 'react';
import { formatNumber, formatCurrency } from '../../utils/helpers';

const RealtimeStats = ({ data, isConnected }) => {
  if (!data || !isConnected) return null;

  const stats = [
    {
      label: 'Active Users',
      value: formatNumber(data.activeUsers || 0),
      icon: 'fa-users',
      color: 'text-green-500'
    },
    {
      label: 'Orders Today',
      value: formatNumber(data.ordersToday || 0),
      icon: 'fa-shopping-cart',
      color: 'text-blue-500'
    },
    {
      label: 'Revenue',
      value: formatCurrency(data.revenue || 0),
      icon: 'fa-dollar-sign',
      color: 'text-purple-500'
    }
  ];

  return (
    <div className="flex items-center space-x-6">
      {stats.map((stat, index) => (
        <div key={index} className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center ${stat.color}`}>
            <i className={`fas ${stat.icon} text-sm`}></i>
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">
              {stat.value}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {stat.label}
            </div>
          </div>
        </div>
      ))}
      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Live Updates"></div>
    </div>
  );
};

export default RealtimeStats;
