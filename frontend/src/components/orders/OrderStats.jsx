import React from 'react';
import { formatPrice } from '../../utils/helpers';

const OrderStats = ({ stats, className = '', style = {} }) => {
  const statItems = [
    { 
      title: 'Total Orders', 
      count: stats.total, 
      icon: 'fa-shopping-bag', 
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
    },
    { 
      title: 'Processing', 
      count: stats.processing, 
      icon: 'fa-cog', 
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200'
    },
    { 
      title: 'Delivered', 
      count: stats.delivered, 
      icon: 'fa-check-circle', 
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
    },
    { 
      title: 'Total Value', 
      count: formatPrice(stats.totalValue), 
      icon: 'fa-dollar-sign', 
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200'
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`} style={style}>
      {statItems.map((stat, index) => (
        <div
          key={index}
          className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl hover:scale-105 transition-all duration-500 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <i className={`fas ${stat.icon} text-white text-lg`}></i>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${stat.bgColor}`}>
              +{Math.floor(Math.random() * 20)}% this month
            </div>
          </div>
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">{stat.title}</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.count}</p>
        </div>
      ))}
    </div>
  );
};

export default OrderStats;
