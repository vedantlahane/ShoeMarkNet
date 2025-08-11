import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

const NotificationCenter = ({ 
  isOpen = false, 
  onClose = () => {},
  className = '' 
}) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Welcome to ShoeMarkNet!',
      message: 'Explore our amazing collection of premium footwear.',
      type: 'info',
      timestamp: new Date().toISOString(),
      read: false
    },
    {
      id: 2,
      title: 'New Sale Event',
      message: 'Up to 50% off on selected items. Limited time offer!',
      type: 'success',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      read: false
    }
  ]);

  const [filter, setFilter] = useState('all');

  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const deleteNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    toast.success('Notification deleted');
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    toast.success('All notifications marked as read');
  }, []);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success': return 'fas fa-check-circle text-green-500';
      case 'error': return 'fas fa-exclamation-circle text-red-500';
      case 'warning': return 'fas fa-exclamation-triangle text-yellow-500';
      default: return 'fas fa-info-circle text-blue-500';
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Notifications</h3>
              <p className="text-blue-100 text-sm">{unreadCount} unread</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-white/20">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white/20 text-gray-700 dark:text-gray-300'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === 'unread' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white/20 text-gray-700 dark:text-gray-300'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-b border-white/20">
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mark all as read
          </button>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <i className="fas fa-bell-slash text-gray-400 text-3xl mb-3"></i>
              <p className="text-gray-500">No notifications</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-white/10 hover:bg-white/5 transition-colors cursor-pointer ${
                  !notification.read ? 'bg-blue-50/10' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  <i className={`${getTypeIcon(notification.type)} mt-1`}></i>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium text-gray-900 dark:text-white ${
                      !notification.read ? 'font-bold' : ''
                    }`}>
                      {notification.title}
                      {!notification.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full inline-block ml-2"></span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    className="w-6 h-6 rounded-full hover:bg-red-500/20 flex items-center justify-center text-red-500 hover:text-red-600 transition-colors"
                  >
                    <i className="fas fa-times text-xs"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
