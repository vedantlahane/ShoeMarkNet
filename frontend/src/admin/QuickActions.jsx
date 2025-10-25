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
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => {
              if (typeof onActionClick === 'function') {
                onActionClick(action);
              }
            }}
            className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:bg-slate-800"
          >
            <i className={`fa-solid ${action.icon} text-xs`} />
            {action.label}
            <i className="fa-solid fa-arrow-right text-[11px] text-slate-400 transition group-hover:text-blue-500 dark:text-slate-500 dark:group-hover:text-blue-300" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
