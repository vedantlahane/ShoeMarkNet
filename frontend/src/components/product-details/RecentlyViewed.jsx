import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { formatCurrency, getRelativeTime } from '../../utils/helpers';

const resolveProductHref = (product) => {
  if (!product) return '#';
  return `/products/${product.slug || product._id || product.id}`;
};

const RecentlyViewed = ({ products, className = '', style }) => {
  if (!Array.isArray(products) || products.length === 0) {
    return null;
  }

  return (
    <section
      className={clsx('bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl shadow-2xl p-8', className)}
      style={style}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Recently Viewed
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Jump back into the products you explored earlier.
          </p>
        </div>
        <span className="text-xs uppercase tracking-widest text-gray-500">
          {products.length} item{products.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link
            key={product._id || product.id || product.slug}
            to={resolveProductHref(product)}
            className="group rounded-3xl bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/10 overflow-hidden"
          >
            <div className="aspect-square w-full overflow-hidden">
              <img
                src={product.image || product.images?.[0] || '/product-placeholder.jpg'}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
            <div className="p-4 space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                {product.name}
              </h3>
              <p className="text-sm font-bold text-blue-600 dark:text-blue-300">
                {formatCurrency(product.price || product.discountPrice || 0)}
              </p>
              {product.viewedAt && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Viewed {getRelativeTime(product.viewedAt)}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

RecentlyViewed.propTypes = {
  products: PropTypes.arrayOf(PropTypes.object),
  className: PropTypes.string,
  style: PropTypes.object
};

RecentlyViewed.defaultProps = {
  products: [],
  className: '',
  style: undefined
};

export default RecentlyViewed;
