// src/pages/Cart.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCart, updateCartItem, removeFromCart, clearCartError } from '../redux/slices/cartSlice';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, error } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const [isRemoving, setIsRemoving] = useState(null);
  const [isUpdating, setIsUpdating] = useState(null);
  const [animateElements, setAnimateElements] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  // Trigger animations
  useEffect(() => {
    setAnimateElements(true);
  }, []);

  // Calculate cart totals with enhanced logic
  const subtotal = Array.isArray(items)
    ? items.reduce((sum, item) => {
        const price = item.product?.price || item.price || 0;
        return sum + (price * item.quantity);
      }, 0)
    : 0;

  const promoDiscount = promoApplied ? subtotal * 0.1 : 0; // 10% discount
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = (subtotal - promoDiscount) * 0.07;
  const total = subtotal - promoDiscount + shipping + tax;

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
    return () => {
      dispatch(clearCartError());
    };
  }, [dispatch, user]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Failed to load cart');
      dispatch(clearCartError());
    }
  }, [error, dispatch]);

  const handleQuantityChange = (itemId, newQuantity, maxStock) => {
    let validatedQuantity = newQuantity;
    if (newQuantity < 1) {
      validatedQuantity = 1;
      toast.warning('Quantity cannot be less than 1! 📦');
    } else if (maxStock && newQuantity > maxStock) {
      validatedQuantity = maxStock;
      toast.warning(`Only ${maxStock} items available in stock! 📦`);
    } else if (newQuantity > 10) {
      validatedQuantity = 10;
      toast.info('Maximum 10 items per product allowed! 🛒');
    }

    setIsUpdating(itemId);
    dispatch(updateCartItem({ itemId, quantity: parseInt(validatedQuantity) }))
      .unwrap()
      .then(() => {
        toast.success('Cart updated successfully! ✅');
      })
      .catch((err) => {
        toast.error(err.message || 'Failed to update cart');
      })
      .finally(() => {
        setIsUpdating(null);
      });
  };

  const handleRemoveItem = async (itemId) => {
    if (window.confirm('Are you sure you want to remove this item? 🗑️')) {
      setIsRemoving(itemId);
      try {
        await dispatch(removeFromCart(itemId)).unwrap();
        toast.success('Item removed from cart! 🗑️');
      } catch (err) {
        toast.error(err.message || 'Failed to remove item');
      } finally {
        setIsRemoving(null);
      }
    }
  };

  const handlePromoCode = () => {
    if (promoCode.toUpperCase() === 'SAVE10') {
      setPromoApplied(true);
      toast.success('🎉 Promo code applied! 10% discount activated!');
    } else {
      toast.error('❌ Invalid promo code');
    }
  };

  const handleCheckout = () => {
    if (user) {
      navigate('/checkout');
    } else {
      navigate(`/login?redirect=${encodeURIComponent('/checkout')}`);
    }
  };

  // Enhanced loading state
  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Loader />
      </div>
    );
  }

  const cartItems = Array.isArray(items) ? items : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        
        {/* Enhanced Header */}
        <div className={`mb-8 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors font-semibold mb-4"
                >
                  <i className="fas fa-arrow-left mr-3 text-lg"></i>
                  Back
                </button>
                
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  <i className="fas fa-shopping-cart mr-3"></i>
                  Shopping Cart
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  <i className="fas fa-box mr-2"></i>
                  Review your items and proceed to checkout
                </p>
              </div>
              
              {cartItems.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  <div className="bg-blue-500/20 backdrop-blur-lg border border-blue-300/50 rounded-2xl px-4 py-2 text-blue-800 dark:text-blue-200">
                    <i className="fas fa-box mr-2"></i>
                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                  </div>
                  <div className="bg-green-500/20 backdrop-blur-lg border border-green-300/50 rounded-2xl px-4 py-2 text-green-800 dark:text-green-200">
                    <i className="fas fa-dollar-sign mr-2"></i>
                    ${total.toFixed(2)} Total
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {cartItems.length === 0 ? (
          /* Enhanced Empty Cart State */
          <div className={`text-center py-16 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-12 shadow-2xl max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl animate-pulse">
                <i className="fas fa-shopping-cart text-4xl text-white"></i>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Your Cart is Empty
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg leading-relaxed">
                Looks like you haven't added any items to your cart yet. 
                Start shopping and discover amazing products!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/products">
                  <button className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-2xl">
                    <i className="fas fa-shopping-bag mr-3"></i>
                    Start Shopping
                    <i className="fas fa-arrow-right ml-3"></i>
                  </button>
                </Link>
                <Link to="/categories">
                  <button className="bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 dark:text-white font-bold py-4 px-8 rounded-2xl hover:bg-white/30 transition-all duration-200">
                    <i className="fas fa-th-large mr-3"></i>
                    Browse Categories
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col xl:flex-row gap-8">
            
            {/* Enhanced Cart Items */}
            <div className="xl:w-2/3">
              <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl shadow-2xl overflow-hidden ${
                animateElements ? 'animate-fade-in-up' : 'opacity-0'
              }`} style={{ animationDelay: '0.2s' }}>
                
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white">
                  <h2 className="text-2xl font-bold">
                    <i className="fas fa-list mr-3"></i>
                    Cart Items ({cartItems.length})
                  </h2>
                </div>

                {/* Items List */}
                <div className="p-6 space-y-6">
                  {cartItems.map((item, index) => {
                    const product = item.product || {};
                    const price = product.price || item.price || 0;
                    const image = (product.images?.length > 0 && product.images[0]) ||
                                  product.image || item.image || 
                                  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=150&auto=format&fit=crop';
                    const name = product.name || item.name || 'Product';
                    const productId = product._id || item.productId;

                    return (
                      <div
                        key={item._id}
                        className={`bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 group ${
                          animateElements ? 'animate-fade-in-scale' : 'opacity-0'
                        }`}
                        style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                      >
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                          
                          {/* Product Image & Info */}
                          <div className="flex items-center gap-4 flex-1">
                            <div className="relative">
                              <img
                                src={image}
                                alt={name}
                                className="w-20 h-20 object-cover rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            
                            <div className="flex-1">
                              <Link 
                                to={`/products/${productId}`} 
                                className="text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 block mb-2"
                              >
                                {name}
                              </Link>
                              
                              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                                {item.size && (
                                  <span className="flex items-center">
                                    <i className="fas fa-ruler mr-1 text-orange-500"></i>
                                    Size: {item.size}
                                  </span>
                                )}
                                {item.color && (
                                  <span className="flex items-center">
                                    <i className="fas fa-palette mr-1 text-purple-500"></i>
                                    Color: {item.color}
                                  </span>
                                )}
                                <span className="flex items-center">
                                  <i className="fas fa-tag mr-1 text-green-500"></i>
                                  ${typeof price === 'number' ? price.toFixed(2) : '0.00'} each
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-4">
                            <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-1 flex items-center">
                              <button
                                onClick={() => handleQuantityChange(item._id, item.quantity - 1, product.countInStock || item.maxStock)}
                                className="w-10 h-10 rounded-xl hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                                disabled={isUpdating === item._id || item.quantity <= 1}
                              >
                                {isUpdating === item._id ? (
                                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <i className="fas fa-minus"></i>
                                )}
                              </button>
                              
                              <div className="w-16 text-center font-bold text-lg">
                                {item.quantity}
                              </div>
                              
                              <button
                                onClick={() => handleQuantityChange(item._id, item.quantity + 1, product.countInStock || item.maxStock)}
                                className="w-10 h-10 rounded-xl hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                                disabled={isUpdating === item._id || item.quantity >= (product.countInStock || item.maxStock || 10)}
                              >
                                {isUpdating === item._id ? (
                                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <i className="fas fa-plus"></i>
                                )}
                              </button>
                            </div>

                            {/* Item Total */}
                            <div className="text-right min-w-24">
                              <div className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                ${typeof price === 'number' ? (price * item.quantity).toFixed(2) : '0.00'}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Total
                              </div>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => handleRemoveItem(item._id)}
                              disabled={isRemoving === item._id}
                              className="w-12 h-12 bg-red-500/20 hover:bg-red-500 text-red-600 hover:text-white rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                              title="Remove item"
                            >
                              {isRemoving === item._id ? (
                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <i className="fas fa-trash"></i>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Continue Shopping */}
                <div className="p-6 border-t border-white/20 dark:border-gray-700/20">
                  <Link 
                    to="/products" 
                    className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors font-semibold"
                  >
                    <i className="fas fa-arrow-left mr-3"></i>
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>

            {/* Enhanced Order Summary */}
            <div className="xl:w-1/3">
              <div className={`sticky top-8 space-y-6 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
                
                {/* Promo Code */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    <i className="fas fa-percentage mr-3 text-yellow-500"></i>
                    Promo Code
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 px-4 py-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      disabled={promoApplied}
                    />
                    <button
                      onClick={handlePromoCode}
                      disabled={promoApplied || !promoCode.trim()}
                      className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold px-6 py-3 rounded-2xl transition-all duration-200 disabled:cursor-not-allowed"
                    >
                      {promoApplied ? (
                        <i className="fas fa-check"></i>
                      ) : (
                        <i className="fas fa-tag"></i>
                      )}
                    </button>
                  </div>
                  {promoApplied && (
                    <div className="mt-3 p-3 bg-green-500/20 border border-green-300/50 rounded-2xl text-green-700 dark:text-green-300 text-sm">
                      <i className="fas fa-check-circle mr-2"></i>
                      SAVE10 applied - 10% discount!
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl shadow-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
                    <h2 className="text-2xl font-bold">
                      <i className="fas fa-receipt mr-3"></i>
                      Order Summary
                    </h2>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Subtotal */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300">
                        <i className="fas fa-box mr-2 text-blue-500"></i>
                        Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
                    </div>

                    {/* Promo Discount */}
                    {promoApplied && (
                      <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                        <span>
                          <i className="fas fa-percentage mr-2"></i>
                          Promo Discount (10%)
                        </span>
                        <span className="font-semibold">-${promoDiscount.toFixed(2)}</span>
                      </div>
                    )}

                    {/* Shipping */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300">
                        <i className="fas fa-shipping-fast mr-2 text-purple-500"></i>
                        Shipping
                      </span>
                      <span className={`font-semibold ${shipping === 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                        {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                      </span>
                    </div>

                    {/* Tax */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300">
                        <i className="fas fa-calculator mr-2 text-orange-500"></i>
                        Tax (7%)
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">${tax.toFixed(2)}</span>
                    </div>

                    <div className="border-t border-white/20 dark:border-gray-700/20 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          <i className="fas fa-dollar-sign mr-2 text-green-500"></i>
                          Total
                        </span>
                        <span className="text-2xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                          ${total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Free Shipping Banner */}
                    {shipping === 0 ? (
                      <div className="bg-green-500/20 border border-green-300/50 rounded-2xl p-4 text-center">
                        <div className="text-green-700 dark:text-green-300">
                          <i className="fas fa-check-circle mr-2"></i>
                          <span className="font-semibold">You qualify for FREE shipping! 🎉</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-blue-500/20 border border-blue-300/50 rounded-2xl p-4 text-center">
                        <div className="text-blue-700 dark:text-blue-300 text-sm">
                          <i className="fas fa-truck mr-2"></i>
                          Add <span className="font-bold">${(100 - subtotal).toFixed(2)}</span> more for FREE shipping
                        </div>
                        <div className="mt-2 bg-white/20 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((subtotal / 100) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Checkout Button */}
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-2xl relative overflow-hidden group"
                    >
                      {/* Button Shimmer Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      
                      <span className="relative z-10 flex items-center justify-center">
                        <i className="fas fa-lock mr-3"></i>
                        Secure Checkout
                        <i className="fas fa-arrow-right ml-3 group-hover:translate-x-1 transition-transform duration-200"></i>
                      </span>
                    </button>

                    {/* Payment Methods */}
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <i className="fas fa-shield-alt mr-2 text-green-500"></i>
                        Secure Payment - We accept:
                      </p>
                      <div className="flex justify-center space-x-3">
                        {[
                          { icon: 'fab fa-cc-visa', color: 'from-blue-600 to-blue-700' },
                          { icon: 'fab fa-cc-mastercard', color: 'from-red-600 to-red-700' },
                          { icon: 'fab fa-cc-paypal', color: 'from-blue-500 to-cyan-500' },
                          { icon: 'fab fa-apple-pay', color: 'from-gray-700 to-gray-800' },
                          { icon: 'fab fa-google-pay', color: 'from-green-600 to-blue-600' }
                        ].map((payment, index) => (
                          <div
                            key={index}
                            className={`w-12 h-8 bg-gradient-to-r ${payment.color} rounded-lg flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform duration-200`}
                          >
                            <i className={`${payment.icon} text-sm`}></i>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Security Badges */}
                    <div className="flex justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <i className="fas fa-lock mr-1 text-green-500"></i>
                        SSL Secure
                      </div>
                      <div className="flex items-center">
                        <i className="fas fa-shield-alt mr-1 text-blue-500"></i>
                        PCI Compliant
                      </div>
                      <div className="flex items-center">
                        <i className="fas fa-user-shield mr-1 text-purple-500"></i>
                        Privacy Protected
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Styles */}
    </div>
  );
};

export default Cart;
