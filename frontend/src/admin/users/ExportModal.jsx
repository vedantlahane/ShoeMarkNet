import React, { useState } from 'react';
import PropTypes from 'prop-types';

const ExportModal = ({ onClose, users = [], selectedUsers = [], onExport }) => {
  const [format, setFormat] = useState('csv');
  const [includeSelectionOnly, setIncludeSelectionOnly] = useState(selectedUsers.length > 0);
  const [includeSensitive, setIncludeSensitive] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await onExport(format, {
        includeSelectionOnly,
        includeSensitive
      });
      onClose();
    } catch (error) {
      setIsExporting(false);
      // onExport is expected to toast errors if needed
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-gradient-to-br from-white/95 to-white/85 dark:from-gray-900/95 dark:to-gray-900/85 border border-white/20 dark:border-gray-700/20 rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Export Users</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 text-gray-500"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Format</p>
              <div className="flex gap-3">
                {['csv', 'json'].map(option => (
                  <label key={option} className={`flex-1 cursor-pointer bg-white/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20 rounded-2xl px-4 py-3 flex items-center gap-3 ${
                    format === option ? 'ring-2 ring-blue-500 text-blue-600' : 'text-gray-700 dark:text-gray-200'
                  }`}>
                    <input
                      type="radio"
                      value={option}
                      checked={format === option}
                      onChange={() => setFormat(option)}
                    />
                    <span className="uppercase tracking-wide text-xs font-semibold">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <label className="flex items-start gap-3 bg-white/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20 rounded-2xl px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={includeSelectionOnly}
                onChange={(e) => setIncludeSelectionOnly(e.target.checked)}
              />
              <span>
                Export selected users only
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  {selectedUsers.length} of {users.length} users currently selected
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 bg-white/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20 rounded-2xl px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={includeSensitive}
                onChange={(e) => setIncludeSensitive(e.target.checked)}
              />
              <span>
                Include sensitive fields
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  Adds addresses and contact details to the export file.
                </span>
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-gray-700 dark:text-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-4 py-2 rounded-2xl text-white font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg transition-transform duration-200 hover:scale-105 disabled:opacity-50"
            >
              {isExporting ? 'Exporting…' : 'Export'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ExportModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  users: PropTypes.array,
  selectedUsers: PropTypes.array,
  onExport: PropTypes.func.isRequired
};

export default ExportModal;
