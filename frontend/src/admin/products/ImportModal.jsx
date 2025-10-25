import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';

const ACCEPTED_TYPES = '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, application/json';

const ImportModal = ({
  onClose,
  onImport
}) => {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [options, setOptions] = useState({
    overwriteExisting: false,
    sendNotifications: false
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      fileInputRef.current?.focus();
      return;
    }

    setIsProcessing(true);
    try {
      await onImport?.(file, options);
      setIsProcessing(false);
      onClose();
    } catch (error) {
      console.error('Import failed:', error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true"></div>
      <div className="relative w-full max-w-xl bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-900/95 dark:to-gray-900/80 border border-white/30 dark:border-gray-700/30 rounded-3xl shadow-2xl overflow-hidden">
        <header className="px-8 py-6 border-b border-white/20 dark:border-gray-700/20 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <i className="fas fa-file-import mr-3 text-emerald-500"></i>
              Import Products
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Upload a CSV, XLSX, or JSON file to add or update products.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-2xl border border-white/40 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            aria-label="Close import modal"
          >
            <i className="fas fa-times"></i>
          </button>
        </header>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
          <section className="space-y-3">
            <label htmlFor="product-import" className="flex flex-col items-center justify-center border-2 border-dashed border-white/40 rounded-3xl py-10 px-6 text-center cursor-pointer bg-white/10 hover:bg-white/20 transition-all">
              <input
                id="product-import"
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={ACCEPTED_TYPES}
                onChange={(event) => setFileName(event.target.files?.[0]?.name || '')}
              />
              <i className="fas fa-cloud-upload-alt text-4xl text-emerald-500 mb-4"></i>
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">Drop your file here or click to browse</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">Accepted formats: CSV, XLSX, JSON</span>
              {fileName && (
                <span className="mt-4 inline-flex items-center px-3 py-1 text-sm bg-emerald-500/10 text-emerald-600 rounded-full">
                  <i className="fas fa-file mr-2"></i>
                  {fileName}
                </span>
              )}
            </label>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center space-x-3 px-4 py-3 bg-white/10 border border-white/30 rounded-2xl cursor-pointer">
              <input
                type="checkbox"
                checked={options.overwriteExisting}
                onChange={(event) => setOptions((prev) => ({
                  ...prev,
                  overwriteExisting: event.target.checked
                }))}
                className="w-4 h-4 text-emerald-500 rounded border-white/40"
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">Overwrite existing products</span>
            </label>
            <label className="flex items-center space-x-3 px-4 py-3 bg-white/10 border border-white/30 rounded-2xl cursor-pointer">
              <input
                type="checkbox"
                checked={options.sendNotifications}
                onChange={(event) => setOptions((prev) => ({
                  ...prev,
                  sendNotifications: event.target.checked
                }))}
                className="w-4 h-4 text-emerald-500 rounded border-white/40"
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">Notify subscribers of new arrivals</span>
            </label>
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
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold shadow-lg hover:from-emerald-600 hover:to-green-600 disabled:opacity-60"
            >
              {isProcessing ? 'Importing…' : 'Import'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

ImportModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onImport: PropTypes.func
};

export default ImportModal;
