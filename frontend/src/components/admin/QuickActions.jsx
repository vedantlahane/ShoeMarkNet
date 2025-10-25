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
    <div className="space-y-3">
      <h4 className="flex items-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        <i className="fa-solid fa-bolt mr-2 text-amber-500" />
        Quick actions
      </h4>
      <div className="flex flex-col divide-y divide-slate-200/70 overflow-hidden rounded-md border border-slate-200/80 dark:divide-slate-800/70 dark:border-slate-700/70">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => {
              if (typeof onActionClick === 'function') {
                onActionClick(action);
              }
            }}
            className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/80"
          >
            <span className="flex items-center gap-2">
              <i className={`fa-solid ${action.icon}`} />
              {action.label}
            </span>
            <i className="fa-solid fa-arrow-right text-xs text-slate-400 dark:text-slate-500" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
