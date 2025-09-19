import React, { useState, useEffect } from 'react';

const NotificationToast = ({
  notification,
  onClose = () => {},
  duration = 5000,
  position = 'top-right', // top-right, top-left, bottom-right, bottom-left
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case 'success':
        return { bg: 'from-green-500 to-emerald-500', icon: 'fa-check-circle' };
      case 'error':
        return { bg: 'from-red-500 to-rose-500', icon: 'fa-exclamation-circle' };
      case 'warning':
        return { bg: 'from-yellow-500 to-orange-500', icon: 'fa-exclamation-triangle' };
      case 'info':
      default:
        return { bg: 'from-blue-500 to-cyan-500', icon: 'fa-info-circle' };
    }
  };

  const getPositionClasses = (pos) => {
    switch (pos) {
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
      default:
        return 'top-4 right-4';
    }
  };

  if (!isVisible) return null;

  const typeStyle = getTypeStyle(notification.type);

  return (
    <div
      className={`fixed ${getPositionClasses(position)} z-50 max-w-sm ${
        isAnimating ? 'animate-slide-in' : 'animate-slide-out'
      } ${className}`}
    >
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
        <div className={`h-1 bg-gradient-to-r ${typeStyle.bg}`} />
        
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <div className={`w-8 h-8 bg-gradient-to-r ${typeStyle.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
              <i className={`fas ${typeStyle.icon} text-white text-sm`}></i>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                {notification.title}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {notification.message}
              </p>
            </div>
            
            <button
              onClick={handleClose}
              className="w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
            >
              <i className="fas fa-times text-xs"></i>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default NotificationToast;
