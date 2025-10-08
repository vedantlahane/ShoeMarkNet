import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';

const ExportModal = ({
  onClose,
  products = [],
  selectedProducts = [],
  onExport
}) => {
  const [format, setFormat] = useState('csv');
  const [includeFields, setIncludeFields] = useState({
    inventory: true,
    pricing: true,
    metadata: false,
    images: true
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const selectionSummary = useMemo(() => {
    const selectedCount = selectedProducts.length;
    const totalCount = products.length;
    if (selectedCount === 0) {
      return `All products (${totalCount}) will be exported.`;
    }
    return `${selectedCount} of ${totalCount} products selected for export.`;
  }, [products.length, selectedProducts.length]);

  const handleToggleField = (field) => {
    setIncludeFields((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleExport = async (event) => {
    event.preventDefault();
    setIsProcessing(true);
    try {
      await onExport?.(format, includeFields);
      setIsProcessing(false);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true"></div>
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-900/95 dark:to-gray-900/80 border border-white/30 dark:border-gray-700/30 rounded-3xl shadow-2xl overflow-hidden">
        <header className="px-8 py-6 border-b border-white/20 dark:border-gray-700/20 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <i className="fas fa-file-export mr-3 text-orange-500"></i>
              Export Products
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{selectionSummary}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-2xl border border-white/40 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            aria-label="Close export modal"
          >
            <i className="fas fa-times"></i>
          </button>
        </header>

        <form onSubmit={handleExport} className="px-8 py-6 space-y-6">
          <section>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-3">Format</h3>
            <div className="flex gap-4">
              {['csv', 'json', 'xlsx'].map((option) => (
                <label key={option} className={`flex-1 px-4 py-3 rounded-2xl border cursor-pointer transition-all ${
                  format === option
                    ? 'border-orange-500 bg-orange-500/10 text-orange-600'
                    : 'border-white/30 bg-white/10 text-gray-600 dark:text-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="exportFormat"
                    value={option}
                    checked={format === option}
                    onChange={() => setFormat(option)}
                    className="hidden"
                  />
                  <div className="flex items-center justify-between">
                    <span className="capitalize font-semibold">{option}</span>
                    {format === option && <i className="fas fa-check-circle"></i>}
                  </div>
                  <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
                    {option === 'csv' && 'Best for spreadsheets and bulk editing.'}
                    {option === 'json' && 'Great for re-importing and backups.'}
                    {option === 'xlsx' && 'Excel compatible with formatting.'}
                  </p>
                </label>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-3">Include Data</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'inventory', label: 'Inventory levels', icon: 'fa-boxes' },
                { key: 'pricing', label: 'Pricing details', icon: 'fa-tags' },
                { key: 'metadata', label: 'SEO and metadata', icon: 'fa-search' },
                { key: 'images', label: 'Image URLs', icon: 'fa-image' }
              ].map(({ key, label, icon }) => (
                <label
                  key={key}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-2xl border transition-all cursor-pointer ${
                    includeFields[key]
                      ? 'border-blue-500 bg-blue-500/10 text-blue-600'
                      : 'border-white/30 bg-white/10 text-gray-600 dark:text-gray-300'
                  }`}
                  onClick={() => handleToggleField(key)}
                >
                  <input
                    type="checkbox"
                    checked={includeFields[key]}
                    onChange={() => handleToggleField(key)}
                    className="hidden"
                  />
                  <i className={`fas ${icon}`}></i>
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </section>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl bg-white/10 border border-white/30 text-gray-700 dark:text-gray-200 hover:bg-white/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg hover:from-orange-600 hover:to-red-600 disabled:opacity-60"
            >
              {isProcessing ? 'Exporting…' : 'Export' }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

ExportModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  products: PropTypes.array,
  selectedProducts: PropTypes.array,
  onExport: PropTypes.func
};

export default ExportModal;
