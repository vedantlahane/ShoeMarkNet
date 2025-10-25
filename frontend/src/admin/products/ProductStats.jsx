import React from 'react';
import PropTypes from 'prop-types';
import { formatCurrency, formatNumber } from '../../utils/helpers';

const MetricCard = ({ icon, title, value, helper, accent, animate, style }) => (
  <div
    className={`rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm transition duration-300 dark:border-slate-800 dark:bg-slate-900/80 ${
      animate ? 'animate-fade-in-up' : ''
    }`}
    style={style}
  >
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{title}</p>
        <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</h3>
      </div>
      <span className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${accent}`}>
        <i className={`fas ${icon} text-lg`} />
      </span>
    </div>
    {helper && (
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{helper}</p>
    )}
  </div>
);

const ProductStats = ({ stats, realtimeData, animateCards = false, className = '' }) => {
  if (!stats) {
    return null;
  }

  const cards = [
    {
      key: 'totalProducts',
      icon: 'fa-boxes',
      title: 'Total Products',
      value: formatNumber(stats.totalProducts || 0),
      helper: `${formatNumber(stats.activeProducts || 0)} active • ${formatNumber(stats.inactiveProducts || 0)} inactive`,
      accent: 'bg-gradient-to-br from-blue-500 to-purple-500'
    },
    {
      key: 'inventory',
      icon: 'fa-warehouse',
      title: 'Inventory',
      value: formatNumber(stats.totalStock || 0),
      helper: `${formatNumber(stats.lowStockProducts || 0)} low • ${formatNumber(stats.outOfStockProducts || 0)} out`,
      accent: 'bg-gradient-to-br from-emerald-500 to-teal-500'
    },
    {
      key: 'value',
      icon: 'fa-dollar-sign',
      title: 'Stock Value',
      value: formatCurrency(stats.totalValue || 0),
      helper: `Avg price ${formatCurrency(stats.averagePrice || 0)}`,
      accent: 'bg-gradient-to-br from-amber-500 to-orange-500'
    },
    {
      key: 'engagement',
      icon: 'fa-signal',
      title: 'Live Signals',
      value: realtimeData?.revenue
        ? formatCurrency(realtimeData.revenue)
        : formatCurrency(stats.revenueToday || 0),
      helper: realtimeData?.ordersToday
        ? `${formatNumber(realtimeData.ordersToday)} orders today`
        : `${formatNumber(stats.todaysOrders || 0)} orders today`,
      accent: 'bg-gradient-to-br from-pink-500 to-rose-500'
    }
  ];

  return (
  <section className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-4 ${className}`}>
      {cards.map((card, index) => (
        <MetricCard
          key={card.key}
          icon={card.icon}
          title={card.title}
          value={card.value}
          helper={card.helper}
          accent={card.accent}
          animate={animateCards}
          style={{ animationDelay: `${index * 0.05}s` }}
        />
      ))}
    </section>
  );
};

ProductStats.propTypes = {
  stats: PropTypes.object,
  realtimeData: PropTypes.object,
  animateCards: PropTypes.bool,
  className: PropTypes.string
};

export default ProductStats;
