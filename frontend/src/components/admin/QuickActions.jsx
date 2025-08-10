import React from 'react';

const QuickActions = ({ onActionClick }) => {
  const actions = [
    {
      id: 'add_product',
      label: 'Add Product',
      icon: 'fa-plus',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'bulk_import',
      label: 'Bulk Import',
      icon: 'fa-upload',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'export_data',
      label: 'Export Data',
      icon: 'fa-download',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
        <i className="fas fa-bolt mr-2 text-yellow-500"></i>
        Quick Actions
      </h4>
      <div className="space-y-2">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onActionClick(action)}
            className={`w-full flex items-center p-3 rounded-xl bg-gradient-to-r ${action.color} text-white hover:scale-105 transition-all duration-200 shadow-lg`}
          >
            <i className={`fas ${action.icon} mr-3`}></i>
            <span className="font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
