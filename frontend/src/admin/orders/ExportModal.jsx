import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';

const DEFAULT_FORMATS = [
  { id: 'csv', label: 'CSV (Excel compatible)', icon: 'fa-file-csv' },
  { id: 'json', label: 'JSON', icon: 'fa-code' },
];

const ExportModal = ({ onClose, onExport, totalOrders = 0, filters = {}, formats = DEFAULT_FORMATS }) => {
  const [selectedFormat, setSelectedFormat] = useState(formats[0]?.id ?? 'csv');
  const [isExporting, setIsExporting] = useState(false);

  const appliedFilters = useMemo(() => {
    return Object.entries(filters)
      .filter(([, value]) => value !== undefined && value !== null && value !== '' && !(typeof value === 'object' && Object.keys(value).length === 0))
      .map(([key, value]) => ({ key, value }));
  }, [filters]);

  const handleExport = async () => {
    if (!onExport) {
      return;
    }

    setIsExporting(true);
    try {
      await onExport(selectedFormat, filters);
      onClose?.();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-100/40 dark:border-gray-700/40 p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition"
          aria-label="Close export modal"
        >
          <i className="fas fa-times text-xl"></i>
        </button>

        <header className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 text-white text-xl shadow-lg">
              <i className="fas fa-file-export"></i>
            </span>
            Export Orders
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Exporting <strong>{totalOrders}</strong> order{totalOrders === 1 ? '' : 's'} using current filters.
          </p>
        </header>

        <section className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Choose format</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {formats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  className={`p-4 rounded-2xl border transition-all text-left ${
                    selectedFormat === format.id
                      ? 'border-green-500 bg-green-50 dark:bg-green-500/10 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-white/5 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${
                      selectedFormat === format.id
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200'
                    }`}>
                      <i className={`fas ${format.icon}`}></i>
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{format.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">.{format.id}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/70 dark:bg-white/5 border border-gray-200/70 dark:border-gray-700/70 rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Applied filters</h3>
            {appliedFilters.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">No filters applied. All loaded orders will be exported.</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {appliedFilters.map(({ key, value }) => (
                  <li
                    key={key}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                  >
                    <span className="font-medium mr-1">{key}:</span>
                    <span>{typeof value === 'object' ? JSON.stringify(value) : value.toString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <footer className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white/70 dark:bg-white/10 border border-gray-200 dark:border-gray-700 hover:bg-white"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-60 flex items-center gap-2 justify-center"
          >
            <i className="fas fa-download"></i>
            {isExporting ? 'Preparing…' : `Export ${selectedFormat.toUpperCase()}`}
          </button>
        </footer>
      </div>
    </div>
  );
};

ExportModal.propTypes = {
  onClose: PropTypes.func,
  onExport: PropTypes.func,
  totalOrders: PropTypes.number,
  filters: PropTypes.object,
  formats: PropTypes.array,
};

export default ExportModal;
