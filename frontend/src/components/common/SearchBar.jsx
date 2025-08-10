import React, { useState, useRef, useEffect } from 'react';

const SearchBar = ({ 
  value = '', 
  onChange, 
  onSubmit,
  placeholder = 'Search...', 
  className = '',
  showClearButton = true,
  autoFocus = false,
  disabled = false 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(value);
    }
  };

  const handleClear = () => {
    if (onChange) {
      onChange('');
    }
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className={`relative flex items-center ${isFocused ? 'ring-2 ring-blue-500' : ''} rounded-lg border border-gray-300 bg-white`}>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg 
            className="h-5 w-5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className="block w-full pl-10 pr-10 py-2 border-0 rounded-lg focus:outline-none focus:ring-0 disabled:opacity-50"
        />
        
        {showClearButton && value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600"
          >
            <svg 
              className="h-4 w-4 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;
