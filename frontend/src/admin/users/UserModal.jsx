import React from 'react';
import PropTypes from 'prop-types';

const InfoRow = ({ label, value, icon }) => (
  <div className="flex items-start gap-3 py-2">
    <div className="w-8 h-8 rounded-2xl bg-white/10 flex items-center justify-center text-blue-500">
      <i className={`fas ${icon}`}></i>
    </div>
    <div className="flex-1">
      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-900 dark:text-white break-words">{value}</p>
    </div>
  </div>
);

const UserModal = ({
  user,
  onClose,
  onEdit,
  onViewActivity,
  getUserStatusColor,
  getUserStatusLabel,
  getLeadScoreColor,
  formatDate,
  getRelativeTime,
  userRoles
}) => {
  if (!user) return null;

  const statusColor = getUserStatusColor(user);
  const statusLabel = getUserStatusLabel(user);
  const roleLabel = userRoles.find(role => role.value === user.role)?.label || 'User';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-gradient-to-br from-white/90 to-white/80 dark:from-gray-900/90 dark:to-gray-900/80 border border-white/20 dark:border-gray-700/20 rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-2xl text-xs font-semibold text-white bg-gradient-to-r ${statusColor}`}>
                  <i className="fas fa-user"></i>
                  {statusLabel}
                </span>
                {user.name || 'Unnamed User'}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <i className="fas fa-id-badge"></i>
                <span>{user._id}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 text-gray-500"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InfoRow label="Role" value={roleLabel} icon="fa-user-tag" />
            <InfoRow label="Verified" value={user.isVerified ? 'Yes' : 'No'} icon="fa-shield-alt" />
            <InfoRow label="Active" value={user.isActive === false ? 'No' : 'Yes'} icon="fa-toggle-on" />
            <InfoRow
              label="Lead Score"
              value={user.leadScore ?? 'N/A'}
              icon="fa-bullseye"
            />
            <InfoRow
              label="Created"
              value={user.createdAt ? `${formatDate(user.createdAt)} (${getRelativeTime(user.createdAt)})` : 'Unknown'}
              icon="fa-calendar-plus"
            />
            <InfoRow
              label="Last Login"
              value={user.lastLogin ? `${formatDate(user.lastLogin)} (${getRelativeTime(user.lastLogin)})` : 'Never'}
              icon="fa-sign-in-alt"
            />
          </div>

          <div className="flex flex-wrap gap-3 justify-end">
            <button
              onClick={onViewActivity}
              className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-sm text-gray-700 dark:text-gray-200"
            >
              <i className="fas fa-history mr-2"></i>
              Activity
            </button>
            <button
              onClick={onEdit}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:shadow-lg"
            >
              <i className="fas fa-edit mr-2"></i>
              Edit User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

InfoRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.string.isRequired
};

UserModal.propTypes = {
  user: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onViewActivity: PropTypes.func.isRequired,
  getUserStatusColor: PropTypes.func.isRequired,
  getUserStatusLabel: PropTypes.func.isRequired,
  getLeadScoreColor: PropTypes.func,
  formatDate: PropTypes.func.isRequired,
  getRelativeTime: PropTypes.func.isRequired,
  userRoles: PropTypes.array
};

export default UserModal;
