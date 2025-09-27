import React, { useMemo } from 'react';
import { formatCurrency } from '../../utils/helpers';

const SHIPPING_COPY = {
  standard: { label: 'Standard Shipping', description: 'Arrives in 5-7 business days' },
  express: { label: 'Express Shipping', description: 'Arrives in 2-3 business days' },
  overnight: { label: 'Overnight Shipping', description: 'Next business day delivery' },
  pickup: { label: 'Store Pickup', description: 'Ready for pickup in 2 hours' }
};

const OrderSummary = ({ cartItems, calculations, selectedShipping, appliedCoupon, isConnected }) => {
  const shippingInfo = SHIPPING_COPY[selectedShipping] || SHIPPING_COPY.standard;

  const { normalizedItems, totalSavings } = useMemo(() => {
    const items = (cartItems || []).map(item => {
      const variantSize = item.size || item.variant?.size || 'Universal';
      const variantColor = item.color || item.variant?.color;
      const imageSrc = item.product?.images?.[0] || item.image || '/api/placeholder/80/80';
      const originalUnitPrice = item.product?.originalPrice || item.originalPrice || null;
      const currentUnitPrice = item.product?.price || item.price || 0;
      const savingsPerUnit = originalUnitPrice && originalUnitPrice > currentUnitPrice
        ? originalUnitPrice - currentUnitPrice
        : 0;

      return {
        id: item._id || `${item.productId}-${variantSize}`,
        name: item.product?.name || item.name,
        variantSize,
        variantColor,
        quantity: item.quantity || 1,
        currentUnitPrice,
        originalUnitPrice,
        imageSrc,
        savingsPerUnit
      };
    });

    const savings = items.reduce((total, item) => total + (item.savingsPerUnit * item.quantity), 0);
    return { normalizedItems: items, totalSavings: savings };
  }, [cartItems]);

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl p-6 shadow-xl sticky top-8">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <i className="fas fa-receipt mr-3 text-green-500"></i>
        Order Summary
      </h3>

      {/* Cart Items */}
      <div className="space-y-4 mb-6">
        {normalizedItems.map((item) => (
          <div key={item.id} className="flex items-center space-x-3">
            <img 
              src={item.imageSrc} 
              alt={item.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">{item.name}</h4>
              <div className="text-xs text-gray-600 dark:text-gray-400 flex flex-wrap gap-2 mt-1">
                <span>Size: {item.variantSize}</span>
                {item.variantColor && <span>Color: {item.variantColor}</span>}
                <span>Qty: {item.quantity}</span>
              </div>
              {item.originalUnitPrice && item.originalUnitPrice > item.currentUnitPrice && (
                <p className="text-[10px] text-emerald-500 mt-1">
                  You save {formatCurrency((item.originalUnitPrice - item.currentUnitPrice) * item.quantity)} on this item
                </p>
              )}
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(item.currentUnitPrice * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* Price Breakdown */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>Subtotal</span>
          <span>{formatCurrency(calculations.subtotal)}</span>
        </div>

        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>Shipping</span>
          <span>{calculations.shippingCost === 0 ? 'Free' : formatCurrency(calculations.shippingCost)}</span>
        </div>

        {appliedCoupon && (
          <div className="flex justify-between text-green-600">
            <span>Discount ({appliedCoupon.code})</span>
            <span>-{formatCurrency(calculations.discountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>Tax</span>
          <span>{formatCurrency(calculations.taxAmount)}</span>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
          <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
            <span>Total</span>
            <span>{formatCurrency(calculations.total)}</span>
          </div>
          {(totalSavings > 0 || calculations.discountAmount > 0) && (
            <p className="text-xs text-emerald-500 mt-2 flex items-center gap-2">
              <i className="fas fa-badge-percent"></i>
              You saved {formatCurrency(totalSavings + (calculations.discountAmount || 0))} on this order
            </p>
          )}
        </div>
      </div>

      {/* Shipping Selection */}
      <div className="mt-6 p-4 bg-white/5 border border-white/15 rounded-xl text-sm text-gray-700 dark:text-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">{shippingInfo.label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{shippingInfo.description}</p>
          </div>
          <span className="text-xs uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-full">
            {selectedShipping || 'standard'}
          </span>
        </div>
      </div>

      {/* Security Badge */}
      <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-xl">
        <div className="flex items-center space-x-2 text-green-800 dark:text-green-200">
          <i className={`fas fa-shield-alt ${isConnected ? 'animate-pulse' : ''}`}></i>
          <span className="text-sm font-medium">Secure SSL Checkout</span>
        </div>
        <p className="text-xs text-green-600 dark:text-green-300 mt-1">
          Your payment information is encrypted and secure
        </p>
      </div>
    </div>
  );
};

export default OrderSummary;
