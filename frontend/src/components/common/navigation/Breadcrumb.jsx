import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * Breadcrumb component for consistent navigation across pages
 * 
 * @param {Array} items - Array of breadcrumb items with { label, path } structure
 * @param {string} currentPage - Current page label (no link)
 */
const Breadcrumb = ({ items = [], currentPage }) => {
  return (
    <nav className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
      <Link 
        to="/" 
        className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
      >
        Home
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <span className="opacity-60">/</span>
          <Link 
            to={item.path} 
            className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
          >
            {item.label}
          </Link>
        </React.Fragment>
      ))}
      
      {currentPage && (
        <>
          <span className="opacity-60">/</span>
          <span className="text-gray-900 dark:text-gray-200">{currentPage}</span>
        </>
      )}
    </nav>
  );
};

Breadcrumb.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
    })
  ),
  currentPage: PropTypes.string,
};

export default Breadcrumb;
