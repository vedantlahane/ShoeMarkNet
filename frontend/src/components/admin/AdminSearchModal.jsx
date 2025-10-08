import React, { useState, useEffect, useRef } from 'react';

const AdminSearchModal = ({ onClose, onSearch, searchQuery, onResultSelect }) => {
  const [query, setQuery] = useState(searchQuery || '');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setQuery(searchQuery || '');
  }, [searchQuery]);

  const handleSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await onSearch(searchTerm);
      setResults(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [query]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 w-full max-w-2xl shadow-2xl">
        
        {/* Search Input */}
        <div className="relative mb-6">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, orders, users..."
            className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <i className="fas fa-search text-gray-400 text-xl"></i>
          </div>
          {isSearching && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <div className="space-y-2">
              {results.map((result, index) => {
                const fallbackIcon =
                  result.type === 'order'
                    ? 'fa-receipt'
                    : result.type === 'user'
                      ? 'fa-user'
                      : 'fa-box';

                return (
                  <button
                    key={`${result.type}-${result.id || index}`}
                    onClick={() => onResultSelect?.(result)}
                    className="w-full flex items-center p-4 rounded-xl hover:bg-white/15 transition-colors text-left group"
                  >
                    <div className="w-11 h-11 bg-blue-500/20 group-hover:bg-blue-500/30 rounded-xl flex items-center justify-center mr-4 text-blue-500">
                      <i className={`fas ${result.icon || fallbackIcon}`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between space-x-3">
                        <span className="font-semibold text-gray-900 dark:text-white truncate">
                          {result.title}
                        </span>
                        {result.sectionLabel && (
                          <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 hidden sm:block">
                            {result.sectionLabel}
                          </span>
                        )}
                      </div>
                      {result.subtitle && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {result.subtitle}
                        </div>
                      )}
                    </div>
                    {result.badge && (
                      <span className="ml-4 text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full bg-blue-500/15 text-blue-500">
                        {result.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : query && !isSearching ? (
            <div className="text-center py-12">
              <i className="fas fa-search text-gray-400 text-4xl mb-4"></i>
              <p className="text-gray-600 dark:text-gray-400">No results found for "{query}"</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <i className="fas fa-keyboard text-gray-400 text-4xl mb-4"></i>
              <p className="text-gray-600 dark:text-gray-400">Start typing to search...</p>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
};

export default AdminSearchModal;
