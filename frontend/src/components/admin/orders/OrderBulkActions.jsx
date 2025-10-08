import React from 'react';
import PropTypes from 'prop-types';

const OrderBulkActions = ({
  selectedCount,
  actions,
  onBulkAction,
  onClearSelection,
  animateCards,
  className = '',
}) => {
  if (selectedCount <= 0) {
    return null;
  }

  return (
    <div
      className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl transition-all duration-500 ${
        animateCards ? 'animate-fade-in-up' : 'opacity-0'
      } ${className}`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <i className="fas fa-layer-group text-blue-500"></i>
            {selectedCount} order{selectedCount > 1 ? 's' : ''} selected
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Choose an action to perform on the selected orders.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => onBulkAction(action.id)}
              className={`px-4 py-2 rounded-2xl font-semibold text-white shadow-lg transition-transform duration-200 hover:scale-105 bg-gradient-to-r ${action.color}`}
            >
              <i className={`fas ${action.icon} mr-2`}></i>
              {action.label}
            </button>
          ))}
          <button
            onClick={onClearSelection}
            className="px-4 py-2 rounded-2xl font-semibold text-gray-800 dark:text-gray-200 bg-white/70 dark:bg-white/10 border border-white/20 dark:border-gray-700/40 hover:bg-white transition"
          >
            <i className="fas fa-times mr-2"></i>
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

OrderBulkActions.propTypes = {
  selectedCount: PropTypes.number.isRequired,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
    })
  ).isRequired,
  onBulkAction: PropTypes.func.isRequired,
  onClearSelection: PropTypes.func.isRequired,
  animateCards: PropTypes.bool,
  className: PropTypes.string,
};

export default OrderBulkActions;
