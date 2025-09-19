// src/utils/toast.js
import toast from 'react-hot-toast';
import { ShoppingCart, Heart, CheckCircle, AlertCircle, Info, X, Star } from 'lucide-react';

// Premium toast configuration with glassmorphism effects
const toastConfig = {
  duration: 4000,
  style: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '16px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '500',
    padding: '16px 20px',
    minHeight: '64px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  iconTheme: {
    primary: '#3B82F6',
    secondary: '#ffffff',
  },
  position: 'top-right',
};

// Success toast with custom icon and styling
export const showSuccessToast = (message, options = {}) => {
  return toast.success(message, {
    ...toastConfig,
    style: {
      ...toastConfig.style,
      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)',
      border: '1px solid rgba(34, 197, 94, 0.3)',
      ...options.style,
    },
    icon: <CheckCircle className="w-5 h-5 text-green-400" />,
    ...options,
  });
};

// Error toast with custom styling
export const showErrorToast = (message, options = {}) => {
  return toast.error(message, {
    ...toastConfig,
    style: {
      ...toastConfig.style,
      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      ...options.style,
    },
    icon: <AlertCircle className="w-5 h-5 text-red-400" />,
    ...options,
  });
};

// Warning toast
export const showWarningToast = (message, options = {}) => {
  return toast(message, {
    ...toastConfig,
    style: {
      ...toastConfig.style,
      background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)',
      border: '1px solid rgba(251, 191, 36, 0.3)',
      ...options.style,
    },
    icon: <AlertCircle className="w-5 h-5 text-yellow-400" />,
    ...options,
  });
};

// Info toast
export const showInfoToast = (message, options = {}) => {
  return toast(message, {
    ...toastConfig,
    style: {
      ...toastConfig.style,
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.15) 100%)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      ...options.style,
    },
    icon: <Info className="w-5 h-5 text-blue-400" />,
    ...options,
  });
};

// Cart-specific toasts
export const showCartToast = {
  added: (productName, options = {}) => {
    return toast.success(
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-500/20 rounded-lg">
          <ShoppingCart className="w-4 h-4 text-green-400" />
        </div>
        <div>
          <div className="font-semibold">Added to Cart</div>
          <div className="text-sm text-gray-300 truncate max-w-[200px]">{productName}</div>
        </div>
      </div>,
      {
        ...toastConfig,
        duration: 3000,
        style: {
          ...toastConfig.style,
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          padding: '12px 16px',
          ...options.style,
        },
        icon: null,
        ...options,
      }
    );
  },

  updated: (quantity, productName, options = {}) => {
    return toast.success(
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <ShoppingCart className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <div className="font-semibold">Cart Updated</div>
          <div className="text-sm text-gray-300">
            {quantity}x {productName}
          </div>
        </div>
      </div>,
      {
        ...toastConfig,
        duration: 2500,
        style: {
          ...toastConfig.style,
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.15) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          padding: '12px 16px',
          ...options.style,
        },
        icon: null,
        ...options,
      }
    );
  },

  removed: (productName, options = {}) => {
    return toast(
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-500/20 rounded-lg">
          <X className="w-4 h-4 text-red-400" />
        </div>
        <div>
          <div className="font-semibold">Removed from Cart</div>
          <div className="text-sm text-gray-300 truncate max-w-[200px]">{productName}</div>
        </div>
      </div>,
      {
        ...toastConfig,
        duration: 2500,
        style: {
          ...toastConfig.style,
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          padding: '12px 16px',
          ...options.style,
        },
        icon: null,
        ...options,
      }
    );
  },

  cleared: (options = {}) => {
    return toast(
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-500/20 rounded-lg">
          <ShoppingCart className="w-4 h-4 text-gray-400" />
        </div>
        <div>
          <div className="font-semibold">Cart Cleared</div>
          <div className="text-sm text-gray-300">All items removed</div>
        </div>
      </div>,
      {
        ...toastConfig,
        duration: 2000,
        style: {
          ...toastConfig.style,
          background: 'linear-gradient(135deg, rgba(75, 85, 99, 0.15) 0%, rgba(55, 65, 81, 0.15) 100%)',
          border: '1px solid rgba(75, 85, 99, 0.3)',
          padding: '12px 16px',
          ...options.style,
        },
        icon: null,
        ...options,
      }
    );
  }
};

// Wishlist-specific toasts
export const showWishlistToast = {
  added: (productName, options = {}) => {
    return toast.success(
      <div className="flex items-center gap-3">
        <div className="p-2 bg-pink-500/20 rounded-lg">
          <Heart className="w-4 h-4 text-pink-400" />
        </div>
        <div>
          <div className="font-semibold">Added to Wishlist</div>
          <div className="text-sm text-gray-300 truncate max-w-[200px]">{productName}</div>
        </div>
      </div>,
      {
        ...toastConfig,
        duration: 2500,
        style: {
          ...toastConfig.style,
          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(219, 39, 119, 0.15) 100%)',
          border: '1px solid rgba(236, 72, 153, 0.3)',
          padding: '12px 16px',
          ...options.style,
        },
        icon: null,
        ...options,
      }
    );
  },

  removed: (productName, options = {}) => {
    return toast(
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-500/20 rounded-lg">
          <Heart className="w-4 h-4 text-gray-400" />
        </div>
        <div>
          <div className="font-semibold">Removed from Wishlist</div>
          <div className="text-sm text-gray-300 truncate max-w-[200px]">{productName}</div>
        </div>
      </div>,
      {
        ...toastConfig,
        duration: 2000,
        style: {
          ...toastConfig.style,
          background: 'linear-gradient(135deg, rgba(75, 85, 99, 0.15) 0%, rgba(55, 65, 81, 0.15) 100%)',
          border: '1px solid rgba(75, 85, 99, 0.3)',
          padding: '12px 16px',
          ...options.style,
        },
        icon: null,
        ...options,
      }
    );
  }
};

// Order-specific toasts
export const showOrderToast = {
  placed: (orderNumber, options = {}) => {
    return toast.success(
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-500/20 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-400" />
        </div>
        <div>
          <div className="font-semibold">Order Placed Successfully!</div>
          <div className="text-sm text-gray-300">Order #{orderNumber}</div>
        </div>
      </div>,
      {
        ...toastConfig,
        duration: 5000,
        style: {
          ...toastConfig.style,
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          padding: '16px 20px',
          ...options.style,
        },
        icon: null,
        ...options,
      }
    );
  },

  updated: (status, options = {}) => {
    return toast.success(
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Info className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <div className="font-semibold">Order Updated</div>
          <div className="text-sm text-gray-300">Status: {status}</div>
        </div>
      </div>,
      {
        ...toastConfig,
        duration: 4000,
        style: {
          ...toastConfig.style,
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.15) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          padding: '16px 20px',
          ...options.style,
        },
        icon: null,
        ...options,
      }
    );
  }
};

// Review-specific toasts
export const showReviewToast = {
  added: (rating, options = {}) => {
    return toast.success(
      <div className="flex items-center gap-3">
        <div className="p-2 bg-yellow-500/20 rounded-lg">
          <Star className="w-4 h-4 text-yellow-400" />
        </div>
        <div>
          <div className="font-semibold">Review Added</div>
          <div className="text-sm text-gray-300">
            {rating} star{rating !== 1 ? 's' : ''} rating
          </div>
        </div>
      </div>,
      {
        ...toastConfig,
        duration: 3000,
        style: {
          ...toastConfig.style,
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          padding: '12px 16px',
          ...options.style,
        },
        icon: null,
        ...options,
      }
    );
  }
};

// Auth-specific toasts
export const showAuthToast = {
  loginSuccess: (username, options = {}) => {
    return toast.success(
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-500/20 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-400" />
        </div>
        <div>
          <div className="font-semibold">Welcome back!</div>
          <div className="text-sm text-gray-300">Hi {username}</div>
        </div>
      </div>,
      {
        ...toastConfig,
        duration: 3000,
        style: {
          ...toastConfig.style,
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          padding: '12px 16px',
          ...options.style,
        },
        icon: null,
        ...options,
      }
    );
  },

  logoutSuccess: (options = {}) => {
    return toast.success("Logged out successfully", {
      ...toastConfig,
      duration: 2000,
      style: {
        ...toastConfig.style,
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.15) 100%)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        ...options.style,
      },
      icon: <CheckCircle className="w-5 h-5 text-blue-400" />,
      ...options,
    });
  },

  signupSuccess: (options = {}) => {
    return toast.success(
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-500/20 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-400" />
        </div>
        <div>
          <div className="font-semibold">Account Created!</div>
          <div className="text-sm text-gray-300">Welcome to ShoeMarkNet</div>
        </div>
      </div>,
      {
        ...toastConfig,
        duration: 4000,
        style: {
          ...toastConfig.style,
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          padding: '16px 20px',
          ...options.style,
        },
        icon: null,
        ...options,
      }
    );
  }
};

// Loading toast with custom spinner
export const showLoadingToast = (message = "Loading...", options = {}) => {
  return toast.loading(
    <div className="flex items-center gap-3">
      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent"></div>
      <span>{message}</span>
    </div>,
    {
      ...toastConfig,
      style: {
        ...toastConfig.style,
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.15) 100%)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        ...options.style,
      },
      icon: null,
      ...options,
    }
  );
};

// Promise toast for async operations
export const showPromiseToast = (promise, messages, options = {}) => {
  return toast.promise(
    promise,
    {
      loading: messages.loading || 'Loading...',
      success: messages.success || 'Success!',
      error: messages.error || 'Something went wrong',
    },
    {
      ...toastConfig,
      style: {
        ...toastConfig.style,
        ...options.style,
      },
      ...options,
    }
  );
};

// Custom toast with full control
export const showCustomToast = (content, options = {}) => {
  return toast.custom(
    (t) => (
      <div
        className={`
          glass p-4 rounded-xl border border-white/20 backdrop-blur-xl
          transform transition-all duration-300 ease-out
          ${t.visible ? 'animate-enter' : 'animate-exit'}
          shadow-2xl max-w-sm
        `}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
          ...options.style,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">{content}</div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="ml-3 p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    ),
    {
      duration: options.duration || 4000,
      position: options.position || 'top-right',
      ...options,
    }
  );
};

// Utility to dismiss all toasts
export const dismissAllToasts = () => {
  toast.dismiss();
};

// Utility to dismiss specific toast
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

export default {
  success: showSuccessToast,
  error: showErrorToast,
  warning: showWarningToast,
  info: showInfoToast,
  loading: showLoadingToast,
  promise: showPromiseToast,
  custom: showCustomToast,
  cart: showCartToast,
  wishlist: showWishlistToast,
  order: showOrderToast,
  review: showReviewToast,
  auth: showAuthToast,
  dismiss: dismissToast,
  dismissAll: dismissAllToasts,
};
