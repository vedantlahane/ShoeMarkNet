import React from 'react';

const RecentSearches = ({ searches, onSelect }) => {
  if (!searches || searches.length === 0) return null;

  return (
    <div className="mt-6">
      <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 flex items-center">
        <i className="fas fa-history mr-2 text-blue-500"></i>
        Recent Searches
      </h4>
      <div className="flex flex-wrap gap-2">
        {searches.slice(0, 6).map((search, index) => (
          <button
            key={index}
            onClick={() => onSelect(search)}
            className="bg-white/20 backdrop-blur-lg border border-white/30 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-xl hover:bg-white/30 transition-all duration-200 text-sm"
          >
            {search}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecentSearches;
