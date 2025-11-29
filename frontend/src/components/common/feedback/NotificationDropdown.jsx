import React, { useState } from 'react';
import { FaBell, FaTimes, FaCheck, FaExclamationTriangle, FaInfo, FaCheckCircle } from 'react-icons/fa';

const NotificationDropdown = ({ 
  isOpen, 
  onClose, 
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  className = "" 
}) => {
  const [filter, setFilter] = useState('all');

  const notificationTypes = {
    info: { icon: FaInfo, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    success: { icon: FaCheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
    warning: { icon: FaExclamationTriangle, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    error: { icon: FaExclamationTriangle, color: 'text-red-600', bgColor: 'bg-red-100' }
  };

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: 'Unread' },
    { value: 'info', label: 'Info' },
    { value: 'success', label: 'Success' },
    { value: 'warning', label: 'Warning' },
    { value: 'error', label: 'Error' }
  ];

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (!isOpen) return null;

  return (
    <div className={`absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaBell className="mr-2" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {unreadCount}
              </span>
            )}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Filter Options */}
        <div className="flex flex-wrap gap-2 mt-3">
          {filterOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                filter === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <div className="mt-3">
            <button
              onClick={onMarkAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Mark all as read
            </button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FaBell className="mx-auto text-4xl mb-3 text-gray-300" />
            <p>No notifications found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => {
              const typeConfig = notificationTypes[notification.type] || notificationTypes.info;
              const Icon = typeConfig.icon;

              return (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${typeConfig.bgColor}`}>
                      <Icon className={`w-4 h-4 ${typeConfig.color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className={`text-sm font-medium ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.read && (
                            <button
                              onClick={() => onMarkAsRead && onMarkAsRead(notification.id)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="Mark as read"
                            >
                              <FaCheck className="w-3 h-3" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(notification.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Delete notification"
                            >
                              <FaTimes className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {formatTime(notification.timestamp)}
                        </span>
                        
                        {notification.actionUrl && (
                          <a
                            href={notification.actionUrl}
                            className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            View Details
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <button className="w-full text-sm text-blue-600 hover:text-blue-800 transition-colors text-center">
          View All Notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
