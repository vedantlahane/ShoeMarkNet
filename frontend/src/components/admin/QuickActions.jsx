import React from 'react';

const QuickActions = ({ onActionClick }) => {
  const actions = [
    {
      id: 'add_product',
      label: 'Add Product',
      icon: 'fa-plus'
    },
    {
      id: 'bulk_import',
      label: 'Bulk Import',
      icon: 'fa-upload'
    },
    {
      id: 'export_data',
      label: 'Export Data',
      icon: 'fa-download'
    }
  ];

  return (
    <div>
      <h4 className="mb-3 flex items-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        <i className="fas fa-bolt mr-2 text-amber-400"></i>
        Quick Actions
      </h4>
      <div className="space-y-2">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => {
              if (typeof onActionClick === 'function') {
                onActionClick(action);
              }
            }}
            className="admin-quick-action"
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <i className={`fas ${action.icon}`}></i>
              {action.label}
            </span>
            <i className="fas fa-arrow-right text-xs text-slate-400 dark:text-slate-500"></i>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
