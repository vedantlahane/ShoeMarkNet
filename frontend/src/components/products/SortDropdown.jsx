import React, { useState, useRef, useEffect } from 'react';

const SortDropdown = ({ value, options, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
      >
        <i className={`fas ${selectedOption?.icon || 'fa-sort'} text-gray-500`}></i>
        <span>{selectedOption?.label || 'Sort'}</span>
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-gray-400 ml-2`}></i>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 ${
                  value === option.value 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-900 dark:text-white'
                }`}
              >
                <i className={`fas ${option.icon} w-4 text-center`}></i>
                <span>{option.label}</span>
                {value === option.value && (
                  <i className="fas fa-check ml-auto text-blue-600 dark:text-blue-400"></i>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SortDropdown;
