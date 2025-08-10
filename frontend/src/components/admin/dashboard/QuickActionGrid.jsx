import React from 'react';
import { Link } from 'react-router-dom';

const QuickActionGrid = () => {
  const actions = [
    { 
      icon: 'fa-plus', 
      label: 'Add Product', 
      color: 'from-blue-500 to-blue-600', 
      link: '/admin/products/new',
      description: 'Create new product'
    },
    { 
      icon: 'fa-chart-bar', 
      label: 'View Reports', 
      color: 'from-green-500 to-green-600', 
      link: '/admin/reports',
      description: 'Analytics & insights'
    },
    { 
      icon: 'fa-users', 
      label: 'Manage Users', 
      color: 'from-purple-500 to-purple-600', 
      link: '/admin/users',
      description: 'User management'
    },
    { 
      icon: 'fa-cog', 
      label: 'Settings', 
      color: 'from-gray-500 to-gray-600', 
      link: '/admin/settings',
      description: 'System configuration'
    },
    { 
      icon: 'fa-upload', 
      label: 'Bulk Import', 
      color: 'from-orange-500 to-red-500', 
      link: '/admin/import',
      description: 'Import products'
    },
    { 
      icon: 'fa-download', 
      label: 'Export Data', 
      color: 'from-teal-500 to-cyan-500', 
      link: '/admin/export',
      description: 'Download reports'
    },
    { 
      icon: 'fa-bullhorn', 
      label: 'Campaigns', 
      color: 'from-pink-500 to-rose-500', 
      link: '/admin/campaigns',
      description: 'Marketing campaigns'
    },
    { 
      icon: 'fa-headset', 
      label: 'Support', 
      color: 'from-indigo-500 to-purple-500', 
      link: '/admin/support',
      description: 'Customer support'
    }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <i className="fas fa-bolt mr-3 text-yellow-500"></i>
        Quick Actions
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {actions.map((action, index) => (
          <Link
            key={index}
            to={action.link}
            className={`group bg-gradient-to-r ${action.color} hover:scale-105 transform transition-all duration-200 text-white rounded-2xl p-6 text-center shadow-lg relative overflow-hidden`}
          >
            {/* Hover shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            
            <div className="relative z-10">
              <i className={`fas ${action.icon} text-3xl mb-4 group-hover:animate-bounce`}></i>
              <p className="font-bold text-lg mb-1">{action.label}</p>
              <p className="text-xs opacity-80">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActionGrid;
