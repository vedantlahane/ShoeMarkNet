import React from 'react';
import PropTypes from 'prop-types';

const BulkActionsPanel = ({
  selectedCount,
  actions = [],
  onBulkAction,
  onClearSelection,
  animateCards = false,
  className = ''
}) => {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <section
      className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-xl ${
        animateCards ? 'animate-fade-in-up' : ''
      } ${className}`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {selectedCount} product{selectedCount > 1 ? 's' : ''} selected
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Choose an action to apply to all selected products. Actions may take a few moments to process.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => onBulkAction(action.id)}
              className={`px-4 py-2 rounded-2xl text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent ${
                action.color || 'bg-gradient-to-r from-blue-600 to-purple-600'
              }`}
            >
              <i className={`fas ${action.icon} mr-2`}></i>
              {action.label}
            </button>
          ))}

          <button
            type="button"
            onClick={onClearSelection}
            className="px-4 py-2 rounded-2xl text-sm font-semibold text-gray-700 bg-white/80 border border-gray-200 hover:bg-white shadow-sm"
          >
            Clear selection
          </button>
        </div>
      </div>
    </section>
  );
};

BulkActionsPanel.propTypes = {
  selectedCount: PropTypes.number.isRequired,
  actions: PropTypes.array,
  onBulkAction: PropTypes.func.isRequired,
  onClearSelection: PropTypes.func.isRequired,
  animateCards: PropTypes.bool,
  className: PropTypes.string
};

export default BulkActionsPanel;
