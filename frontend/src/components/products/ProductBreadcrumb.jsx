import React from 'react';
import { Link } from 'react-router-dom';

const ProductBreadcrumb = ({ product, onBack }) => {
  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack} 
          className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors font-semibold group"
        >
          <i className="fas fa-arrow-left mr-3 text-lg group-hover:-translate-x-1 transition-transform duration-200"></i>
          Back to Products
        </button>
        
        {/* Enhanced Breadcrumb */}
        <div className="hidden md:flex items-center space-x-2 text-sm">
          <Link to="/" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <i className="fas fa-home mr-1"></i>
            Home
          </Link>
          <i className="fas fa-chevron-right text-gray-400"></i>
          <Link to="/products" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Products
          </Link>
          {product?.category && (
            <>
              <i className="fas fa-chevron-right text-gray-400"></i>
              <Link 
                to={`/products?category=${encodeURIComponent(product.category)}`}
                className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {product.category}
              </Link>
            </>
          )}
          <i className="fas fa-chevron-right text-gray-400"></i>
          <span className="text-blue-600 dark:text-blue-400 font-medium truncate max-w-40">
            {product?.name}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductBreadcrumb;
