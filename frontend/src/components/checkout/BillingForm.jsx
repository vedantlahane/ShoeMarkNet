import React, { useState, useCallback } from 'react';

const BillingForm = ({
  billingInfo,
  onBillingInfoChange,
  billingAddressSame,
  onBillingAddressSameChange,
  shippingInfo,
  errors = {}
}) => {
  const [touched, setTouched] = useState({});

  const handleInputChange = useCallback((field, value) => {
    onBillingInfoChange({
      ...billingInfo,
      [field]: value
    });
  }, [billingInfo, onBillingInfoChange]);

  const handleFieldBlur = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl p-6 shadow-xl">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <i className="fas fa-receipt mr-3 text-purple-500"></i>
        Billing Information
      </h3>

      {/* Same as Shipping Address Checkbox */}
      <div className="mb-6">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={billingAddressSame}
            onChange={(e) => onBillingAddressSameChange(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
          />
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            Billing address is the same as shipping address
          </span>
        </label>
      </div>

      {!billingAddressSame && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={billingInfo.firstName || ''}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              onBlur={() => handleFieldBlur('firstName')}
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your first name"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={billingInfo.lastName || ''}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              onBlur={() => handleFieldBlur('lastName')}
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your last name"
            />
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Street Address *
            </label>
            <input
              type="text"
              value={billingInfo.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              onBlur={() => handleFieldBlur('address')}
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="123 Main Street"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              City *
            </label>
            <input
              type="text"
              value={billingInfo.city || ''}
              onChange={(e) => handleInputChange('city', e.target.value)}
              onBlur={() => handleFieldBlur('city')}
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your city"
            />
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              State *
            </label>
            <input
              type="text"
              value={billingInfo.state || ''}
              onChange={(e) => handleInputChange('state', e.target.value)}
              onBlur={() => handleFieldBlur('state')}
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your state"
            />
          </div>

          {/* Postal Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Postal Code *
            </label>
            <input
              type="text"
              value={billingInfo.postalCode || ''}
              onChange={(e) => handleInputChange('postalCode', e.target.value)}
              onBlur={() => handleFieldBlur('postalCode')}
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="12345"
            />
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Country *
            </label>
            <select
              value={billingInfo.country || 'US'}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="UK">United Kingdom</option>
              <option value="AU">Australia</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
            </select>
          </div>
        </div>
      )}

      {billingAddressSame && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-2xl p-4">
          <div className="flex items-center text-blue-800 dark:text-blue-200">
            <i className="fas fa-info-circle mr-3 text-blue-500"></i>
            <span>Your billing address will be the same as your shipping address.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingForm;
