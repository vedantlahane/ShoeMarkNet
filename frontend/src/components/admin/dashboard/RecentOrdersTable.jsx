import React from 'react';

const RecentOrdersTable = () => {
  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Recent Orders
      </h3>
      <p className="text-gray-600 dark:text-gray-400">Loading recent orders...</p>
    </div>
  );
};

export default RecentOrdersTable;
