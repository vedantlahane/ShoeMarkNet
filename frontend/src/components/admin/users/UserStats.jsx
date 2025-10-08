import React from 'react';
import PropTypes from 'prop-types';
import { formatNumber } from '../../../utils/helpers';

const StatCard = ({ icon, title, value, helper, accent, animate, delay = 0 }) => (
  <div
    className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-xl transition-transform duration-300 ${
      animate ? 'animate-fade-in-up' : ''
    }`}
    style={{ animationDelay: `${delay}s` }}
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

const UserStats = ({ stats, realtimeData, animateCards = false, className = '' }) => {
  if (!stats) {
    return null;
  }

  const cards = [
    {
      key: 'totalUsers',
      icon: 'fa-users',
      title: 'Total Users',
      value: formatNumber(stats.totalUsers || 0),
      helper: `${formatNumber(stats.activeUsers || 0)} active • ${formatNumber(stats.inactiveUsers || 0)} inactive`,
      accent: 'bg-gradient-to-br from-blue-500 to-purple-500'
    },
    {
      key: 'verifiedUsers',
      icon: 'fa-user-shield',
      title: 'Verification',
      value: formatNumber(stats.verifiedUsers || 0),
      helper: `${formatNumber(stats.bannedUsers || 0)} banned • ${formatNumber((stats.totalUsers || 0) - (stats.verifiedUsers || 0))} unverified`,
      accent: 'bg-gradient-to-br from-emerald-500 to-teal-500'
    },
    {
      key: 'leadScore',
      icon: 'fa-chart-line',
      title: 'Avg Lead Score',
      value: stats.avgLeadScore ? Number(stats.avgLeadScore).toFixed(1) : '0.0',
      helper: `${formatNumber(stats.newUsersThisMonth || 0)} new this month`,
      accent: 'bg-gradient-to-br from-amber-500 to-orange-500'
    },
    {
      key: 'engagement',
      icon: 'fa-signal',
      title: 'Recent Engagement',
      value: formatNumber(realtimeData?.activeUsers ?? stats.activeLastWeek ?? 0),
      helper: realtimeData?.timestamp
        ? `Live as of ${new Date(realtimeData.timestamp).toLocaleTimeString()}`
        : `${formatNumber(stats.activeLastWeek || 0)} active in last 7 days`,
      accent: 'bg-gradient-to-br from-pink-500 to-rose-500'
    }
  ];

  return (
    <section className={`grid gap-6 sm:grid-cols-2 xl:grid-cols-4 ${className}`}>
      {cards.map((card, index) => (
        <StatCard
          key={card.key}
          icon={card.icon}
          title={card.title}
          value={card.value}
          helper={card.helper}
          accent={card.accent}
          animate={animateCards}
          delay={index * 0.05}
        />
      ))}
    </section>
  );
};

StatCard.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  helper: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  accent: PropTypes.string,
  animate: PropTypes.bool,
  delay: PropTypes.number
};

UserStats.propTypes = {
  stats: PropTypes.object,
  realtimeData: PropTypes.object,
  animateCards: PropTypes.bool,
  className: PropTypes.string
};

export default UserStats;
