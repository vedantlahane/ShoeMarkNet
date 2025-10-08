import React from 'react';
import PropTypes from 'prop-types';
import { formatCurrency, formatNumber } from '../../../utils/helpers';

const MetricCard = ({ icon, title, value, helper, accent, animate, style }) => (
  <div
    className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-xl transition-transform duration-300 ${
      animate ? 'animate-fade-in-up' : ''
    }`}
    style={style}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</h3>
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${accent}`}>
        <i className={`fas ${icon} text-lg`}></i>
      </div>
    </div>
    {helper && (
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">{helper}</p>
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
    <section className={`grid gap-6 sm:grid-cols-2 xl:grid-cols-4 ${className}`}>
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
