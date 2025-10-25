import React from 'react';
import PropTypes from 'prop-types';
import { formatNumber } from '../../utils/helpers';

const StatCard = ({ icon, title, value, helper, accent, animate, delay = 0 }) => (
  <div
    className={`rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm transition duration-300 dark:border-slate-800 dark:bg-slate-900/80 ${
      animate ? 'animate-fade-in-up' : ''
    }`}
    style={{ animationDelay: `${delay}s` }}
  >
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{title}</p>
        <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</h3>
      </div>
      <span className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${accent}`}>
        <i className={`fas ${icon} text-lg`}></i>
      </span>
    </div>
    {helper && (
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{helper}</p>
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
  <section className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-4 ${className}`}>
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
