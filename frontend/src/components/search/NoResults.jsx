import React from 'react';

const NoResults = ({ 
  query, 
  onClearFilters, 
  hasActiveFilters, 
  recentSearches, 
  onSearchSuggestion 
}) => {
  return (
    <div className="text-center py-20">
      <div className="w-32 h-32 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-8">
        <i className="fas fa-search-minus text-4xl text-white"></i>
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        No results found for "{query}"
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
        We couldn't find any products matching your search. Try adjusting your search terms or filters.
      </p>

      <div className="space-y-4">
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-200 mr-4"
          >
            Clear Filters
          </button>
        )}

        {recentSearches.length > 0 && (
          <div className="mt-8">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Try these popular searches:
            </h4>
            <div className="flex flex-wrap justify-center gap-2">
              {recentSearches.slice(0, 5).map((search, index) => (
                <button
                  key={index}
                  onClick={() => onSearchSuggestion(search)}
                  className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-xl px-4 py-2 text-gray-900 dark:text-white hover:bg-white/20 transition-all duration-200"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoResults;
