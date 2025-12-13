import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency, formatNumber, formatPercentage } from '../../utils/helpers';

const CustomerAnalytics = ({ users = [], orders = [], metrics }) => {
  const summary = useMemo(() => {
    const baseMetrics = metrics || {};
    const totalUsers = baseMetrics.total ?? users.length;
    const activeUsers = baseMetrics.active ?? users.filter((user) => isRecentlyActive(user)).length;

    const totalOrders = orders.length;
    const uniqueCustomers = new Set(orders.map((order) => order?.user?._id || order?.userId)).size;
    const repeatCustomers = new Set(
      orders
        .filter((order) => order?.user?._id || order?.userId)
        .map((order) => order?.user?._id || order?.userId)
    ).size;

    const conversionRate = baseMetrics.conversionRate ?? (totalUsers > 0 ? (totalOrders / totalUsers) * 100 : 0);
    const lifetimeValue = baseMetrics.lifetimeValue ?? calculateLifetimeValue(orders, activeUsers || totalUsers || 1);

    return {
      totalUsers,
      activeUsers,
      uniqueCustomers,
      repeatCustomers,
      conversionRate,
      lifetimeValue,
    };
  }, [users, orders, metrics]);

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <i className="fas fa-users mr-2 text-purple-500"></i>
          Customer Insights
        </h3>
        <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Engagement
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MetricTile
          icon="fa-user-friends"
          label="Total Customers"
          value={formatNumber(summary.totalUsers)}
          trend={summary.uniqueCustomers}
          trendLabel="unique"
        />
        <MetricTile
          icon="fa-user-check"
          label="Active Customers"
          value={formatNumber(summary.activeUsers)}
          trend={summary.repeatCustomers}
          trendLabel="repeat"
        />
        <MetricTile
          icon="fa-percentage"
          label="Conversion Rate"
          value={formatPercentage(summary.conversionRate)}
        />
        <MetricTile
          icon="fa-coins"
          label="Customer LTV"
          value={formatCurrency(summary.lifetimeValue)}
        />
      </div>
    </div>
  );
};

const MetricTile = ({ icon, label, value, trend, trendLabel }) => (
  <div className="bg-white/40 dark:bg-gray-900/40 border border-white/20 dark:border-gray-700/30 rounded-2xl p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</span>
      <div className="bg-purple-100/50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-300 rounded-full px-2 py-1 text-xs">
        <i className={`fas ${icon}`}></i>
      </div>
    </div>
    <p className="text-xl font-semibold text-gray-900 dark:text-white">{value}</p>
    {trend !== undefined && trendLabel && (
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {formatNumber(trend)} {trendLabel}
      </p>
    )}
  </div>
);

const isRecentlyActive = (user) => {
  if (!user) return false;
  const lastActive = user.lastLogin || user.updatedAt || user.createdAt;
  if (!lastActive) return false;
  const lastActiveDate = new Date(lastActive);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return lastActiveDate >= thirtyDaysAgo;
};

const calculateLifetimeValue = (orders, denominator) => {
  if (!orders || orders.length === 0) return 0;
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  return denominator > 0 ? totalRevenue / denominator : totalRevenue;
};

MetricTile.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  trend: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  trendLabel: PropTypes.string,
};

CustomerAnalytics.propTypes = {
  users: PropTypes.array,
  orders: PropTypes.array,
  metrics: PropTypes.shape({
    total: PropTypes.number,
    active: PropTypes.number,
    conversionRate: PropTypes.number,
    lifetimeValue: PropTypes.number,
  }),
};

export default CustomerAnalytics;
