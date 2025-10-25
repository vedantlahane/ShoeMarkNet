import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';

const defaultForm = {
  name: '',
  email: '',
  role: 'user',
  isActive: true,
  isVerified: false,
  leadScore: 0,
  password: '',
  confirmPassword: ''
};

const UserEditModal = ({
  user,
  isEditing,
  onClose,
  onSave,
  userRoles,
  hasPermission
}) => {
  const mode = useMemo(() => (user ? 'edit' : 'create'), [user]);
  const [formState, setFormState] = useState(() => ({
    ...defaultForm,
    ...(user || {})
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formState.name || !formState.email) {
      setError('Name and email are required.');
      return;
    }

    if (mode === 'create' && (!formState.password || formState.password !== formState.confirmPassword)) {
      setError('Please provide a matching password and confirmation for new users.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await onSave({
        name: formState.name,
        email: formState.email,
        role: formState.role,
        isActive: formState.isActive,
        isVerified: formState.isVerified,
        leadScore: formState.leadScore,
        ...(mode === 'create' ? { password: formState.password } : {})
      }, { mode });

      onClose();
    } catch (saveError) {
      setError(saveError?.message || 'Failed to save user changes');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-gradient-to-br from-white/95 to-white/85 dark:from-gray-900/95 dark:to-gray-900/85 border border-white/20 dark:border-gray-700/20 rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <i className="fas fa-user-edit text-blue-500"></i>
              {mode === 'edit' ? 'Edit User' : 'Create User'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 text-gray-500"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-200 rounded-2xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300">
              <span className="font-semibold flex items-center gap-2">
                <i className="fas fa-user"></i>
                Full Name
              </span>
              <input
                type="text"
                value={formState.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                className="bg-white/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20 rounded-2xl px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300">
              <span className="font-semibold flex items-center gap-2">
                <i className="fas fa-envelope"></i>
                Email Address
              </span>
              <input
                type="email"
                value={formState.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                className="bg-white/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20 rounded-2xl px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300">
              <span className="font-semibold flex items-center gap-2">
                <i className="fas fa-user-tag"></i>
                Role
              </span>
              <select
                value={formState.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className="bg-white/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20 rounded-2xl px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!hasPermission('users.updateRole') && mode === 'edit'}
              >
                {userRoles.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300">
              <span className="font-semibold flex items-center gap-2">
                <i className="fas fa-bullseye"></i>
                Lead Score
              </span>
              <input
                type="number"
                min={0}
                max={100}
                value={formState.leadScore || 0}
                onChange={(e) => handleChange('leadScore', Number(e.target.value))}
                className="bg-white/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20 rounded-2xl px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            {mode === 'create' && (
              <>
                <label className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-semibold flex items-center gap-2">
                    <i className="fas fa-key"></i>
                    Password
                  </span>
                  <input
                    type="password"
                    value={formState.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    required={mode === 'create'}
                    className="bg-white/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20 rounded-2xl px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-semibold flex items-center gap-2">
                    <i className="fas fa-key"></i>
                    Confirm Password
                  </span>
                  <input
                    type="password"
                    value={formState.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    required={mode === 'create'}
                    className="bg-white/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20 rounded-2xl px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
              </>
            )}

            <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300">
              <span className="font-semibold flex items-center gap-2">
                <i className="fas fa-toggle-on"></i>
                Status
              </span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formState.isActive !== false}
                    onChange={(e) => handleChange('isActive', e.target.checked)}
                  />
                  Active
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!formState.isVerified}
                    onChange={(e) => handleChange('isVerified', e.target.checked)}
                  />
                  Verified
                </label>
              </div>
            </div>
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
              disabled={isSubmitting || (mode === 'create' && !hasPermission('users.create'))}
              className={`px-4 py-2 rounded-2xl text-white font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg transition-transform duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

UserEditModal.propTypes = {
  user: PropTypes.object,
  isEditing: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  userRoles: PropTypes.array.isRequired,
  hasPermission: PropTypes.func.isRequired
};

export default UserEditModal;
