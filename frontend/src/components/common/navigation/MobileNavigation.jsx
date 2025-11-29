import React from 'react';
import { Link } from 'react-router-dom';

const MobileNavigation = ({ isOpen, onClose }) => {
  const menuItems = [
    { name: 'Home', href: '/', icon: 'fas fa-home' },
    { name: 'Men', href: '/category/men', icon: 'fas fa-male' },
    { name: 'Women', href: '/category/women', icon: 'fas fa-female' },
    { name: 'Kids', href: '/category/kids', icon: 'fas fa-child' },
    { name: 'Sale', href: '/sale', icon: 'fas fa-tag' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed left-0 top-0 bottom-0 w-80 bg-white/10 backdrop-blur-xl border-r border-white/20 shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Menu</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-gray-900 dark:text-white"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/20 transition-colors text-gray-900 dark:text-white"
              >
                <i className={`${item.icon} w-5`}></i>
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default MobileNavigation;
