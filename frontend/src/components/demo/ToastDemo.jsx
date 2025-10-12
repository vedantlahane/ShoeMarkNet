// src/components/demo/ToastDemo.jsx
import React from 'react';
import { 
  showSuccessToast, 
  showErrorToast, 
  showWarningToast, 
  showInfoToast,
  showLoadingToast,
  showCartToast,
  showWishlistToast,
  showOrderToast,
  showReviewToast,
  showAuthToast,
  showCustomToast,
  dismissAllToasts
} from '../../utils/toast.jsx';
import { ShoppingBag, Heart, Star, User, AlertTriangle, Info, CheckCircle, X } from 'lucide-react';

const ToastDemo = () => {
  const demoProduct = {
    name: "Nike Air Jordan 1 Retro High",
    price: 170,
    image: "/assets/airjordan 1.jpg"
  };

  const handleLoadingDemo = () => {
    const toastId = showLoadingToast("Processing your order...");
    
    // Simulate async operation
    setTimeout(() => {
      dismissAllToasts();
      showSuccessToast("Order processed successfully!");
    }, 3000);
  };

  const handlePromiseDemo = () => {
    const mockPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.5 ? resolve('Success!') : reject('Failed!');
      }, 2000);
    });

    toast.promise(mockPromise, {
      loading: 'Processing...',
      success: 'Operation completed!',
      error: 'Something went wrong!',
    });
  };

  const handleCustomToast = () => {
    showCustomToast(
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Star className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <div className="font-semibold text-white">Premium Feature</div>
          <div className="text-sm text-gray-300">Unlock exclusive content</div>
        </div>
      </div>,
      {
        duration: 5000,
        style: {
          background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.15) 0%, rgba(126, 34, 206, 0.15) 100%)',
          border: '1px solid rgba(147, 51, 234, 0.3)',
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Premium Toast Notifications
          </h1>
          <p className="text-gray-300 text-lg">
            Glassmorphism design with lively animations and premium styling
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Basic Toasts */}
          <div className="glass p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Basic Toasts
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => showSuccessToast("Operation completed successfully!")}
                className="w-full btn-premium bg-green-600/20 border-green-500/30 text-green-300 hover:bg-green-600/30"
              >
                Success Toast
              </button>
              <button
                onClick={() => showErrorToast("Something went wrong. Please try again.")}
                className="w-full btn-premium bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/30"
              >
                Error Toast
              </button>
              <button
                onClick={() => showWarningToast("Warning: This action cannot be undone.")}
                className="w-full btn-premium bg-yellow-600/20 border-yellow-500/30 text-yellow-300 hover:bg-yellow-600/30"
              >
                Warning Toast
              </button>
              <button
                onClick={() => showInfoToast("Here's some helpful information.")}
                className="w-full btn-premium bg-blue-600/20 border-blue-500/30 text-blue-300 hover:bg-blue-600/30"
              >
                Info Toast
              </button>
            </div>
          </div>

          {/* Cart Toasts */}
          <div className="glass p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-400" />
              Cart Toasts
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => showCartToast.added(demoProduct.name)}
                className="w-full btn-premium bg-green-600/20 border-green-500/30 text-green-300 hover:bg-green-600/30"
              >
                Add to Cart
              </button>
              <button
                onClick={() => showCartToast.updated(2, demoProduct.name)}
                className="w-full btn-premium bg-blue-600/20 border-blue-500/30 text-blue-300 hover:bg-blue-600/30"
              >
                Update Quantity
              </button>
              <button
                onClick={() => showCartToast.removed(demoProduct.name)}
                className="w-full btn-premium bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/30"
              >
                Remove Item
              </button>
              <button
                onClick={() => showCartToast.cleared()}
                className="w-full btn-premium bg-gray-600/20 border-gray-500/30 text-gray-300 hover:bg-gray-600/30"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Wishlist Toasts */}
          <div className="glass p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-400" />
              Wishlist Toasts
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => showWishlistToast.added(demoProduct.name)}
                className="w-full btn-premium bg-pink-600/20 border-pink-500/30 text-pink-300 hover:bg-pink-600/30"
              >
                Add to Wishlist
              </button>
              <button
                onClick={() => showWishlistToast.removed(demoProduct.name)}
                className="w-full btn-premium bg-gray-600/20 border-gray-500/30 text-gray-300 hover:bg-gray-600/30"
              >
                Remove from Wishlist
              </button>
            </div>
          </div>

          {/* Order Toasts */}
          <div className="glass p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-green-400" />
              Order Toasts
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => showOrderToast.placed("ORD-2024-001")}
                className="w-full btn-premium bg-green-600/20 border-green-500/30 text-green-300 hover:bg-green-600/30"
              >
                Order Placed
              </button>
              <button
                onClick={() => showOrderToast.updated("Shipped")}
                className="w-full btn-premium bg-blue-600/20 border-blue-500/30 text-blue-300 hover:bg-blue-600/30"
              >
                Order Updated
              </button>
            </div>
          </div>

          {/* Auth Toasts */}
          <div className="glass p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              Auth Toasts
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => showAuthToast.loginSuccess("John Doe")}
                className="w-full btn-premium bg-green-600/20 border-green-500/30 text-green-300 hover:bg-green-600/30"
              >
                Login Success
              </button>
              <button
                onClick={() => showAuthToast.signupSuccess()}
                className="w-full btn-premium bg-blue-600/20 border-blue-500/30 text-blue-300 hover:bg-blue-600/30"
              >
                Signup Success
              </button>
              <button
                onClick={() => showAuthToast.logoutSuccess()}
                className="w-full btn-premium bg-gray-600/20 border-gray-500/30 text-gray-300 hover:bg-gray-600/30"
              >
                Logout Success
              </button>
            </div>
          </div>

          {/* Special Toasts */}
          <div className="glass p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Special Toasts
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleLoadingDemo}
                className="w-full btn-premium bg-blue-600/20 border-blue-500/30 text-blue-300 hover:bg-blue-600/30"
              >
                Loading Toast
              </button>
              <button
                onClick={() => showReviewToast.added(5)}
                className="w-full btn-premium bg-yellow-600/20 border-yellow-500/30 text-yellow-300 hover:bg-yellow-600/30"
              >
                Review Added
              </button>
              <button
                onClick={handleCustomToast}
                className="w-full btn-premium bg-purple-600/20 border-purple-500/30 text-purple-300 hover:bg-purple-600/30"
              >
                Custom Toast
              </button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="glass p-6 rounded-xl mt-8 text-center">
          <h3 className="text-xl font-semibold text-white mb-4">Controls</h3>
          <button
            onClick={dismissAllToasts}
            className="btn-premium bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/30 inline-flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Dismiss All Toasts
          </button>
        </div>

        {/* Toast Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          <div className="glass p-6 rounded-xl text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-blue-400" />
            </div>
            <h4 className="text-white font-semibold mb-2">Glassmorphism</h4>
            <p className="text-gray-300 text-sm">Beautiful glass effects with backdrop blur</p>
          </div>

          <div className="glass p-6 rounded-xl text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Star className="w-6 h-6 text-purple-400" />
            </div>
            <h4 className="text-white font-semibold mb-2">Dynamic Animations</h4>
            <p className="text-gray-300 text-sm">Smooth entrance and exit animations</p>
          </div>

          <div className="glass p-6 rounded-xl text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-green-400" />
            </div>
            <h4 className="text-white font-semibold mb-2">Custom Styling</h4>
            <p className="text-gray-300 text-sm">Tailored designs for different toast types</p>
          </div>

          <div className="glass p-6 rounded-xl text-center">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-6 h-6 text-yellow-400" />
            </div>
            <h4 className="text-white font-semibold mb-2">E-commerce Ready</h4>
            <p className="text-gray-300 text-sm">Pre-built toasts for shopping features</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToastDemo;
