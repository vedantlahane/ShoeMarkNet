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
    <div className="grid gap-2 sm:grid-cols-2">
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          onClick={() => {
            if (typeof onActionClick === 'function') {
              onActionClick(action);
            }
          }}
          className="admin-button w-full justify-between"
        >
          <span className="inline-flex items-center gap-1.5">
            <i className={`fa-solid ${action.icon} text-[11px]`} />
            {action.label}
          </span>
          <i className="fa-solid fa-arrow-right text-[10px] text-slate-400" />
        </button>
      ))}
    </div>
  );
};

export default QuickActions;
