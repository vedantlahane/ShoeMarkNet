import React, { useState } from 'react';
import PropTypes from 'prop-types';

const ImportModal = ({ onClose, onImport }) => {
  const [file, setFile] = useState(null);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0];
    setFile(selected || null);
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError('Please choose a CSV or Excel file to import.');
      return;
    }

    try {
      setIsImporting(true);
      setError(null);
      await onImport(file, { overwriteExisting, sendingInvite });
      onClose();
    } catch (importError) {
      setIsImporting(false);
      setError(importError?.message || 'Failed to import users');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
  <div className="relative w-full max-w-lg bg-gradient-to-br from-white/95 to-white/85 dark:from-gray-900/95 dark:to-gray-900/85 border border-white/20 dark:border-gray-700/20 rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
        <form className="p-6 sm:p-8 space-y-6" onSubmit={handleSubmit}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Import Users</h2>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 text-gray-500"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="space-y-4">
            <label className="block text-sm text-gray-600 dark:text-gray-300 font-semibold">Upload file</label>
            <div className="relative flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-white/30 rounded-3xl bg-white/10 text-gray-600 dark:text-gray-300">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <i className="fas fa-file-upload text-2xl text-blue-500"></i>
              <p className="text-sm">
                {file ? file.name : 'Drag & drop or click to choose a CSV/XLSX file'}
              </p>
            </div>

            <label className="flex items-start gap-3 bg-white/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20 rounded-2xl px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={overwriteExisting}
                onChange={(e) => setOverwriteExisting(e.target.checked)}
              />
              <span>
                Overwrite existing users
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  Matching email addresses will be updated with new data.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 bg-white/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20 rounded-2xl px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={sendingInvite}
                onChange={(e) => setSendingInvite(e.target.checked)}
              />
              <span>
                Send welcome email
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  Notify imported users with sign-in instructions.
                </span>
              </span>
            </label>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-200 rounded-2xl px-4 py-3 text-sm">
                {error}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-gray-700 dark:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isImporting}
              className="px-4 py-2 rounded-2xl text-white font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg transition-transform duration-200 hover:scale-105 disabled:opacity-50"
            >
              {isImporting ? 'Importing…' : 'Import Users'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

ImportModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired
};

export default ImportModal;
