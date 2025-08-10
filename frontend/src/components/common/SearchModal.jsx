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
        className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl w-full max-w-2xl shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <i className="fas fa-search mr-3 text-blue-500"></i>
              Search Products
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
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
              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              {loading ? (
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <i className="fas fa-search text-gray-400 text-lg"></i>
              )}
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {searchResults?.length > 0 ? (
            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Found {searchResults.length} results for "{searchQuery}"
              </p>
              <div className="space-y-3">
                {searchResults.map((product, index) => (
                  <div key={product.id} className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover mr-4"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{product.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{product.brand}</p>
                      <p className="text-blue-600 dark:text-blue-400 font-bold">${product.price}</p>
                    </div>
                    <i className="fas fa-arrow-right text-gray-400"></i>
                  </div>
                ))}
              </div>
            </div>
          ) : searchQuery && !loading ? (
            <div className="p-12 text-center">
              <i className="fas fa-search text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
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
