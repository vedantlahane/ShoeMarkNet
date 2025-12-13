import React from 'react';

const QuickActionGrid = ({ onAction }) => {
  const actions = [
    {
      id: 'add_product',
      icon: 'fa-plus',
      label: 'Add Product',
      color: 'from-blue-500 to-blue-600',
      description: 'Create new product'
    },
    {
      id: 'manage_orders',
      icon: 'fa-shopping-cart',
      label: 'Manage Orders',
      color: 'from-green-500 to-green-600',
      description: 'Process and track orders'
    },
    {
      id: 'manage_users',
      icon: 'fa-users',
      label: 'Manage Users',
      color: 'from-purple-500 to-purple-600',
      description: 'View and update users'
    },
    {
      id: 'view_analytics',
      icon: 'fa-chart-line',
      label: 'View Analytics',
      color: 'from-emerald-500 to-teal-500',
      description: 'Analytics & insights'
    },
    {
      id: 'bulk_import',
      icon: 'fa-upload',
      label: 'Bulk Import',
      color: 'from-orange-500 to-red-500',
      description: 'Import products'
    },
    {
      id: 'export_data',
      icon: 'fa-download',
      label: 'Export Data',
      color: 'from-teal-500 to-cyan-500',
      description: 'Download reports'
    },
    {
      id: 'open_settings',
      icon: 'fa-cog',
      label: 'System Settings',
      color: 'from-gray-500 to-gray-600',
      description: 'Configure preferences'
    },
    {
      id: 'contact_support',
      icon: 'fa-headset',
      label: 'Contact Support',
      color: 'from-indigo-500 to-purple-500',
      description: 'Get help from support'
    }
  ];

  const handleActionClick = (action) => {
    if (typeof onAction === 'function') {
      onAction(action);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <i className="fas fa-bolt mr-3 text-yellow-500"></i>
        Quick Actions
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => handleActionClick(action)}
            className={`group bg-gradient-to-r ${action.color} hover:scale-105 transform transition-all duration-200 text-white rounded-2xl p-6 text-center shadow-lg relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

            <div className="relative z-10">
              <i className={`fas ${action.icon} text-3xl mb-4 group-hover:animate-bounce`}></i>
              <p className="font-bold text-lg mb-1">{action.label}</p>
              <p className="text-xs opacity-80">{action.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionGrid;
