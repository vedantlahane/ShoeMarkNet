import React from 'react';
import { Link } from 'react-router-dom';

const CategoryBreadcrumb = ({ 
  breadcrumbPath = [], 
  className = '',
  showHome = true 
}) => {
  if (breadcrumbPath.length === 0) return null;

  return (
    <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl p-4 shadow-xl ${className}`}>
      <nav className="flex items-center space-x-2 text-sm">
        {showHome && (
          <>
            <Link
              to="/"
              className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
            >
              <i className="fas fa-home mr-1"></i>
              Home
            </Link>
            <i className="fas fa-chevron-right text-gray-400"></i>
          </>
        )}
        
        {breadcrumbPath.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <i className="fas fa-chevron-right text-gray-400"></i>}
            {item.isActive ? (
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {item.name}
              </span>
            ) : (
              <Link
                to={item.url || '#'}
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {item.name}
              </Link>
            )}
          </React.Fragment>
        ))}
      </nav>
    </div>
  );
};

export default CategoryBreadcrumb;
