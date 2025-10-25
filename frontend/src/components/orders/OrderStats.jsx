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
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 ${className}`}>
      {statsData.map((stat, index) => (
        <div
          key={index}
          className={`flex items-start justify-between border-t border-slate-200 pt-4 text-slate-600 first:border-none first:pt-0 dark:border-slate-700 dark:text-slate-300 ${
            animateCards ? 'animate-fade-in-up' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200">
              <i className={`fa-solid ${stat.icon}`} />
            </span>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{stat.subtitle}</p>
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{stat.value}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{stat.title}</p>
            </div>
          </div>
          <span className={`flex items-center gap-1 text-xs font-semibold ${stat.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
            <i className={`fa-solid ${stat.positive ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}`} />
            {stat.change}
          </span>
        </div>
      ))}
    </div>
  );
};

export default OrderStats;
