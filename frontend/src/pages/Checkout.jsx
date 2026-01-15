import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PageMeta from '../components/seo/PageMeta';
import PageHeader from '../components/common/layout/PageHeader';
import { toast } from 'react-toastify';

// Redux actions
import {
  clearCart,
  updateCartItem as updateCartItemQuantity,
  removeFromCart
} from '../redux/slices/cartSlice';
import {
  createOrder,
  validateCoupon,
  clearOrderError
} from '../redux/slices/orderSlice';
import { updateLastActivity } from '../redux/slices/authSlice';

// Components
import LoadingSpinner from '../components/common/feedback/LoadingSpinner';
import CheckoutSteps from '../components/checkout/CheckoutSteps';
import OrderSummary from '../components/checkout/OrderSummary';
import ShippingForm from '../components/checkout/ShippingForm';
import BillingForm from '../components/checkout/BillingForm';
import PaymentForm from '../components/checkout/PaymentForm';
import CouponForm from '../components/checkout/CouponForm';
import GuestCheckout from '../components/checkout/GuestCheckout';
import CheckoutSecurity from '../components/checkout/CheckoutSecurity';

// Hooks
import useLocalStorage from '../hooks/useLocalStorage';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import useWebSocket from '../hooks/useWebSocket';

// Utils
import { trackEvent } from '../utils/analytics';
import { formatCurrency, calculateTax } from '../utils/helpers';
import {
  validateEmail,
  validatePhone,
  validateAddress,
  validateCreditCard
} from '../utils/validation';
import { encryptSensitiveData } from '../utils/encryption';

// Constants
const CHECKOUT_STEPS = [
  { id: 'cart', label: 'Cart Review', icon: 'fas fa-shopping-cart' },
  { id: 'shipping', label: 'Shipping', icon: 'fas fa-truck' },
  { id: 'payment', label: 'Payment', icon: 'fas fa-credit-card' },
  { id: 'confirmation', label: 'Confirmation', icon: 'fas fa-check-circle' }
];

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

const PAYMENT_METHODS = [
  { id: 'credit_card', name: 'Credit/Debit Card', icon: 'fas fa-credit-card' },
  { id: 'paypal', name: 'PayPal', icon: 'fab fa-paypal' },
  { id: 'apple_pay', name: 'Apple Pay', icon: 'fab fa-apple-pay' },
  { id: 'google_pay', name: 'Google Pay', icon: 'fab fa-google-pay' },
  { id: 'crypto', name: 'Cryptocurrency', icon: 'fab fa-bitcoin' }
];

const TAX_RATE = 0.08; // 8% tax rate

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Redux state
  const { items: cartItems, totalAmount } = useSelector(state => state.cart);
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { loading: orderLoading, error: orderError } = useSelector(state => state.order);

  // Hooks
  const { isConnected } = useWebSocket('/checkout');

  // Local state with persistence
  const [currentStep, setCurrentStep] = useLocalStorage('checkoutStep', 'cart');
  const [isGuestCheckout, setIsGuestCheckout] = useLocalStorage('guestCheckout', false);
  const [shippingInfo, setShippingInfo] = useLocalStorage('shippingInfo', {});
  const [billingInfo, setBillingInfo] = useLocalStorage('billingInfo', {});
  const [paymentInfo, setPaymentInfo] = useState({});
  const [selectedShipping, setSelectedShipping] = useLocalStorage('selectedShipping', 'standard');
  const [selectedPayment, setSelectedPayment] = useLocalStorage('selectedPayment', 'credit_card');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [showSecurity, setShowSecurity] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);
  const [billingAddressSame, setBillingAddressSame] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);

  // Refs
  const formRef = useRef(null);
  const paymentRef = useRef(null);

  // Initialize checkout
  useEffect(() => {
    // Redirect if cart is empty
    if (!cartItems || cartItems.length === 0) {
      toast.error('Your cart is empty. Please add items before checkout.');
      navigate('/cart');
      return;
    }

    // Track checkout started
    trackEvent('checkout_started', {
      cart_items: cartItems.length,
      cart_value: totalAmount,
      user_authenticated: isAuthenticated,
      is_guest_checkout: isGuestCheckout
    });

    // Update user activity
    dispatch(updateLastActivity());
  }, [cartItems, totalAmount, isAuthenticated, isGuestCheckout, navigate, dispatch]);

  // Handle coupon validation
  useEffect(() => {
    if (couponCode && couponCode.length >= 3) {
      validateCouponCode(couponCode);
    }
  }, [couponCode]);

  // Calculate totals
  const calculations = useMemo(() => {
    const subtotal = cartItems?.reduce((sum, item) =>
      sum + (item.price * item.quantity), 0) || 0;

    const shippingCost = SHIPPING_OPTIONS.find(
      option => option.id === selectedShipping
    )?.price || 0;

    const discountAmount = appliedCoupon ?
      (subtotal * (appliedCoupon.percentage / 100)) : 0;

    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * TAX_RATE;

    const total = subtotal + shippingCost + taxAmount - discountAmount;

    return {
      subtotal,
      shippingCost,
      discountAmount,
      taxAmount,
      total: Math.max(0, total)
    };
  }, [cartItems, selectedShipping, appliedCoupon]);

  // Enhanced form validation
  const validateStep = useCallback((step) => {
    const newErrors = {};

    switch (step) {
      case 'shipping':
        if (!shippingInfo.firstName) newErrors.firstName = 'First name is required';
        if (!shippingInfo.lastName) newErrors.lastName = 'Last name is required';
        if (!shippingInfo.email || !validateEmail(shippingInfo.email)) {
          newErrors.email = 'Valid email is required';
        }
        if (!shippingInfo.phone || !validatePhone(shippingInfo.phone)) {
          newErrors.phone = 'Valid phone number is required';
        }
        if (!validateAddress(shippingInfo)) {
          newErrors.address = 'Complete address is required';
        }
        break;

      case 'payment':
        if (!billingAddressSame && !validateAddress(billingInfo)) {
          newErrors.billingAddress = 'Complete billing address is required';
        }
        if (selectedPayment === 'credit_card') {
          if (!validateCreditCard(paymentInfo.cardNumber)) {
            newErrors.cardNumber = 'Valid card number is required';
          }
          if (!paymentInfo.expiryDate) newErrors.expiryDate = 'Expiry date is required';
          if (!paymentInfo.cvv) newErrors.cvv = 'CVV is required';
        }
        if (!agreedToTerms) {
          newErrors.terms = 'You must agree to terms and conditions';
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [shippingInfo, billingInfo, paymentInfo, selectedPayment, billingAddressSame, agreedToTerms]);

  // Handle step navigation
  const handleStepChange = useCallback((newStep) => {
    const currentStepIndex = CHECKOUT_STEPS.findIndex(step => step.id === currentStep);
    const newStepIndex = CHECKOUT_STEPS.findIndex(step => step.id === newStep);

    // Validate current step before moving forward
    if (newStepIndex > currentStepIndex && !validateStep(currentStep)) {
      toast.error('Please complete all required fields');
      return;
    }

    setCurrentStep(newStep);

    trackEvent('checkout_step_changed', {
      from_step: currentStep,
      to_step: newStep,
      cart_value: calculations.total
    });
  }, [currentStep, validateStep, calculations.total]);

  // Handle coupon validation
  const validateCouponCode = useCallback(async (code) => {
    try {
      const result = await dispatch(validateCoupon(code)).unwrap();
      setAppliedCoupon(result);
      toast.success(`Coupon applied! ${result.percentage}% discount`);

      trackEvent('coupon_applied', {
        coupon_code: code,
        discount_percentage: result.percentage,
        cart_value: calculations.subtotal
      });
    } catch (error) {
      setAppliedCoupon(null);
      if (code.length >= 3) {
        toast.error('Invalid coupon code');
      }
    }
  }, [dispatch, calculations.subtotal]);

  // Handle place order
  const handlePlaceOrder = useCallback(async () => {
    if (!validateStep('payment')) {
      toast.error('Please complete all required fields');
      return;
    }

    setIsProcessing(true);
    setLoading(true);

    try {
      const orderData = {
        items: cartItems,
        shippingInfo: isGuestCheckout ? shippingInfo : {
          ...shippingInfo,
          userId: user._id
        },
        billingInfo: billingAddressSame ? shippingInfo : billingInfo,
        paymentMethod: selectedPayment,
        paymentInfo: selectedPayment === 'credit_card' ?
          encryptSensitiveData(paymentInfo) : null,
        shippingMethod: selectedShipping,
        couponCode: appliedCoupon?.code || null,
        calculations,
        isGuestCheckout,
        subscribeNewsletter,
        metadata: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          source: 'web_checkout'
        }
      };

      const order = await dispatch(createOrder(orderData)).unwrap();

      // Clear cart after successful order
      dispatch(clearCart());

      // Clear checkout data
      localStorage.removeItem('checkoutStep');
      localStorage.removeItem('shippingInfo');
      localStorage.removeItem('billingInfo');
      localStorage.removeItem('selectedShipping');
      localStorage.removeItem('selectedPayment');

      setOrderCompleted(true);

      toast.success('🎉 Order placed successfully!');

      trackEvent('order_completed', {
        order_id: order.id,
        order_value: calculations.total,
        payment_method: selectedPayment,
        shipping_method: selectedShipping,
        is_guest_checkout: isGuestCheckout,
        items_count: cartItems.length
      });

      // Redirect to order confirmation
      setTimeout(() => {
        navigate(`/order-confirmation/${order.id}`);
      }, 2000);

    } catch (error) {
      toast.error(error.message || 'Failed to place order. Please try again.');

      trackEvent('order_failed', {
        error: error.message,
        cart_value: calculations.total,
        payment_method: selectedPayment
      });
    } finally {
      setIsProcessing(false);
      setLoading(false);
    }
  }, [
    validateStep,
    cartItems,
    shippingInfo,
    billingInfo,
    paymentInfo,
    selectedPayment,
    selectedShipping,
    appliedCoupon,
    calculations,
    isGuestCheckout,
    subscribeNewsletter,
    billingAddressSame,
    user,
    dispatch,
    navigate
  ]);

  // Handle cart item updates
  const handleQuantityChange = useCallback((itemId, newQuantity) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart(itemId));
      toast.success('Item removed from cart');
    } else {
      dispatch(updateCartItemQuantity({ id: itemId, quantity: newQuantity }));
    }

    trackEvent('checkout_cart_updated', {
      item_id: itemId,
      new_quantity: newQuantity,
      action: newQuantity <= 0 ? 'removed' : 'updated'
    });
  }, [dispatch]);

  // Enhanced keyboard shortcuts (defined after handlePlaceOrder to avoid TDZ)
  useKeyboardShortcuts({
    'ctrl+enter': handlePlaceOrder,
    'ctrl+b': () => setCurrentStep('cart'),
    'ctrl+s': () => setCurrentStep('shipping'),
    'ctrl+p': () => setCurrentStep('payment'),
    'escape': () => navigate('/cart'),
    'ctrl+g': () => setIsGuestCheckout(!isGuestCheckout)
  });

  // Render current step content
  const renderStepContent = useCallback(() => {
    switch (currentStep) {
      case 'cart':
        return (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <i className="fas fa-shopping-cart mr-3 text-blue-500"></i>
                Review Your Order
              </h3>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{item.name}</h4>
                      <p className="text-gray-600 dark:text-gray-400">Size: {item.size}</p>
                      <p className="text-blue-600 font-bold">{formatCurrency(item.price)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        <i className="fas fa-minus text-sm"></i>
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        <i className="fas fa-plus text-sm"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <CouponForm
              couponCode={couponCode}
              appliedCoupon={appliedCoupon}
              onCouponChange={setCouponCode}
              onRemoveCoupon={() => {
                setAppliedCoupon(null);
                setCouponCode('');
              }}
            />
          </div>
        );

      case 'shipping':
        return (
          <div className="space-y-6">
            {!isAuthenticated && (
              <GuestCheckout
                isGuest={isGuestCheckout}
                onToggle={setIsGuestCheckout}
              />
            )}

            <ShippingForm
              shippingInfo={shippingInfo}
              onShippingInfoChange={setShippingInfo}
              shippingOptions={SHIPPING_OPTIONS}
              selectedShipping={selectedShipping}
              onShippingChange={setSelectedShipping}
              errors={errors}
            />
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <BillingForm
              billingInfo={billingInfo}
              onBillingInfoChange={setBillingInfo}
              billingAddressSame={billingAddressSame}
              onBillingAddressSameChange={setBillingAddressSame}
              shippingInfo={shippingInfo}
              errors={errors}
            />

            <PaymentForm
              ref={paymentRef}
              paymentInfo={paymentInfo}
              onPaymentInfoChange={setPaymentInfo}
              paymentMethods={PAYMENT_METHODS}
              selectedPayment={selectedPayment}
              onPaymentChange={setSelectedPayment}
              errors={errors}
            />

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl p-6 shadow-xl">
              <div className="space-y-4">
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    I agree to the{' '}
                    <a href="/terms" className="text-blue-600 hover:underline" target="_blank">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-blue-600 hover:underline" target="_blank">
                      Privacy Policy
                    </a>
                  </span>
                </label>

                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={subscribeNewsletter}
                    onChange={(e) => setSubscribeNewsletter(e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Subscribe to our newsletter for exclusive offers and updates
                  </span>
                </label>
              </div>

              {errors.terms && (
                <p className="text-red-500 text-sm mt-2">
                  <i className="fas fa-exclamation-triangle mr-1"></i>
                  {errors.terms}
                </p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  }, [
    currentStep,
    cartItems,
    couponCode,
    appliedCoupon,
    isAuthenticated,
    isGuestCheckout,
    shippingInfo,
    billingInfo,
    paymentInfo,
    selectedShipping,
    selectedPayment,
    billingAddressSame,
    agreedToTerms,
    subscribeNewsletter,
    errors,
    handleQuantityChange
  ]);

  // Show order completion screen
  if (orderCompleted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-2xl max-w-md animate-fade-in">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <i className="fas fa-check text-white text-3xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Order Placed Successfully!
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Thank you for your purchase. You will receive a confirmation email shortly.
          </p>
          <LoadingSpinner size="medium" message="Redirecting to confirmation..." />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <PageMeta
        title="Secure Checkout - ShoeMarkNet"
        description="Complete your purchase securely with our encrypted checkout process. Fast, safe, and reliable."
        robots="noindex, nofollow"
      />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

        {/* Checkout Header */}
        <div className="container-app py-6">
          <PageHeader
            title="Secure Checkout"
            description="Your information is protected with 256-bit SSL encryption"
            breadcrumbItems={[
              { label: 'Cart', path: '/cart' },
              { label: 'Checkout' }
            ]}
            actions={
              <button
                onClick={() => setShowSecurity(!showSecurity)}
                className="bg-green-500/20 backdrop-blur-lg border border-green-300/50 text-green-800 dark:text-green-200 px-3 py-1.5 rounded-lg text-sm hover:bg-green-500/30 transition-all duration-200"
              >
                <i className="fas fa-shield-alt mr-1.5"></i>
                Security Info
              </button>
            }
          />
        </div>

        {/* Main Checkout Content */}
        <div className="container-app pb-6">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Main Checkout Form */}
              <div className="lg:col-span-2 space-y-6">

                {/* Checkout Steps */}
                <CheckoutSteps
                  steps={CHECKOUT_STEPS}
                  currentStep={currentStep}
                  onStepChange={handleStepChange}
                  completedSteps={[]}
                />

                {/* Step Content */}
                <div ref={formRef} className="animate-fade-in">
                  {renderStepContent()}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => {
                      if (currentStep === 'cart') {
                        navigate('/cart');
                      } else {
                        const currentIndex = CHECKOUT_STEPS.findIndex(step => step.id === currentStep);
                        if (currentIndex > 0) {
                          setCurrentStep(CHECKOUT_STEPS[currentIndex - 1].id);
                        }
                      }
                    }}
                    className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 text-gray-900 dark:text-white font-semibold py-2.5 px-5 rounded-xl text-sm hover:bg-white/20 transition-all duration-200"
                  >
                    <i className="fas fa-arrow-left mr-1.5"></i>
                    {currentStep === 'cart' ? 'Back to Cart' : 'Previous'}
                  </button>

                  {currentStep === 'payment' ? (
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isProcessing || !agreedToTerms}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-2xl transition-all duration-200 flex items-center"
                    >
                      {isProcessing ? (
                        <>
                          <LoadingSpinner size="small" color="white" />
                          <span className="ml-2">Processing...</span>
                        </>
                      ) : (
                        <>
                          <i className="fas fa-lock mr-2"></i>
                          Place Order ({formatCurrency(calculations.total)})
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const currentIndex = CHECKOUT_STEPS.findIndex(step => step.id === currentStep);
                        if (currentIndex < CHECKOUT_STEPS.length - 1) {
                          handleStepChange(CHECKOUT_STEPS[currentIndex + 1].id);
                        }
                      }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200"
                    >
                      Continue
                      <i className="fas fa-arrow-right ml-2"></i>
                    </button>
                  )}
                </div>
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <OrderSummary
                    cartItems={cartItems}
                    calculations={calculations}
                    selectedShipping={selectedShipping}
                    appliedCoupon={appliedCoupon}
                    isConnected={isConnected}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Modal */}
        {showSecurity && (
          <CheckoutSecurity
            onClose={() => setShowSecurity(false)}
            isConnected={isConnected}
          />
        )}

        {/* Loading Overlay */}
        {(loading || orderLoading) && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 text-center shadow-2xl">
              <LoadingSpinner size="large" />
              <h3 className="text-xl font-bold text-white mt-4">
                {isProcessing ? 'Processing Your Order...' : 'Loading...'}
              </h3>
              <p className="text-blue-100 mt-2">
                {isProcessing ? 'Please do not refresh or close this page' : 'Please wait'}
              </p>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default Checkout;
