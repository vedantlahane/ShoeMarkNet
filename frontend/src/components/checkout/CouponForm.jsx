import React, { useState } from 'react';

const CouponForm = ({ couponCode, appliedCoupon, onCouponChange, onRemoveCoupon }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localCouponCode, setLocalCouponCode] = useState('');

  const handleApplyCoupon = () => {
    if (localCouponCode.trim()) {
      onCouponChange(localCouponCode.trim());
      setLocalCouponCode('');
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl p-6 shadow-xl">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <i className="fas fa-tag mr-3 text-orange-500"></i>
          Promo Code
        </h3>
        <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-gray-500`}></i>
      </button>

      {isExpanded && (
        <div className="mt-4">
          {appliedCoupon ? (
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <i className="fas fa-check-circle text-green-500 mr-3"></i>
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">
                      Coupon Applied: {appliedCoupon.code}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      {appliedCoupon.percentage}% discount applied
                    </p>
                  </div>
                </div>
                <button
                  onClick={onRemoveCoupon}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex space-x-3">
              <input
                type="text"
                value={localCouponCode}
                onChange={(e) => setLocalCouponCode(e.target.value)}
                placeholder="Enter promo code"
                className="flex-1 px-4 py-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <button
                onClick={handleApplyCoupon}
                disabled={!localCouponCode.trim()}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-2xl transition-all duration-200"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CouponForm;
