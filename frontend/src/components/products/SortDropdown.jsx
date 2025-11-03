import React, { useState, useRef, useEffect } from 'react';

const SortDropdown = ({ value, options, onChange }) => {
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
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white/70 px-4 py-2 text-sm font-medium text-slate-900 shadow-sm backdrop-blur-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-100"
      >
        <span>{selectedOption?.label || 'Sort by'}</span>
        <i className={`fas fa-chevron-down text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-slate-200/70 bg-white/90 shadow-lg backdrop-blur-lg dark:border-slate-700/60 dark:bg-slate-900/90">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors duration-200 ${
                  selectedOption?.value === option.value
                    ? 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <i className={`fas ${option.icon} text-slate-500`} />
                  <span>{option.label}</span>
                </div>
                {selectedOption?.value === option.value && (
                  <i className="fas fa-check text-blue-500" />
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
