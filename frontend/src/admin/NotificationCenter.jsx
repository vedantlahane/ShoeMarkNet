import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';

// Utils
import { trackEvent } from '../utils/analytics';

// Hooks
import useWebSocket from '../hooks/useWebSocket';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import useLocalStorage from '../hooks/useLocalStorage';

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
        return { icon: 'fa-check-circle', accentColor: '#16a34a', accentText: 'text-emerald-600' };
      case 'error':
        return { icon: 'fa-exclamation-circle', accentColor: '#dc2626', accentText: 'text-rose-600' };
      case 'warning':
        return { icon: 'fa-exclamation-triangle', accentColor: '#d97706', accentText: 'text-amber-600' };
      case 'info':
      default:
        return { icon: 'fa-info-circle', accentColor: '#2563eb', accentText: 'text-blue-600' };
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const baseClass = 'admin-chip';
    switch (priority) {
      case 'critical':
        return <span className={`${baseClass} border-red-600 text-red-600`}>Critical</span>;
      case 'high':
        return <span className={`${baseClass} border-amber-500 text-amber-600`}>High</span>;
      case 'medium':
        return <span className={`${baseClass} border-blue-500 text-blue-600`}>Medium</span>;
      case 'low':
        return <span className={`${baseClass} border-slate-400 text-slate-500`}>Low</span>;
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

  const sectionBorderStyle = { borderColor: 'var(--admin-border-color)' };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-black/35"
        onClick={onClose}
      />

      <div
        ref={notificationRef}
        className={`w-full max-w-lg h-full admin-surface p-0 flex flex-col overflow-hidden ${
          position === 'left' ? 'order-first' : ''
        } ${className}`}
      >
        <div className="px-6 py-5 border-b" style={sectionBorderStyle}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="admin-meta-chip">Notification Center</span>
              <h2 className="admin-section-heading mt-3">Notifications</h2>
              <p className="admin-section-subheading">
                {unreadCount} unread • {priorityCount} priority
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex h-3 w-3 border ${isConnected ? 'border-emerald-500' : 'border-red-500'}`}
                style={{ backgroundColor: isConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(248, 113, 113, 0.15)' }}
                title={isConnected ? 'Connected' : 'Disconnected'}
              />
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="admin-button h-9"
                title={soundEnabled ? 'Disable sounds' : 'Enable sounds'}
              >
                <i className={`fas ${soundEnabled ? 'fa-volume-up' : 'fa-volume-mute'} text-xs`}></i>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="admin-button h-9"
                title="Close (ESC)"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-b space-y-4" style={sectionBorderStyle}>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'all', label: 'All', count: notifications.length },
              { id: 'unread', label: 'Unread', count: unreadCount },
              { id: 'priority', label: 'Priority', count: priorityCount }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`admin-button w-full justify-between ${filter === tab.id ? 'admin-button--primary' : ''}`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 ? <span className="admin-pill">{tab.count}</span> : null}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                className={`admin-chip ${
                  selectedCategory === category.id ? 'border-blue-600 text-blue-600' : ''
                }`}
              >
                <i className={`${category.icon} text-xs`}></i>
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-b" style={sectionBorderStyle}>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              className="admin-button flex-1 justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <i className="fas fa-check-double text-xs"></i>
              Mark All Read
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              disabled={notifications.length === 0}
              className="admin-button flex-1 justify-center text-red-600 border-red-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <i className="fas fa-trash text-xs"></i>
              Clear All
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            emptyState ?? (
              <div className="px-6 py-16 text-center">
                <div className="mb-4 inline-flex border px-4 py-3" style={sectionBorderStyle}>
                  <i className="fas fa-bell-slash text-sm text-slate-500"></i>
                </div>
                <h3 className="admin-section-heading text-base">No Notifications</h3>
                <p className="admin-section-subheading">
                  {filter === 'unread'
                    ? "You're all caught up."
                    : 'All notifications will appear here.'}
                </p>
              </div>
            )
          ) : (
            <div>
              {filteredNotifications.map((notification, index) => {
                const typeStyle = getTypeStyle(notification.type);
                const rowStyle = {
                  borderColor: 'var(--admin-border-color)',
                  borderLeft: `3px solid ${typeStyle.accentColor}`,
                  animationDelay: `${index * 0.05}s`
                };

                if (!notification.read) {
                  rowStyle.background = 'color-mix(in srgb, var(--admin-accent) 6%, var(--admin-surface-bg) 94%)';
                }

                return (
                  <div
                    key={notification.id}
                    className={`px-6 py-4 border-b cursor-pointer transition-colors ${
                      animateElements ? 'animate-fade-in-up' : 'opacity-0'
                    }`}
                    style={rowStyle}
                    onClick={() => handleNotificationClickInternal(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-8 w-8 items-center justify-center border"
                        style={{ borderColor: typeStyle.accentColor, color: typeStyle.accentColor }}
                      >
                        <i className={`fas ${typeStyle.icon} text-sm`}></i>
                      </div>

                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <h4 className={`font-semibold text-sm ${typeStyle.accentText}`}>
                              {notification.title}
                            </h4>
                            <p className="text-sm text-[var(--admin-text-muted)] line-clamp-2">
                              {notification.message}
                            </p>
                          </div>
                          <div className="flex items-start gap-2">
                            {getPriorityBadge(notification.priority)}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotification(notification.id);
                              }}
                              className="admin-button h-8"
                              title="Delete notification"
                            >
                              <i className="fas fa-times text-xs"></i>
                            </button>
                          </div>
                        </div>

                        {notification.actions && notification.actions.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {notification.actions.map((action) => (
                              <button
                                key={action.id}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNotificationAction(notification.id, action.id);
                                }}
                                className={`admin-button h-8 ${
                                  action.type === 'primary' ? 'admin-button--primary' : ''
                                }`}
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-[var(--admin-text-muted)]">
                          <span className="inline-flex items-center gap-2">
                            <i className="fas fa-clock text-[0.6rem]"></i>
                            {getTimeAgo(notification.timestamp)}
                          </span>
                          <span className="capitalize">{notification.category}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t" style={sectionBorderStyle}>
          <div className="flex items-center justify-between text-xs text-[var(--admin-text-muted)]">
            <span className="inline-flex items-center gap-2">
              <i className="fas fa-info-circle text-[0.6rem]"></i>
              Real-time notifications enabled
            </span>
            <button
              type="button"
              onClick={() => window.open('/admin/notifications/settings', '_blank')}
              className="text-[var(--admin-accent)] font-medium"
            >
              Settings
            </button>
          </div>
        </div>

        <audio ref={audioRef} preload="none" />
      </div>
    </div>
  );
};

export default NotificationCenter;
