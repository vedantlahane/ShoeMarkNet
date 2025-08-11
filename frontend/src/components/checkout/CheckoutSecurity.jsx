import React from 'react';

const CheckoutSecurity = ({ onClose, isConnected }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 max-w-2xl w-full shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <i className="fas fa-shield-alt mr-3 text-green-500"></i>
            Security Information
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <i className="fas fa-times text-2xl"></i>
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-lock text-white text-2xl"></i>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">SSL Encryption</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your data is protected with 256-bit SSL encryption
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-credit-card text-white text-2xl"></i>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Secure Payments</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We never store your payment information
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-user-shield text-white text-2xl"></i>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Privacy Protected</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your personal information is kept secure
              </p>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-2xl p-6">
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center">
              <i className="fas fa-check-circle mr-2"></i>
              Security Checklist
            </h4>
            <ul className="space-y-2 text-sm text-green-700 dark:text-green-300">
              <li className="flex items-center">
                <i className="fas fa-check mr-2 text-green-500"></i>
                SSL Certificate Active
              </li>
              <li className="flex items-center">
                <i className={`fas ${isConnected ? 'fa-check' : 'fa-times'} mr-2 ${isConnected ? 'text-green-500' : 'text-red-500'}`}></i>
                Secure Connection {isConnected ? 'Established' : 'Unavailable'}
              </li>
              <li className="flex items-center">
                <i className="fas fa-check mr-2 text-green-500"></i>
                PCI DSS Compliant
              </li>
              <li className="flex items-center">
                <i className="fas fa-check mr-2 text-green-500"></i>
                Data Encryption Enabled
              </li>
            </ul>
          </div>

          <div className="text-center">
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-8 rounded-2xl transition-all duration-200"
            >
              <i className="fas fa-thumbs-up mr-2"></i>
              Got It, Thanks!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSecurity;
