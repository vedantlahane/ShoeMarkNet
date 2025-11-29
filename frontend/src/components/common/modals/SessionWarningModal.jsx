import React from 'react';

const SessionWarningModal = ({ isOpen, countdown, onExtend, onLogout, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fade-in">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <i className="fas fa-exclamation-triangle text-white text-2xl"></i>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Session Expiring Soon
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your session will expire in <span className="font-bold text-red-600">{countdown} minutes</span>. 
            Would you like to extend your session?
          </p>
          
          <div className="flex space-x-4">
            <button
              onClick={onExtend}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200"
            >
              <i className="fas fa-clock mr-2"></i>
              Extend Session
            </button>
            
            <button
              onClick={onLogout}
              className="flex-1 bg-white/10 backdrop-blur-lg border border-white/20 text-gray-900 dark:text-white font-bold py-3 px-6 rounded-2xl hover:bg-white/20 transition-all duration-200"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Logout
            </button>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            <i className="fas fa-info-circle mr-1"></i>
            For your security, sessions automatically expire after periods of inactivity
          </p>
        </div>
      </div>
    </div>
  );
};

export default SessionWarningModal;
