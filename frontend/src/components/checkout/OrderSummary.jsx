import React from 'react';
import { formatCurrency } from '../../utils/helpers';

const OrderSummary = ({ cartItems, calculations, selectedShipping, appliedCoupon, isConnected }) => {
  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl p-6 shadow-xl sticky top-8">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <i className="fas fa-receipt mr-3 text-green-500"></i>
        Order Summary
      </h3>

      {/* Cart Items */}
      <div className="space-y-4 mb-6">
        {cartItems?.map((item) => (
          <div key={item._id} className="flex items-center space-x-3">
            <img 
              src={item.image} 
              alt={item.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">{item.name}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Size: {item.size} | Qty: {item.quantity}
              </p>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(item.price * item.quantity)}
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
