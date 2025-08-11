import React from 'react';

const PaymentMethods = ({ className = '' }) => {
  const paymentMethods = [
    { name: 'Visa', icon: 'fab fa-cc-visa' },
    { name: 'Mastercard', icon: 'fab fa-cc-mastercard' },
    { name: 'PayPal', icon: 'fab fa-cc-paypal' },
    { name: 'American Express', icon: 'fab fa-cc-amex' },
    { name: 'Apple Pay', icon: 'fab fa-cc-apple-pay' },
    { name: 'Google Pay', icon: 'fab fa-google-pay' }
  ];

  return (
    <div className={`${className}`}>
      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
        Accepted Payment Methods
      </h4>
      <div className="flex flex-wrap gap-3">
        {paymentMethods.map((method, index) => (
          <div
            key={index}
            className="w-12 h-8 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 flex items-center justify-center"
            title={method.name}
          >
            <i className={`${method.icon} text-gray-600 dark:text-gray-400 text-lg`}></i>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethods;
