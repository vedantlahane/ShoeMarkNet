import React from 'react';
import { Link } from 'react-router-dom';

const GuestCheckout = ({ isGuest, onToggle }) => {
  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl p-6 shadow-xl">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
        <i className="fas fa-user-circle mr-3 text-blue-500"></i>
        Checkout Options
      </h3>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="radio"
            id="guest-checkout"
            name="checkout-type"
            checked={isGuest}
            onChange={() => onToggle(true)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
          />
          <label htmlFor="guest-checkout" className="flex-1">
            <div className="font-medium text-gray-900 dark:text-white">Guest Checkout</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Quick checkout without creating an account
            </div>
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="radio"
            id="create-account"
            name="checkout-type"
            checked={!isGuest}
            onChange={() => onToggle(false)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
          />
          <label htmlFor="create-account" className="flex-1">
            <div className="font-medium text-gray-900 dark:text-white">Create Account</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Save your information for faster future checkouts
            </div>
          </label>
        </div>
      </div>

      {isGuest && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-2xl">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <i className="fas fa-info-circle mr-2"></i>
            Already have an account?{' '}
            <Link to="/login" className="font-medium underline hover:no-underline">
              Sign in here
            </Link>
          </p>
        </div>
      )}
    </div>
  );
};

export default GuestCheckout;
