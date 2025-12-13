import React from 'react';
import { formatNumber, formatCurrency } from '../utils/helpers';

const RealtimeStats = ({ data, isConnected }) => {
  if (!data || !isConnected) return null;

  const stats = [
    {
      label: 'Active Users',
      value: formatNumber(data.activeUsers || 0),
      icon: 'fa-users'
    },
    {
      label: 'Orders Today',
      value: formatNumber(data.ordersToday || 0),
      icon: 'fa-shopping-cart'
    },
    {
      label: 'Revenue',
      value: formatCurrency(data.revenue || 0),
      icon: 'fa-dollar-sign'
    }
  ];

  return (
    <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
      {stats.map((stat, index) => (
        <div key={index} className="flex items-center gap-3">
          <i className={`fa-solid ${stat.icon} text-slate-400`} />
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{stat.value}</span>
            <span className="text-[10px] uppercase tracking-wider">{stat.label}</span>
          </div>
        </div>
      ))}
      <span className="flex items-center gap-2 text-xs font-semibold text-emerald-500">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
        Live
      </span>
    </div>
  );
};

export default RealtimeStats;
