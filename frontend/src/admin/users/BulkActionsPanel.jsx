import React from 'react';
import PropTypes from 'prop-types';

const BulkActionsPanel = ({
  selectedCount,
  actions,
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
      className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl shadow-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-transform duration-300 ${
        animateCards ? 'animate-fade-in-up' : ''
      } ${className}`}
    >
      <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
        <span className="font-semibold text-lg">{selectedCount} selected</span>
        <button
          type="button"
          onClick={onClearSelection}
          className="px-3 py-1 text-sm rounded-2xl bg-transparent border border-white/20 dark:border-gray-700/20 hover:bg-white/10 text-red-500"
        >
          Clear
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        {actions.map(action => (
          <button
            key={action.id}
            type="button"
            onClick={() => onBulkAction(action.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r ${action.color} hover:shadow-lg transition-transform duration-200 hover:scale-105`}
          >
            <i className={`fas ${action.icon}`}></i>
            {action.label}
          </button>
        ))}
      </div>
    </section>
  );
};

BulkActionsPanel.propTypes = {
  selectedCount: PropTypes.number.isRequired,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired
    })
  ).isRequired,
  onBulkAction: PropTypes.func.isRequired,
  onClearSelection: PropTypes.func.isRequired,
  animateCards: PropTypes.bool,
  className: PropTypes.string
};

export default BulkActionsPanel;
