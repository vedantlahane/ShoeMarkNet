import React from 'react';

const SearchSuggestions = ({ suggestions, onSelect, onClose }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl shadow-2xl z-50 max-h-64 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
            <i className="fas fa-search mr-2 text-blue-500"></i>
            Suggestions
          </h4>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="space-y-1">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSelect(suggestion)}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/20 transition-colors text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <i className="fas fa-search mr-2 text-gray-400"></i>
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchSuggestions;
