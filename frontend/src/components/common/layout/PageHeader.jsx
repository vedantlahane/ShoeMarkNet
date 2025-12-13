import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * PageHeader component with breadcrumb navigation
 * Can be easily added to any page to provide consistent header styling
 */
const PageHeader = ({ 
  title, 
  description, 
  breadcrumbItems = [], 
  actions,
  className = ''
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
        <Link 
          to="/" 
          className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
        >
          Home
        </Link>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={index}>
            <span className="opacity-60">/</span>
            {item.path ? (
              <Link 
                to={item.path} 
                className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 dark:text-gray-200">{item.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
      
      {/* Title and Description */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex flex-wrap gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  breadcrumbItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string, // Optional - if not provided, renders as text (current page)
    })
  ),
  actions: PropTypes.node,
  className: PropTypes.string,
};

export default PageHeader;
