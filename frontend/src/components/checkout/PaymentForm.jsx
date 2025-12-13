import React, { forwardRef, useState, useCallback } from 'react';

const PAYMENT_METHODS = [
  { id: 'credit_card', name: 'Credit/Debit Card', icon: 'fas fa-credit-card' },
  { id: 'paypal', name: 'PayPal', icon: 'fab fa-paypal' },
  { id: 'apple_pay', name: 'Apple Pay', icon: 'fab fa-apple-pay' },
  { id: 'google_pay', name: 'Google Pay', icon: 'fab fa-google-pay' }
];

const PaymentForm = forwardRef(({
  paymentInfo,
  onPaymentInfoChange,
  paymentMethods = PAYMENT_METHODS,
  selectedPayment,
  onPaymentChange,
  errors = {}
}, ref) => {
  const [touched, setTouched] = useState({});

  const handleInputChange = useCallback((field, value) => {
    onPaymentInfoChange({
      ...paymentInfo,
      [field]: value
    });
  }, [paymentInfo, onPaymentInfoChange]);

  const handleFieldBlur = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  return (
    <div ref={ref} className="space-y-6">
      
      {/* Payment Method Selection */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <i className="fas fa-credit-card mr-3 text-green-500"></i>
          Payment Method
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                selectedPayment === method.id
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30 shadow-lg'
                  : 'border-white/30 bg-white/10 hover:border-green-300'
              }`}
              onClick={() => onPaymentChange(method.id)}
            >
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                  selectedPayment === method.id
                    ? 'bg-green-500 text-white'
                    : 'bg-white/20 text-gray-600 dark:text-gray-400'
                }`}>
                  <i className={method.icon}></i>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {method.name}
                </span>
              </div>
              
              {selectedPayment === method.id && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <i className="fas fa-check text-white text-sm"></i>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Credit Card Form */}
      {selectedPayment === 'credit_card' && (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl p-6 shadow-xl">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <i className="fas fa-lock mr-2 text-blue-500"></i>
            Card Information
          </h4>

          <div className="grid grid-cols-1 gap-6">
            {/* Card Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Card Number *
              </label>
              <input
                type="text"
                value={paymentInfo.cardNumber || ''}
                onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                onBlur={() => handleFieldBlur('cardNumber')}
                className={`w-full px-4 py-3 bg-white/20 backdrop-blur-lg border rounded-2xl focus:ring-2 focus:border-transparent transition-all duration-200 ${
                  errors.cardNumber && touched.cardNumber
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-white/30 focus:ring-blue-500'
                }`}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
              />
              {errors.cardNumber && touched.cardNumber && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  {errors.cardNumber}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expiry Date *
                </label>
                <input
                  type="text"
                  value={paymentInfo.expiryDate || ''}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  onBlur={() => handleFieldBlur('expiryDate')}
                  className={`w-full px-4 py-3 bg-white/20 backdrop-blur-lg border rounded-2xl focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    errors.expiryDate && touched.expiryDate
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-white/30 focus:ring-blue-500'
                  }`}
                  placeholder="MM/YY"
                  maxLength="5"
                />
                {errors.expiryDate && touched.expiryDate && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <i className="fas fa-exclamation-circle mr-1"></i>
                    {errors.expiryDate}
                  </p>
                )}
              </div>

              {/* CVV */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  CVV *
                </label>
                <input
                  type="text"
                  value={paymentInfo.cvv || ''}
                  onChange={(e) => handleInputChange('cvv', e.target.value)}
                  onBlur={() => handleFieldBlur('cvv')}
                  className={`w-full px-4 py-3 bg-white/20 backdrop-blur-lg border rounded-2xl focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    errors.cvv && touched.cvv
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-white/30 focus:ring-blue-500'
                  }`}
                  placeholder="123"
                  maxLength="4"
                />
                {errors.cvv && touched.cvv && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <i className="fas fa-exclamation-circle mr-1"></i>
                    {errors.cvv}
                  </p>
                )}
              </div>
            </div>

            {/* Cardholder Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cardholder Name *
              </label>
              <input
                type="text"
                value={paymentInfo.cardholderName || ''}
                onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                onBlur={() => handleFieldBlur('cardholderName')}
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="John Doe"
              />
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-2xl">
            <div className="flex items-center text-blue-800 dark:text-blue-200">
              <i className="fas fa-shield-alt mr-3 text-blue-500"></i>
              <div>
                <p className="font-medium">Secure Payment</p>
                <p className="text-sm">Your payment information is encrypted and secure</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PayPal Notice */}
      {selectedPayment === 'paypal' && (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fab fa-paypal text-white text-2xl"></i>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                PayPal Payment
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                You'll be redirected to PayPal to complete your payment securely.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

PaymentForm.displayName = 'PaymentForm';

export default PaymentForm;
