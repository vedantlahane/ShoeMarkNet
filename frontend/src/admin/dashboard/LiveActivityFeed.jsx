import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

const LiveActivityFeed = ({ realtimeData, isConnected }) => {
  const { timestamp, activeUsers, ordersToday, revenue } = realtimeData || {};

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <i className={clsx('fas fa-bolt mr-2', isConnected ? 'text-green-500' : 'text-gray-400')}></i>
          Live Activity
        </h3>
        <span className={clsx(
          'text-xs uppercase tracking-wide px-2 py-1 rounded-full',
          isConnected
            ? 'bg-green-100/60 text-green-600 dark:bg-green-500/10 dark:text-green-300'
            : 'bg-gray-100/60 text-gray-500 dark:bg-gray-800/40 dark:text-gray-400'
        )}>
          {isConnected ? 'Connected' : 'Offline'}
        </span>
      </div>

      <div className="space-y-4">
        <LiveStat
          icon="fa-users"
          label="Active users"
          value={activeUsers ?? '—'}
          highlight
        />
        <LiveStat
          icon="fa-shopping-cart"
          label="Orders today"
          value={ordersToday ?? '—'}
        />
        <LiveStat
          icon="fa-dollar-sign"
          label="Real-time revenue"
          value={typeof revenue === 'number' ? `$${revenue.toLocaleString()}` : '—'}
        />
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center">
            <i className="fas fa-clock mr-2"></i>
            Last update: {timestamp ? new Date(timestamp).toLocaleTimeString() : 'No updates yet'}
          </span>
        </div>
      </div>
    </div>
  );
};

const LiveStat = ({ icon, label, value, highlight }) => (
  <div
    className={clsx(
      'flex items-center justify-between bg-white/40 dark:bg-gray-900/40 border border-white/20 dark:border-gray-700/30 rounded-2xl px-4 py-3',
      highlight && 'ring-2 ring-blue-500/40'
    )}
  >
    <div className="flex items-center space-x-3">
      <span className="bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 rounded-2xl px-3 py-2 text-sm">
        <i className={`fas ${icon}`}></i>
      </span>
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
    </div>
    <span className="text-lg font-semibold text-gray-900 dark:text-white">{value}</span>
  </div>
);

LiveStat.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  highlight: PropTypes.bool,
};

LiveActivityFeed.propTypes = {
  realtimeData: PropTypes.shape({
    timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    activeUsers: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    ordersToday: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    revenue: PropTypes.number,
  }),
  isConnected: PropTypes.bool,
};

export default LiveActivityFeed;
