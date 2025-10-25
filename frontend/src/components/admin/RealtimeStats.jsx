import React from 'react';
import { formatNumber, formatCurrency } from '../../utils/helpers';

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
    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
      {stats.map((stat, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <i className={`fas ${stat.icon} text-sm`}></i>
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {stat.value}
            </p>
            <p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
              {stat.label}
            </p>
          </div>
        </div>
      ))}
      <span className="flex items-center gap-2 text-xs font-semibold text-emerald-500">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400"></span>
        Live
      </span>
    </div>
  );
};

export default RealtimeStats;
