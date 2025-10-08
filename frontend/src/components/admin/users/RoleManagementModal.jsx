import React from 'react';
import PropTypes from 'prop-types';

const RoleManagementModal = ({ onClose, userRoles, hasPermission }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
    <div className="relative w-full max-w-xl bg-gradient-to-br from-white/95 to-white/85 dark:from-gray-900/95 dark:to-gray-900/85 border border-white/20 dark:border-gray-700/20 rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Role Permissions</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 text-gray-500"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300">
          Review available roles and their typical responsibilities. Only administrators with the appropriate permissions can assign elevated roles.
        </p>

        <div className="space-y-4">
          {userRoles.map(role => (
            <div
              key={role.value}
              className={`p-4 rounded-2xl bg-gradient-to-r ${role.color} text-white shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold flex items-center gap-2">
                    <i className={`fas ${role.icon}`}></i>
                    {role.label}
                  </p>
                  <p className="text-sm opacity-80 mt-1">
                    Assign to users who need {role.value === 'admin' ? 'full platform control' : role.value === 'moderator' ? 'content moderation tools' : role.value === 'editor' ? 'content editing access' : 'shopping capabilities'}.
                  </p>
                </div>
                {role.value === 'admin' && (
                  <span className="text-xs bg-white/20 px-3 py-1 rounded-full uppercase tracking-wide">
                    Elevated Access
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {!hasPermission('users.updateRole') && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-800 dark:text-yellow-200 rounded-2xl px-4 py-3 text-sm">
            You currently do not have permission to change user roles. Please contact a system administrator if you believe this is an error.
          </div>
        )}
      </div>
    </div>
  </div>
);

RoleManagementModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  userRoles: PropTypes.array.isRequired,
  hasPermission: PropTypes.func.isRequired
};

export default RoleManagementModal;
