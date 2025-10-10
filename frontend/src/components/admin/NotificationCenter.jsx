import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';

// Utils
import { trackEvent } from '../../utils/analytics';

// Hooks
import useWebSocket from '../../hooks/useWebSocket';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';
import useLocalStorage from '../../hooks/useLocalStorage';

const formatCategoryLabel = (value = '') => {
  return value
    .toString()
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') || 'General';
};

const normalizeNotification = (notification) => {
  if (!notification) return null;

  const rawTimestamp = notification.timestamp || notification.time || new Date();
  const dateInstance = rawTimestamp instanceof Date ? rawTimestamp : new Date(rawTimestamp);
  const timestamp = dateInstance.toISOString();

  const read = notification.read ?? !notification.unread;
  const unread = notification.unread ?? !read;

  return {
    priority: 'medium',
    category: 'general',
    ...notification,
    timestamp,
    time: dateInstance,
    read,
    unread
  };
};

const createDefaultNotifications = () => ([
  normalizeNotification({
    id: '1',
    type: 'success',
    title: 'System Update Complete',
    message: 'ShoeMarkNet admin dashboard has been successfully updated to version 2.1.4',
    priority: 'high',
    category: 'system',
    actions: [
      { id: 'view-changelog', label: 'View Changelog', type: 'primary' }
    ]
  }),
  normalizeNotification({
    id: '2',
    type: 'warning',
    title: 'High Server Load',
    message: 'Server CPU usage is at 87%. Consider scaling resources if this continues.',
    priority: 'high',
    category: 'performance',
    actions: [
      { id: 'view-metrics', label: 'View Metrics', type: 'secondary' },
      { id: 'scale-resources', label: 'Scale Resources', type: 'primary' }
    ],
    timestamp: new Date(Date.now() - 5 * 60 * 1000)
  }),
  normalizeNotification({
    id: '3',
    type: 'info',
    title: 'New Order Received',
    message: 'Order #ORD-2024-1234 has been placed by customer John Doe',
    priority: 'medium',
    category: 'orders',
    read: true,
    actions: [
      { id: 'view-order', label: 'View Order', type: 'primary' }
    ],
    timestamp: new Date(Date.now() - 15 * 60 * 1000)
  }),
  normalizeNotification({
    id: '4',
    type: 'error',
    title: 'Payment Processing Failed',
    message: 'Payment gateway returned error 500. Customer payment for order #ORD-2024-1235 failed.',
    priority: 'critical',
    category: 'payments',
    actions: [
      { id: 'retry-payment', label: 'Retry Payment', type: 'primary' },
      { id: 'contact-customer', label: 'Contact Customer', type: 'secondary' }
    ],
    timestamp: new Date(Date.now() - 30 * 60 * 1000)
  }),
  normalizeNotification({
    id: '5',
    type: 'info',
    title: 'Backup Completed',
    message: 'Scheduled database backup completed successfully at 3:00 AM',
    priority: 'low',
    category: 'maintenance',
    read: true,
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
  })
]);

const NotificationCenter = ({
  isOpen = false,
  onClose = () => {},
  position = 'right', // right, left, center
  maxNotifications = 50,
  showToasts = true,
  className = '',
  notifications: controlledNotifications,
  onNotificationsChange,
  onNotificationClick,
  onNotificationAction,
  onNotificationDelete,
  onMarkAllRead,
  emptyState = null
}) => {
  const [notifications, setNotifications] = useState(() => {
    const initial = controlledNotifications && controlledNotifications.length
      ? controlledNotifications.map(normalizeNotification)
      : createDefaultNotifications();
    return initial;
  });

  useEffect(() => {
    if (!controlledNotifications) return;
    setNotifications(controlledNotifications.map(normalizeNotification));
  }, [controlledNotifications]);

  const updateNotifications = useCallback((updater) => {
    setNotifications(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      const normalized = Array.isArray(next)
        ? next.slice(0, maxNotifications).map(normalizeNotification)
        : [];
      onNotificationsChange?.(normalized);
      return normalized;
    });
  }, [maxNotifications, onNotificationsChange]);

  const [filter, setFilter] = useState('all'); // all, unread, priority
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [animateElements, setAnimateElements] = useState(false);
  const [soundEnabled, setSoundEnabled] = useLocalStorage('notificationSounds', true);

  // Refs
  const notificationRef = useRef(null);
  const audioRef = useRef(null);

  // Initialize animations
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setAnimateElements(true), 100);
    }
  }, [isOpen]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'escape': () => onClose(),
    'ctrl+shift+n': () => onClose(),
    'ctrl+a': () => handleMarkAllAsRead(),
    'ctrl+d': () => handleClearAll()
  });

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Add new notification
  const addNotification = useCallback((notification) => {
    const baseNotification = {
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
      unread: true,
      priority: 'medium',
      category: 'general',
      ...notification
    };

    const newNotification = normalizeNotification(baseNotification);

    updateNotifications(prev => [newNotification, ...prev]);

    if (soundEnabled && audioRef.current) {
      const soundFile = newNotification.type === 'error' ? 'error.mp3' : 'notification.mp3';
      audioRef.current.src = `/sounds/${soundFile}`;
      audioRef.current.play().catch(() => {
        // Sound play failed, ignore
      });
    }

    if (showToasts) {
      const toastType = newNotification.type === 'error' ? 'error'
        : newNotification.type === 'warning' ? 'warning'
        : newNotification.type === 'success' ? 'success'
        : 'info';

      toast[toastType](`${newNotification.title}: ${newNotification.message}`, {
        position: 'top-right',
        autoClose: 5000
      });
    }

    trackEvent('admin_notification_received', {
      type: newNotification.type,
      category: newNotification.category,
      priority: newNotification.priority
    });
  }, [showToasts, soundEnabled, updateNotifications]);

  const handleWebSocketMessage = useCallback((message) => {
    try {
      const data = JSON.parse(message.data);
      if (data.type === 'notification') {
        addNotification(data.notification);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }, [addNotification]);

  const websocketUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_WS_URL) || 'ws://localhost:8080';

  const { isConnected } = useWebSocket({
    url: websocketUrl,
    onMessage: handleWebSocketMessage
  });

  // Mark notification as read
  const handleMarkAsRead = useCallback((notificationId) => {
    updateNotifications(prev => prev.map(notif =>
      notif.id === notificationId
        ? { ...notif, read: true, unread: false }
        : notif
    ));

    trackEvent('admin_notification_marked_read', {
      notification_id: notificationId
    });
  }, [updateNotifications]);

  // Mark all as read
  const handleMarkAllAsRead = useCallback(() => {
    const unreadBefore = notifications.filter(n => !n.read).length;
    if (unreadBefore === 0) return;

    updateNotifications(prev => prev.map(notif => ({
      ...notif,
      read: true,
      unread: false
    })));

    toast.success('All notifications marked as read');
    onMarkAllRead?.();
    
    trackEvent('admin_notifications_mark_all_read', {
      count: unreadBefore
    });
  }, [notifications, onMarkAllRead, updateNotifications]);

  // Delete notification
  const handleDeleteNotification = useCallback((notificationId) => {
    updateNotifications(prev => prev.filter(notif => notif.id !== notificationId));

    toast.success('Notification deleted');
    onNotificationDelete?.(notificationId);
    
    trackEvent('admin_notification_deleted', {
      notification_id: notificationId
    });
  }, [onNotificationDelete, updateNotifications]);

  // Clear all notifications
  const handleClearAll = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      updateNotifications([]);
      toast.success('All notifications cleared');
      
      trackEvent('admin_notifications_cleared_all', {
        count: notifications.length
      });
    }
  }, [notifications.length, updateNotifications]);

  // Handle notification action
  const handleNotificationAction = useCallback((notificationId, actionId) => {
    const notification = notifications.find(n => n.id === notificationId);
    
    trackEvent('admin_notification_action_clicked', {
      notification_id: notificationId,
      action_id: actionId,
      notification_type: notification?.type
    });

    onNotificationAction?.(notification, actionId);

    // Handle specific actions
    switch (actionId) {
      case 'view-changelog':
        window.open('/admin/changelog', '_blank');
        break;
      case 'view-metrics':
        window.open('/admin/metrics', '_blank');
        break;
      case 'scale-resources':
        toast.info('Scaling resources... This may take a few minutes.');
        break;
      case 'view-order':
        window.open('/admin/orders', '_blank');
        break;
      case 'retry-payment':
        toast.info('Retrying payment...');
        break;
      case 'contact-customer':
        toast.info('Opening customer contact form...');
        break;
      default:
        console.log('Unhandled action:', actionId);
    }

    // Mark as read when action is taken
    handleMarkAsRead(notificationId);
  }, [handleMarkAsRead, notifications, onNotificationAction]);

  const handleNotificationClickInternal = useCallback((notification) => {
    if (!notification) return;
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    onNotificationClick?.(notification);
  }, [handleMarkAsRead, onNotificationClick]);

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.read) return false;
    if (filter === 'priority' && notification.priority !== 'high' && notification.priority !== 'critical') return false;
    if (selectedCategory !== 'all' && notification.category !== selectedCategory) return false;
    return true;
  });

  // Get notification counts
  const unreadCount = notifications.filter(n => !n.read).length;
  const priorityCount = notifications.filter(n => n.priority === 'high' || n.priority === 'critical').length;

  // Categories
  const baseCategories = [
    { id: 'all', label: 'All', icon: 'fas fa-inbox' },
    { id: 'general', label: 'General', icon: 'fas fa-bell' },
    { id: 'system', label: 'System', icon: 'fas fa-server' },
    { id: 'orders', label: 'Orders', icon: 'fas fa-shopping-cart' },
    { id: 'payments', label: 'Payments', icon: 'fas fa-credit-card' },
    { id: 'performance', label: 'Performance', icon: 'fas fa-chart-line' },
    { id: 'maintenance', label: 'Maintenance', icon: 'fas fa-tools' }
  ];

  const categoryMap = new Map(baseCategories.map(category => [category.id, category]));

  notifications.forEach(notification => {
    if (!notification?.category) return;
    const id = notification.category;
    if (!categoryMap.has(id) && id !== 'all') {
      categoryMap.set(id, {
        id,
        label: formatCategoryLabel(id),
        icon: 'fas fa-tag'
      });
    }
  });

  const categories = Array.from(categoryMap.values());

  // Get type styling
  const getTypeStyle = (type) => {
    switch (type) {
      case 'success':
        return { bg: 'from-green-500 to-emerald-500', icon: 'fa-check-circle', text: 'text-green-600' };
      case 'error':
        return { bg: 'from-red-500 to-rose-500', icon: 'fa-exclamation-circle', text: 'text-red-600' };
      case 'warning':
        return { bg: 'from-yellow-500 to-orange-500', icon: 'fa-exclamation-triangle', text: 'text-yellow-600' };
      case 'info':
      default:
        return { bg: 'from-blue-500 to-cyan-500', icon: 'fa-info-circle', text: 'text-blue-600' };
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'critical':
        return <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">CRITICAL</span>;
      case 'high':
        return <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">HIGH</span>;
      case 'medium':
        return <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">MEDIUM</span>;
      case 'low':
        return <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs">LOW</span>;
      default:
        return null;
    }
  };

  // Format time ago
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="flex-1 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Notification Panel */}
      <div
        ref={notificationRef}
        className={`w-full max-w-md bg-white/10 backdrop-blur-xl border-l border-white/20 dark:border-gray-700/20 shadow-2xl overflow-hidden ${
          position === 'left' ? 'order-first border-r border-l-0' : ''
        } ${className}`}
      >
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
                <i className="fas fa-bell text-white text-lg"></i>
              </div>
              <div>
                <h2 className="text-xl font-bold text-theme">Notifications</h2>
                <p className="text-muted-theme text-sm">
                  {unreadCount} unread • {priorityCount} priority
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Connection Status */}
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} 
                   title={isConnected ? 'Connected' : 'Disconnected'} />
              
              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="w-8 h-8 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                title={soundEnabled ? 'Disable sounds' : 'Enable sounds'}
              >
                <i className={`fas ${soundEnabled ? 'fa-volume-up' : 'fa-volume-mute'} text-xs`}></i>
              </button>
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                title="Close (ESC)"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-white/20 dark:border-gray-700/20 p-4 space-y-4">
          
          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-white/10 backdrop-blur-lg rounded-2xl p-1">
            {[
              { id: 'all', label: 'All', count: notifications.length },
              { id: 'unread', label: 'Unread', count: unreadCount },
              { id: 'priority', label: 'Priority', count: priorityCount }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex-1 flex items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
                  filter === tab.id
                    ? 'bg-white/20 text-blue-600 dark:text-blue-400 shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <span className="text-sm font-medium">{tab.label}</span>
                {tab.count > 0 && (
                  <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center px-3 py-1 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white/20 text-gray-700 dark:text-gray-300 hover:bg-white/30'
                }`}
              >
                <i className={`${category.icon} mr-2 text-xs`}></i>
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions Bar */}
        <div className="border-b border-white/20 dark:border-gray-700/20 p-4">
          <div className="flex space-x-2">
            <button
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              className="flex-1 bg-white/20 backdrop-blur-lg border border-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white font-medium py-2 px-3 rounded-xl hover:bg-white/30 transition-colors text-sm"
            >
              <i className="fas fa-check-double mr-2"></i>
              Mark All Read
            </button>
            
            <button
              onClick={handleClearAll}
              disabled={notifications.length === 0}
              className="flex-1 bg-red-500/20 border border-red-300 disabled:opacity-50 disabled:cursor-not-allowed text-red-700 dark:text-red-400 font-medium py-2 px-3 rounded-xl hover:bg-red-500/30 transition-colors text-sm"
            >
              <i className="fas fa-trash mr-2"></i>
              Clear All
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {filteredNotifications.length === 0 ? (
            emptyState ?? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-bell-slash text-gray-400 text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Notifications
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {filter === 'unread' 
                    ? "You're all caught up! No unread notifications."
                    : "All notifications will appear here."
                  }
                </p>
              </div>
            )
          ) : (
            // Notifications
            <div className="divide-y divide-white/10 dark:divide-gray-700/10">
              {filteredNotifications.map((notification, index) => {
                const typeStyle = getTypeStyle(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-white/5 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-blue-50/10' : ''
                    } ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onClick={() => handleNotificationClickInternal(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      
                      {/* Type Icon */}
                      <div className={`w-8 h-8 bg-gradient-to-r ${typeStyle.bg} rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
                        <i className={`fas ${typeStyle.icon} text-white text-sm`}></i>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        
                        {/* Header */}
                        <div className="flex items-start justify-between mb-2">
                          <h4 className={`font-semibold text-gray-900 dark:text-white text-sm ${!notification.read ? 'font-bold' : ''}`}>
                            {notification.title}
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full inline-block ml-2"></span>
                            )}
                          </h4>
                          
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            {getPriorityBadge(notification.priority)}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotification(notification.id);
                              }}
                              className="w-6 h-6 rounded-full hover:bg-red-500/20 flex items-center justify-center text-red-500 hover:text-red-600 transition-colors"
                              title="Delete notification"
                            >
                              <i className="fas fa-times text-xs"></i>
                            </button>
                          </div>
                        </div>

                        {/* Message */}
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                          {notification.message}
                        </p>

                        {/* Actions */}
                        {notification.actions && notification.actions.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {notification.actions.map((action) => (
                              <button
                                key={action.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNotificationAction(notification.id, action.id);
                                }}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                  action.type === 'primary'
                                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                                    : 'bg-white/20 text-gray-700 dark:text-gray-300 hover:bg-white/30'
                                }`}
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Timestamp & Category */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center">
                            <i className="fas fa-clock mr-1"></i>
                            {getTimeAgo(notification.timestamp)}
                          </span>
                          <span className="capitalize">
                            {notification.category}
                          </span>
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
        <div className="border-t border-white/20 dark:border-gray-700/20 p-4 bg-white/5">
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600 dark:text-gray-400">
              <i className="fas fa-info-circle mr-2"></i>
              Real-time notifications enabled
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => window.open('/admin/notifications/settings', '_blank')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium"
              >
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Audio Element */}
        <audio ref={audioRef} preload="none" />

        {/* Custom Styles */}
      </div>
    </div>
  );
};

export default NotificationCenter;
