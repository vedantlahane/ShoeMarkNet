import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { FaInfoCircle, FaListUl, FaShippingFast, FaStar } from 'react-icons/fa';
import Rating from '../common/feedback/Rating';
import ReviewForm from './ReviewForm';
import { formatDate, formatCurrency, getRelativeTime } from '../../utils/helpers';

const ProductTabs = ({
  product,
  user,
  activeTab = 'description',
  onTabChange,
  className = '',
  style
}) => {
  if (!product) {
    return null;
  }

  const specifications = useMemo(() => {
    if (!product.specifications) return [];
    if (product.specifications instanceof Map) {
      return Array.from(product.specifications.entries());
    }
    if (typeof product.specifications === 'object') {
      return Object.entries(product.specifications);
    }
    return [];
  }, [product.specifications]);

  const reviews = useMemo(() => Array.isArray(product.reviews) ? product.reviews : [], [product.reviews]);

  const tabs = [
    { id: 'description', label: 'Description', icon: FaInfoCircle },
    { id: 'specs', label: 'Specifications', icon: FaListUl, disabled: specifications.length === 0 },
    { id: 'shipping', label: 'Shipping & Returns', icon: FaShippingFast },
    { id: 'reviews', label: `Reviews (${product.numReviews || reviews.length || 0})`, icon: FaStar }
  ];

  const renderDescription = () => (
    <div className="space-y-6 text-gray-700 dark:text-gray-200">
      <p className="leading-relaxed text-lg">{product.description}</p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white/10 backdrop-blur border border-white/20">
          <h4 className="text-lg font-semibold mb-4 flex items-center">
            <i className="fas fa-bolt mr-3 text-yellow-500"></i>
            Key Highlights
          </h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start">
              <i className="fas fa-check text-green-500 mr-3 mt-1"></i>
              Premium craftsmanship with attention to detail.
            </li>
            <li className="flex items-start">
              <i className="fas fa-check text-green-500 mr-3 mt-1"></i>
              Designed for comfort and long-lasting performance.
            </li>
            <li className="flex items-start">
              <i className="fas fa-check text-green-500 mr-3 mt-1"></i>
              Backed by ShoeMarkNet quality assurance program.
            </li>
          </ul>
        </div>
        <div className="p-6 rounded-3xl bg-white/10 backdrop-blur border border-white/20">
          <h4 className="text-lg font-semibold mb-4 flex items-center">
            <i className="fas fa-tags mr-3 text-blue-500"></i>
            Brand Details
          </h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center">
              <i className="fas fa-industry text-purple-500 mr-3"></i>
              Brand: <span className="font-semibold ml-2">{product.brand}</span>
            </li>
            {product.sku && (
              <li className="flex items-center">
                <i className="fas fa-barcode text-purple-500 mr-3"></i>
                SKU: <span className="font-semibold ml-2">{product.sku}</span>
              </li>
            )}
            {product.category?.name && (
              <li className="flex items-center">
                <i className="fas fa-layer-group text-purple-500 mr-3"></i>
                Category: <span className="font-semibold ml-2">{product.category.name}</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );

  const renderSpecifications = () => (
    <div className="overflow-hidden rounded-3xl bg-white/10 backdrop-blur border border-white/20">
      <table className="min-w-full divide-y divide-white/10 text-sm">
        <tbody className="divide-y divide-white/5">
          {specifications.map(([key, value]) => (
            <tr key={key} className="hover:bg-white/5 transition-colors">
              <th className="px-6 py-4 text-left font-semibold text-gray-800 dark:text-gray-100 uppercase tracking-wide text-xs">
                {key}
              </th>
              <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderShipping = () => (
    <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700 dark:text-gray-300">
      <div className="p-6 rounded-3xl bg-white/10 backdrop-blur border border-white/20 space-y-3">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <i className="fas fa-shipping-fast text-blue-500 mr-3"></i>
          Shipping Information
        </h4>
        <p>Free standard shipping on orders over {formatCurrency(100)}.</p>
        <p>Express delivery available at checkout.</p>
        {product.weight && <p>Product weight: {product.weight} lbs</p>}
        {product.dimensions && (
          <p>
            Dimensions: {product.dimensions.length}" L × {product.dimensions.width}" W × {product.dimensions.height}" H
          </p>
        )}
      </div>
      <div className="p-6 rounded-3xl bg-white/10 backdrop-blur border border-white/20 space-y-3">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <i className="fas fa-undo text-green-500 mr-3"></i>
          Returns & Warranty
        </h4>
        <p>30-day hassle-free returns with prepaid return labels.</p>
        <p>Covered by a 12-month manufacturer warranty.</p>
        <p>Need help? Contact support 24/7 via chat or email.</p>
      </div>
    </div>
  );

  const renderReviews = () => (
    <div className="space-y-10">
      <div className="rounded-3xl bg-white/10 backdrop-blur border border-white/20 p-6">
        <div className="grid md:grid-cols-3 gap-6 items-center">
          <div className="text-center md:text-left space-y-3">
            <p className="text-sm text-gray-500 uppercase tracking-widest">Average Rating</p>
            <div className="flex items-center justify-center md:justify-start space-x-3">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">{(product.rating || 0).toFixed(1)}</span>
              <Rating value={product.rating || 0} size={24} showValue={false} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Based on {product.numReviews || reviews.length || 0} verified review(s)
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="p-6 rounded-3xl bg-white/10 backdrop-blur border border-white/20 text-center text-gray-600 dark:text-gray-300">
            <i className="fas fa-comments mb-3 text-2xl text-blue-500"></i>
            <p className="font-semibold">No reviews yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id || review.id} className="p-6 rounded-3xl bg-white/10 backdrop-blur border border-white/20">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {review.user?.name || review.name || 'Verified Buyer'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {review.createdAt ? formatDate(review.createdAt) : getRelativeTime(review.viewedAt || new Date())}
                    </p>
                  </div>
                  <Rating value={review.rating || 0} size={18} showValue={false} />
                </div>
                <p className="mt-4 text-gray-700 dark:text-gray-200 leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <ReviewForm productId={product._id} user={user} />
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'specs':
        return specifications.length > 0 ? renderSpecifications() : renderDescription();
      case 'shipping':
        return renderShipping();
      case 'reviews':
        return renderReviews();
      case 'description':
      default:
        return renderDescription();
    }
  };

  return (
    <section
      className={clsx('bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl shadow-2xl', className)}
      style={style}
    >
      <div className="flex flex-wrap gap-3 border-b border-white/10 px-6 py-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            disabled={tab.disabled}
            onClick={() => onTabChange?.(tab.id)}
            className={clsx(
              'flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200',
              tab.disabled && 'opacity-40 cursor-not-allowed',
              !tab.disabled && activeTab === tab.id && 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg',
              !tab.disabled && activeTab !== tab.id && 'bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-white/20'
            )}
            aria-pressed={activeTab === tab.id}
          >
            <tab.icon size={14} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="p-8">
        {renderContent()}
      </div>
    </section>
  );
};

ProductTabs.propTypes = {
  product: PropTypes.object,
  user: PropTypes.object,
  activeTab: PropTypes.string,
  onTabChange: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object
};

ProductTabs.defaultProps = {
  product: null,
  user: null,
  activeTab: 'description',
  onTabChange: undefined,
  className: '',
  style: undefined
};

export default ProductTabs;
