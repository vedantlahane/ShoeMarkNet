import React, { useState, useCallback, useMemo } from 'react';
import { validateEmail, validatePhone, validateAddress } from '../../utils/validation';

const SHIPPING_OPTIONS = [
  { 
    id: 'standard', 
    name: 'Standard Shipping', 
    description: '5-7 business days', 
    price: 5.99,
    icon: 'fas fa-truck'
  },
  { 
    id: 'express', 
    name: 'Express Shipping', 
    description: '2-3 business days', 
    price: 12.99,
    icon: 'fas fa-shipping-fast'
  },
  { 
    id: 'overnight', 
    name: 'Overnight Shipping', 
    description: 'Next business day', 
    price: 24.99,
    icon: 'fas fa-clock'
  },
  { 
    id: 'pickup', 
    name: 'Store Pickup', 
    description: 'Free - Ready in 2 hours', 
    price: 0,
    icon: 'fas fa-store'
  }
];

const ShippingForm = ({
  shippingInfo,
  onShippingInfoChange,
  shippingOptions = SHIPPING_OPTIONS,
  selectedShipping,
  onShippingChange,
  errors = {}
}) => {
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Handle input change with real-time validation
  const handleInputChange = useCallback((field, value) => {
    onShippingInfoChange({
      ...shippingInfo,
      [field]: value
    });

    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [shippingInfo, onShippingInfoChange, fieldErrors]);

  // Handle field blur for validation
  const handleFieldBlur = useCallback((field, value) => {
    setTouched(prev => ({ ...prev, [field]: true }));

    let error = '';
    switch (field) {
      case 'firstName':
        if (!value || value.trim().length < 2) {
          error = 'First name must be at least 2 characters';
        }
        break;
      case 'lastName':
        if (!value || value.trim().length < 2) {
          error = 'Last name must be at least 2 characters';
        }
        break;
      case 'email':
        if (!value || !validateEmail(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'phone':
        if (!value || !validatePhone(value)) {
          error = 'Please enter a valid phone number';
        }
        break;
      case 'address':
        if (!value || value.trim().length < 5) {
          error = 'Please enter a valid address';
        }
        break;
      case 'city':
        if (!value || value.trim().length < 2) {
          error = 'Please enter a valid city';
        }
        break;
      case 'state':
        if (!value || value.trim().length < 2) {
          error = 'Please enter a valid state';
        }
        break;
      case 'postalCode':
        if (!value || !/^\d{5}(-\d{4})?$/.test(value)) {
          error = 'Please enter a valid postal code';
        }
        break;
      default:
        break;
    }

    if (error) {
      setFieldErrors(prev => ({ ...prev, [field]: error }));
    }
  }, []);

  // Form validation status
  const isFormValid = useMemo(() => {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'postalCode'];
    return requiredFields.every(field => 
      shippingInfo[field] && 
      shippingInfo[field].trim().length > 0 && 
      !fieldErrors[field]
    );
  }, [shippingInfo, fieldErrors]);

  return (
    <div className="space-y-8">
      
      {/* Shipping Information Form */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <i className="fas fa-shipping-fast mr-3 text-blue-500"></i>
          Shipping Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={shippingInfo.firstName || ''}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              onBlur={(e) => handleFieldBlur('firstName', e.target.value)}
              className={`w-full px-4 py-3 bg-white/20 backdrop-blur-lg border rounded-2xl focus:ring-2 focus:border-transparent transition-all duration-200 ${
                (fieldErrors.firstName || errors.firstName) && touched.firstName
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-white/30 focus:ring-blue-500'
              }`}
              placeholder="Enter your first name"
            />
            {((fieldErrors.firstName || errors.firstName) && touched.firstName) && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {fieldErrors.firstName || errors.firstName}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={shippingInfo.lastName || ''}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              onBlur={(e) => handleFieldBlur('lastName', e.target.value)}
              className={`w-full px-4 py-3 bg-white/20 backdrop-blur-lg border rounded-2xl focus:ring-2 focus:border-transparent transition-all duration-200 ${
                (fieldErrors.lastName || errors.lastName) && touched.lastName
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-white/30 focus:ring-blue-500'
              }`}
              placeholder="Enter your last name"
            />
            {((fieldErrors.lastName || errors.lastName) && touched.lastName) && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {fieldErrors.lastName || errors.lastName}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={shippingInfo.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={(e) => handleFieldBlur('email', e.target.value)}
              className={`w-full px-4 py-3 bg-white/20 backdrop-blur-lg border rounded-2xl focus:ring-2 focus:border-transparent transition-all duration-200 ${
                (fieldErrors.email || errors.email) && touched.email
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-white/30 focus:ring-blue-500'
              }`}
              placeholder="Enter your email address"
            />
            {((fieldErrors.email || errors.email) && touched.email) && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {fieldErrors.email || errors.email}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={shippingInfo.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              onBlur={(e) => handleFieldBlur('phone', e.target.value)}
              className={`w-full px-4 py-3 bg-white/20 backdrop-blur-lg border rounded-2xl focus:ring-2 focus:border-transparent transition-all duration-200 ${
                (fieldErrors.phone || errors.phone) && touched.phone
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-white/30 focus:ring-blue-500'
              }`}
              placeholder="(555) 123-4567"
            />
            {((fieldErrors.phone || errors.phone) && touched.phone) && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {fieldErrors.phone || errors.phone}
              </p>
            )}
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Street Address *
            </label>
            <input
              type="text"
              value={shippingInfo.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              onBlur={(e) => handleFieldBlur('address', e.target.value)}
              className={`w-full px-4 py-3 bg-white/20 backdrop-blur-lg border rounded-2xl focus:ring-2 focus:border-transparent transition-all duration-200 ${
                (fieldErrors.address || errors.address) && touched.address
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-white/30 focus:ring-blue-500'
              }`}
              placeholder="123 Main Street"
            />
            {((fieldErrors.address || errors.address) && touched.address) && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {fieldErrors.address || errors.address}
              </p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              City *
            </label>
            <input
              type="text"
              value={shippingInfo.city || ''}
              onChange={(e) => handleInputChange('city', e.target.value)}
              onBlur={(e) => handleFieldBlur('city', e.target.value)}
              className={`w-full px-4 py-3 bg-white/20 backdrop-blur-lg border rounded-2xl focus:ring-2 focus:border-transparent transition-all duration-200 ${
                (fieldErrors.city || errors.city) && touched.city
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-white/30 focus:ring-blue-500'
              }`}
              placeholder="Enter your city"
            />
            {((fieldErrors.city || errors.city) && touched.city) && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {fieldErrors.city || errors.city}
              </p>
            )}
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              State *
            </label>
            <input
              type="text"
              value={shippingInfo.state || ''}
              onChange={(e) => handleInputChange('state', e.target.value)}
              onBlur={(e) => handleFieldBlur('state', e.target.value)}
              className={`w-full px-4 py-3 bg-white/20 backdrop-blur-lg border rounded-2xl focus:ring-2 focus:border-transparent transition-all duration-200 ${
                (fieldErrors.state || errors.state) && touched.state
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-white/30 focus:ring-blue-500'
              }`}
              placeholder="Enter your state"
            />
            {((fieldErrors.state || errors.state) && touched.state) && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {fieldErrors.state || errors.state}
              </p>
            )}
          </div>

          {/* Postal Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Postal Code *
            </label>
            <input
              type="text"
              value={shippingInfo.postalCode || ''}
              onChange={(e) => handleInputChange('postalCode', e.target.value)}
              onBlur={(e) => handleFieldBlur('postalCode', e.target.value)}
              className={`w-full px-4 py-3 bg-white/20 backdrop-blur-lg border rounded-2xl focus:ring-2 focus:border-transparent transition-all duration-200 ${
                (fieldErrors.postalCode || errors.postalCode) && touched.postalCode
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-white/30 focus:ring-blue-500'
              }`}
              placeholder="12345"
            />
            {((fieldErrors.postalCode || errors.postalCode) && touched.postalCode) && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {fieldErrors.postalCode || errors.postalCode}
              </p>
            )}
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Country *
            </label>
            <select
              value={shippingInfo.country || 'US'}
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
      </div>

      {/* Shipping Options */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <i className="fas fa-truck mr-3 text-green-500"></i>
          Shipping Options
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {shippingOptions.map((option) => (
            <div
              key={option.id}
              className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                selectedShipping === option.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-lg'
                  : 'border-white/30 bg-white/10 hover:border-blue-300'
              }`}
              onClick={() => onShippingChange(option.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    selectedShipping === option.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/20 text-gray-600 dark:text-gray-400'
                  }`}>
                    <i className={option.icon}></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {option.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {option.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-gray-900 dark:text-white">
                    {option.price === 0 ? 'FREE' : `$${option.price.toFixed(2)}`}
                  </p>
                </div>
              </div>
              
              {selectedShipping === option.id && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <i className="fas fa-check text-white text-sm"></i>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Status */}
      {isFormValid && (
        <div className="bg-green-500/20 backdrop-blur-lg border border-green-300/50 rounded-2xl p-4">
          <div className="flex items-center text-green-800 dark:text-green-200">
            <i className="fas fa-check-circle mr-3 text-green-500"></i>
            <span className="font-medium">Shipping information completed!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingForm;
