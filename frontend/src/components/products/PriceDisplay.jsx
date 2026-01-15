import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { formatCurrency } from '../../utils/helpers';

const PriceDisplay = ({
  currentPrice,
  discountedPrice,
  originalPrice,
  discountPercentage,
  className = ''
}) => {
  const { displayPrice, compareAtPrice, hasDiscount } = useMemo(() => {
    const normalizedCurrent = Number.isFinite(currentPrice) ? currentPrice : 0;
    const normalizedOriginal = Number.isFinite(originalPrice) ? originalPrice : normalizedCurrent;
    const normalizedDiscounted = Number.isFinite(discountedPrice) ? discountedPrice : normalizedCurrent;

    const effectivePrice = Math.min(normalizedCurrent, normalizedDiscounted);
    const showCompare = normalizedOriginal > effectivePrice + 0.009;

    return {
      displayPrice: effectivePrice,
      compareAtPrice: showCompare ? normalizedOriginal : null,
      hasDiscount: showCompare || (discountPercentage ?? 0) > 0
    };
  }, [currentPrice, discountedPrice, originalPrice, discountPercentage]);

  const installmentAmount = Math.max(displayPrice, 0) / 4;

  return (
    <div className={clsx('space-y-4', className)}>
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
          {formatCurrency(displayPrice)}
        </span>
        {compareAtPrice && (
          <span className="text-xl text-gray-500 line-through">
            {formatCurrency(compareAtPrice)}
          </span>
        )}
        {hasDiscount && discountPercentage > 0 && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-500/15 text-red-600">
            <i className="fas fa-fire mr-2"></i>
            Save {discountPercentage}%
          </span>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center text-blue-500">
            <i className="fas fa-shield-check"></i>
          </div>
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">Price Guarantee</p>
            <p className="text-xs">Free price adjustments within 14 days of purchase.</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center text-green-500">
            <i className="fas fa-credit-card"></i>
          </div>
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">Split Payments</p>
            <p className="text-xs">
              Or 4 interest-free installments of {formatCurrency(installmentAmount)} with ShopPay.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

PriceDisplay.propTypes = {
  currentPrice: PropTypes.number,
  discountedPrice: PropTypes.number,
  originalPrice: PropTypes.number,
  discountPercentage: PropTypes.number,
  className: PropTypes.string
};

PriceDisplay.defaultProps = {
  currentPrice: 0,
  discountedPrice: 0,
  originalPrice: 0,
  discountPercentage: 0,
  className: ''
};

export default PriceDisplay;
