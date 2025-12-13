import React, { forwardRef, useEffect } from 'react';

const SearchModal = forwardRef(({ 
  isOpen, 
  searchQuery, 
  searchResults, 
  loading, 
  onQueryChange, 
  onClose, 
  onSearch 
}, ref) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl w-full max-w-xl shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <i className="fas fa-search mr-2 text-blue-500"></i>
              Search Products
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <i className="fas fa-times text-gray-500"></i>
            </button>
          </div>
          
          <div className="relative">
            <input
              ref={ref}
              type="text"
              value={searchQuery}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch(searchQuery)}
              placeholder="Search for shoes, brands, categories..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <i className="fas fa-search text-gray-400"></i>
              )}
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div className="max-h-80 overflow-y-auto">
          {searchResults?.length > 0 ? (
            <div className="p-4">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                Found {searchResults.length} results for "{searchQuery}"
              </p>
              <div className="space-y-2">
                {searchResults.map((product, index) => (
                  <div key={product.id} className="flex items-center p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover mr-3"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">{product.name}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{product.brand}</p>
                      <p className="text-blue-600 dark:text-blue-400 font-semibold text-sm">${product.price}</p>
                    </div>
                    <i className="fas fa-arrow-right text-gray-400 text-sm"></i>
                  </div>
                ))}
              </div>
            </div>
          ) : searchQuery && !loading ? (
            <div className="p-8 text-center">
              <i className="fas fa-search text-5xl text-gray-300 dark:text-gray-600 mb-3"></i>
              <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                No results found
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Try different keywords or check your spelling
              </p>
            </div>
          ) : (
            <div className="p-12 text-center">
              <i className="fas fa-search text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Start typing to search
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Find your perfect pair from thousands of products
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

SearchModal.displayName = 'SearchModal';

export default SearchModal;
