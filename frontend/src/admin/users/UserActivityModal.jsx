import React from 'react';
import PropTypes from 'prop-types';

const ActivityItem = ({ icon, title, description, timestamp }) => (
  <div className="flex items-start gap-3 py-3">
    <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-blue-500">
      <i className={`fas ${icon}`}></i>
    </div>
    <div className="flex-1">
      <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      <p className="text-xs text-gray-400 mt-1">{timestamp}</p>
    </div>
  </div>
);

const UserActivityModal = ({ user, onClose }) => {
  if (!user) return null;

  const fallbackActivity = [
    {
      icon: 'fa-sign-in-alt',
      title: 'Last login',
      description: user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'No login recorded',
      timestamp: user.lastLogin ? new Date(user.lastLogin).toDateString() : '—'
    },
    {
      icon: 'fa-user-edit',
      title: 'Account created',
      description: user.createdAt ? new Date(user.createdAt).toLocaleString() : 'Unknown',
      timestamp: user.createdAt ? new Date(user.createdAt).toDateString() : '—'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-white/90 to-white/80 dark:from-gray-900/90 dark:to-gray-900/80 border border-white/20 dark:border-gray-700/20 rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Activity</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 text-gray-500"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-2">
            {fallbackActivity.map((activity, index) => (
              <ActivityItem key={index} {...activity} />
            ))}
            {user.activity?.length > 0 && user.activity.map((entry, index) => (
              <ActivityItem
                key={`activity-${index}`}
                icon={entry.icon || 'fa-circle'}
                title={entry.title || 'Activity'}
                description={entry.description || ''}
                timestamp={entry.timestamp ? new Date(entry.timestamp).toLocaleString() : ''}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

ActivityItem.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  timestamp: PropTypes.string
};

UserActivityModal.propTypes = {
  user: PropTypes.object,
  onClose: PropTypes.func.isRequired
};

export default UserActivityModal;
