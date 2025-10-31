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
      className={`admin-surface transition-opacity duration-300 ${
        animateCards ? 'animate-fade-in-up' : 'opacity-0'
      } ${className}`}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <span className="admin-meta-chip">Bulk Actions</span>
          <h3 className="admin-section-heading mt-3">
            {selectedCount} order{selectedCount > 1 ? 's' : ''} selected
          </h3>
          <p className="admin-section-subheading">
            Choose an action to perform on the selected orders.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => onBulkAction(action.id)}
              className={`admin-button ${action.variant === 'primary' ? 'admin-button--primary' : ''}`}
              style={action.accentColor
                ? {
                    borderColor: action.accentColor,
                    backgroundColor: action.variant === 'primary' ? action.accentColor : 'transparent',
                    color: action.variant === 'primary' ? '#ffffff' : action.accentColor,
                  }
                : undefined
              }
            >
              <i className={`fas ${action.icon} text-xs`}></i>
              {action.label}
            </button>
          ))}
          <button
            type="button"
            onClick={onClearSelection}
            className="admin-button"
          >
            <i className="fas fa-times text-xs"></i>
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
      accentColor: PropTypes.string,
      variant: PropTypes.oneOf(['primary', 'default'])
    })
  ).isRequired,
  onBulkAction: PropTypes.func.isRequired,
  onClearSelection: PropTypes.func.isRequired,
  animateCards: PropTypes.bool,
  className: PropTypes.string,
};

export default OrderBulkActions;
