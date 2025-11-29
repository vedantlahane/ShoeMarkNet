import React from 'react';
import { Link } from 'react-router-dom';

const UserProfileDropdown = ({ isOpen, user, isAdmin, onClose, onLogout }) => {
  if (!isOpen) return null;

  const menuItems = [
    { to: '/profile', icon: 'fas fa-user', label: 'My Profile', color: 'text-blue-500' },
    { to: '/orders', icon: 'fas fa-shopping-bag', label: 'My Orders', color: 'text-green-500' },
    { to: '/wishlist', icon: 'fas fa-heart', label: 'Wishlist', color: 'text-pink-500' },
    { to: '/addresses', icon: 'fas fa-map-marker-alt', label: 'Addresses', color: 'text-purple-500' },
    { to: '/payment-methods', icon: 'fas fa-credit-card', label: 'Payment Methods', color: 'text-orange-500' },
    { to: '/settings', icon: 'fas fa-cog', label: 'Settings', color: 'text-gray-500' }
  ];

  return (
    <div className="absolute right-0 mt-2 w-72 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in">
      
      {/* User Info Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              user?.name?.charAt(0)?.toUpperCase() || 'U'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-900 dark:text-white truncate">
              {user?.name || 'User'}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {user?.email}
            </p>
            <div className="flex items-center mt-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                user?.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              }`}>
                <i className={`fas ${user?.role === 'admin' ? 'fa-crown' : 'fa-user'} mr-1`}></i>
                {user?.role || 'User'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.to}
            className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 group"
            onClick={onClose}
          >
            <i className={`${item.icon} ${item.color} w-5 mr-3 group-hover:scale-110 transition-transform duration-200`}></i>
            <span className="flex-1">{item.label}</span>
            <i className="fas fa-chevron-right text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-200"></i>
          </Link>
        ))}

        {isAdmin && (
          <>
            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
            <Link
              to="/admin"
              className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 group"
              onClick={onClose}
            >
              <i className="fas fa-crown text-purple-500 w-5 mr-3 group-hover:scale-110 transition-transform duration-200"></i>
              <span className="flex-1">Admin Dashboard</span>
              <i className="fas fa-external-link-alt text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-200"></i>
            </Link>
          </>
        )}

        <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
        
        <button
          onClick={onLogout}
          className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group"
        >
          <i className="fas fa-sign-out-alt text-red-500 w-5 mr-3 group-hover:scale-110 transition-transform duration-200"></i>
          <span className="flex-1">Sign Out</span>
          <i className="fas fa-arrow-right text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-200"></i>
        </button>
      </div>
    </div>
  );
};

export default UserProfileDropdown;
