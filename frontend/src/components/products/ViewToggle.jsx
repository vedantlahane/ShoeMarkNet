import React from 'react';

const ViewToggle = ({ value, onChange, className = '' }) => {
  return (
    <div className={`flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1 ${className}`}>
      <button
        onClick={() => onChange('grid')}
        className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200 ${
          value === 'grid'
            ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
        aria-label="Grid view"
        title="Grid view"
      >
        <i className="fas fa-th-large"></i>
      </button>
      <button
        onClick={() => onChange('list')}
        className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200 ${
          value === 'list'
            ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
        aria-label="List view"
        title="List view"
      >
        <i className="fas fa-list"></i>
      </button>
    </div>
  );
};

export default ViewToggle;
