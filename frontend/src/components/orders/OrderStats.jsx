import React from 'react';
import { formatCurrency, formatNumber, formatPercentage } from '../../utils/helpers';

const OrderStats = ({ stats, realtimeData, animateCards, className = '' }) => {
  const statsData = [
    {
      title: 'Total Orders',
      value: formatNumber(stats.totalOrders || 0),
      icon: 'fa-shopping-cart',
      accentColor: '#1d4ed8',
      change: realtimeData?.orderGrowth || '+12%',
      positive: true,
      subtitle: 'All time orders'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue || 0),
      icon: 'fa-dollar-sign',
      accentColor: '#15803d',
      change: realtimeData?.revenueGrowth || '+24%',
      positive: true,
      subtitle: 'Gross revenue'
    },
    {
      title: 'Paid Orders',
      value: formatNumber(stats.paidOrders || 0),
      icon: 'fa-check-circle',
      accentColor: '#059669',
      change: formatPercentage(stats.conversionRate || 0),
      positive: true,
      subtitle: 'Payment rate'
    },
    {
      title: 'Processing',
      value: formatNumber(stats.processingOrders || 0),
      icon: 'fa-cog',
      accentColor: '#b45309',
      change: stats.processingOrders > 10 ? 'High' : 'Normal',
      positive: stats.processingOrders <= 10,
      subtitle: 'Awaiting fulfillment'
    },
    {
      title: 'Delivered',
      value: formatNumber(stats.deliveredOrders || 0),
      icon: 'fa-truck',
      accentColor: '#7c3aed',
      change: '+15%',
      positive: true,
      subtitle: 'Completed orders'
    },
    {
      title: 'Avg Order Value',
      value: formatCurrency(stats.avgOrderValue || 0),
      icon: 'fa-chart-bar',
      accentColor: '#3730a3',
      change: '+5%',
      positive: true,
      subtitle: 'Per order average'
    }
  ];

  return (
    <div className={`grid gap-[var(--admin-space-md)] sm:grid-cols-2 xl:grid-cols-3 ${className}`}>
      {statsData.map((stat, index) => (
        <div
          key={index}
          className={`${animateCards ? 'animate-fade-in-up' : ''}`}
          style={{ animationDelay: `${index * 0.04}s` }}
        >
          <div className="admin-surface-muted flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span
                className="flex h-9 w-9 items-center justify-center border"
                style={{ borderColor: stat.accentColor, color: stat.accentColor }}
              >
                <i className={`fa-solid ${stat.icon}`}></i>
              </span>
              <div className="space-y-1">
                <span className="admin-meta-chip">{stat.subtitle}</span>
                <p className="text-lg font-semibold">{stat.value}</p>
                <p className="text-sm text-[var(--admin-text-muted)]">{stat.title}</p>
              </div>
            </div>
            <span
              className="inline-flex items-center gap-2 text-xs font-semibold"
              style={{ color: stat.positive ? '#047857' : '#b91c1c' }}
            >
              <i className={`fa-solid ${stat.positive ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}`}></i>
              {stat.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderStats;
