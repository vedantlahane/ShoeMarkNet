import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Heart,
  Star,
  Package,
  Truck,
  CreditCard,
  Sparkles,
  Zap,
  Gift,
  ShoppingCart
} from 'lucide-react';

import { 
  removeFromCart, 
  updateCartItem, 
  clearCart,
  selectCartItems,
  selectCartTotal,
  selectCartItemCount,
  selectCartLoading
} from '../../../redux/slices/cartSlice';
import { formatCurrency } from '../../../utils/helpers';
import usePrefersReducedMotion from '../../../hooks/usePrefersReducedMotion';

const CartSidebar = ({
  isOpen = false,
  onClose,
  onCheckout,
  variant = 'premium', // premium, minimal, compact
  showRecommendations = true,
  showPromoCode = true,
  showShipping = true,
  className = ''
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  
  // Redux state
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const itemCount = useSelector(selectCartItemCount);
  const isLoading = useSelector(selectCartLoading);
  
  // Local state
  const [isRendered, setIsRendered] = useState(isOpen);
  const [quantities, setQuantities] = useState({});
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(null);
  const [showPromocodeInput, setShowPromocodeInput] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  
  // Refs
  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const itemsRef = useRef(null);
  
  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price || item.price || 0;
    return sum + (price * item.quantity);
  }, 0);
  
  const promoDiscount = promoApplied ? subtotal * (promoApplied.discount / 100) : 0;
  const shippingCost = subtotal > 100 ? 0 : 9.99;
  const tax = (subtotal - promoDiscount) * 0.08;
  const total = subtotal - promoDiscount + shippingCost + tax;
  
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      return undefined;
    }

    const timeout = window.setTimeout(() => setIsRendered(false), 300);
    return () => window.clearTimeout(timeout);
  }, [isOpen]);
  
  // Handle quantity change with animation
  const handleQuantityChange = useCallback((itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setQuantities(prev => ({ ...prev, [itemId]: newQuantity }));
    
    // Add bounce animation
    const button = document.querySelector(`[data-quantity-btn="${itemId}"]`);
    if (button && !prefersReducedMotion && button.animate) {
      button.animate(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(1.12)' },
          { transform: 'scale(1)' }
        ],
        {
          duration: 180,
          easing: 'ease-in-out'
        }
      );
    }
    
    // Dispatch to Redux with debounce
    clearTimeout(window.quantityTimeout);
    window.quantityTimeout = setTimeout(() => {
      dispatch(updateCartItem({ id: itemId, quantity: newQuantity }));
    }, 500);
    
    toast.success('Quantity updated!', { 
      duration: 1500,
      position: 'top-right' 
    });
  }, [dispatch, prefersReducedMotion]);
  
  // Handle remove item
  const handleRemoveItem = useCallback((itemId, itemName) => {
    // Animate out
    const itemElement = document.querySelector(`[data-cart-item="${itemId}"]`);
    if (itemElement && !prefersReducedMotion && itemElement.animate) {
      const animation = itemElement.animate(
        [
          { transform: 'translateX(0)', opacity: 1, height: `${itemElement.offsetHeight}px`, marginBottom: getComputedStyle(itemElement).marginBottom },
          { transform: 'translateX(12px)', opacity: 0.5 },
          { transform: 'translateX(120px)', opacity: 0, height: '0px', marginBottom: '0px' }
        ],
        {
          duration: 260,
          easing: 'ease-in'
        }
      );

      animation.finished
        .catch(() => {})
        .finally(() => {
          dispatch(removeFromCart(itemId));
          toast.success(`${itemName} removed from cart`, {
            icon: '🗑️',
            duration: 3000
          });
        });
    } else {
      dispatch(removeFromCart(itemId));
      toast.success(`${itemName} removed from cart`, {
        icon: '🗑️',
        duration: 3000
      });
    }
  }, [dispatch, prefersReducedMotion]);
  
  // Handle promo code
  const handleApplyPromo = useCallback(() => {
    const validCodes = {
      'SAVE10': { discount: 10, message: '10% off applied!' },
      'SAVE20': { discount: 20, message: '20% off applied!' },
      'WELCOME': { discount: 15, message: 'Welcome discount applied!' },
      'FREESHIP': { discount: 0, message: 'Free shipping applied!', freeShip: true }
    };
    
    if (validCodes[promoCode.toUpperCase()]) {
      const code = validCodes[promoCode.toUpperCase()];
      setPromoApplied({
        code: promoCode.toUpperCase(),
        ...code
      });
      
      // Celebrate animation
      const button = document.querySelector('#apply-promo-btn');
      if (button && !prefersReducedMotion && button.animate) {
        button.animate(
          [
            { transform: 'scale(1)', backgroundColor: '' },
            { transform: 'scale(1.12)', backgroundColor: '#10B981' },
            { transform: 'scale(1)', backgroundColor: '' }
          ],
          { duration: 280, easing: 'ease-in-out', fill: 'forwards' }
        );
      }
      
      toast.success(code.message, { 
        icon: '🎉',
        duration: 4000
      });
    } else {
      toast.error('Invalid promo code', {
        icon: '❌',
        duration: 3000
      });
      
      // Error shake animation
      const input = document.querySelector('#promo-input');
      if (input && !prefersReducedMotion && input.animate) {
        input.animate(
          [
            { transform: 'translateX(0)' },
            { transform: 'translateX(-6px)' },
            { transform: 'translateX(6px)' },
            { transform: 'translateX(-4px)' },
            { transform: 'translateX(0)' }
          ],
          { duration: 360, easing: 'ease-in-out' }
        );
      }
    }
  }, [promoCode, prefersReducedMotion]);
  
  // Handle close
  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);
  
  // Handle checkout
  const handleCheckout = useCallback(() => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }
    
    handleClose();
    
    setTimeout(() => {
      if (onCheckout) {
        onCheckout();
      } else {
        navigate('/checkout');
      }
    }, 300);
    
    toast.success('Proceeding to checkout...', {
      icon: '🛒',
      duration: 2000
    });
  }, [cartItems.length, handleClose, onCheckout, navigate]);
  
  // Item hover animations
  const handleItemHover = useCallback((itemId, isHovering) => {
    setHoveredItem(isHovering ? itemId : null);
    
    const itemElement = document.querySelector(`[data-cart-item="${itemId}"]`);
    if (!itemElement) {
      return;
    }

    const targetTransform = isHovering ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)';
    itemElement.style.transform = targetTransform;

    if (!prefersReducedMotion && itemElement.animate) {
      itemElement.animate(
        [
          { transform: 'translateY(0) scale(1)' },
          { transform: targetTransform }
        ],
        { duration: 180, easing: 'ease-out' }
      );
    }
  }, [prefersReducedMotion]);
  
  // Render empty state
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mb-6 animate-pulse-slow">
        <ShoppingBag size={32} className="text-gray-400 dark:text-gray-500" />
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Your cart is empty
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
        Discover amazing products and start building your perfect collection!
      </p>
      
      <Link
        to="/products"
        onClick={handleClose}
        className="btn-premium px-6 py-3 rounded-xl text-white font-semibold micro-bounce flex items-center space-x-2"
      >
        <ShoppingBag size={16} />
        <span>Start Shopping</span>
      </Link>
    </div>
  );
  
  // Render cart item
  const renderCartItem = (item, index) => {
    const product = item.product || {};
    const currentQuantity = quantities[item._id] ?? item.quantity ?? 1;
    const itemTotal = (product.price || item.price || 0) * currentQuantity;
    
    return (
      <div
        key={item._id}
        data-cart-item={item._id}
        className="group relative bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-4 hover:shadow-lg transition-all duration-300"
        onMouseEnter={() => handleItemHover(item._id, true)}
        onMouseLeave={() => handleItemHover(item._id, false)}
      >
        <div className="flex items-start space-x-4">
          
          {/* Product Image */}
          <div className="relative flex-shrink-0">
            <img
              src={item.image || product.image || '/api/placeholder/80/80'}
              alt={item.name || product.name}
              className="w-16 h-16 rounded-xl object-cover border-2 border-white/30"
              onError={(e) => {
                e.target.src = '/api/placeholder/80/80';
              }}
            />
            
            {/* Discount Badge */}
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </div>
            )}
          </div>
          
          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2">
              {item.name || product.name}
            </h4>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {product.brand || 'Unknown Brand'}
            </p>
            
            {/* Size/Color Info */}
            {(item.size || item.color) && (
              <div className="flex items-center space-x-2 mb-2">
                {item.size && (
                  <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                    Size: {item.size}
                  </span>
                )}
                {item.color && (
                  <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                    {item.color}
                  </span>
                )}
              </div>
            )}
            
            {/* Price */}
            <div className="flex items-baseline space-x-2 mb-3">
              <span className="font-bold text-gray-900 dark:text-white">
                {formatCurrency(product.price || item.price || 0)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-gray-500 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>
            
            {/* Quantity Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleQuantityChange(item._id, currentQuantity - 1)}
                  disabled={currentQuantity <= 1}
                  className="w-8 h-8 rounded-lg glass flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-white hover:bg-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-quantity-btn={item._id}
                >
                  <Minus size={14} />
                </button>
                
                <span className="w-8 text-center font-semibold text-gray-900 dark:text-white">
                  {currentQuantity}
                </span>
                
                <button
                  onClick={() => handleQuantityChange(item._id, currentQuantity + 1)}
                  className="w-8 h-8 rounded-lg glass flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-white hover:bg-green-500 transition-all duration-200"
                  data-quantity-btn={item._id}
                >
                  <Plus size={14} />
                </button>
              </div>
              
              {/* Item Total */}
              <div className="text-right">
                <div className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(itemTotal)}
                </div>
              </div>
            </div>
          </div>
          
          {/* Remove Button */}
          <button
            onClick={() => handleRemoveItem(item._id, item.name || product.name)}
            className="absolute top-2 right-2 w-8 h-8 bg-red-500/20 hover:bg-red-500 text-red-600 hover:text-white rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
            title="Remove item"
          >
            <Trash2 size={14} />
          </button>
        </div>
        
        {/* Hover shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out opacity-0 group-hover:opacity-100 pointer-events-none rounded-2xl"></div>
      </div>
    );
  };
  
  if (!isRendered) return null;
  
  return (
    <div className={`fixed inset-0 z-50 ${className}`}>
      
      {/* Backdrop Overlay */}
      <div
        ref={overlayRef}
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      />
      
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`absolute right-0 top-0 h-full transition-transform duration-300 ease-out ${
          variant === 'compact' ? 'w-full max-w-sm' : 'w-full max-w-md lg:max-w-lg'
        } card-premium shadow-2xl flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        
        {/* Header */}
        <div ref={contentRef}>
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6">
            
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-8 w-2 h-2 bg-white rounded-full animate-ping"></div>
              <div className="absolute bottom-6 right-12 w-1 h-1 bg-white rounded-full animate-pulse"></div>
              <div className="absolute top-8 right-16 w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
            </div>
            
            <div className="relative flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                  <ShoppingBag size={20} />
                </div>
                
                <div>
                  <h2 className="text-xl font-bold">Shopping Cart</h2>
                  <p className="text-sm text-muted-theme">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleClose}
                className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center hover:bg-white/30 transition-all duration-200 hover:rotate-90"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-muted-theme mb-2">
                <span>Free shipping</span>
                <span>{subtotal >= 100 ? 'Unlocked!' : `$${(100 - subtotal).toFixed(2)} to go`}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((subtotal / 100) * 100, 100)}%` }}
                ></div>
              </div>
              {subtotal >= 100 && (
                <div className="flex items-center justify-center mt-2 text-green-200">
                  <Truck size={16} className="mr-2" />
                  <span className="text-sm font-semibold">Free shipping unlocked!</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto max-h-96">
            {cartItems.length === 0 ? (
              renderEmptyState()
            ) : (
              <div ref={itemsRef} className="p-4 space-y-4">
                {cartItems.map((item, index) => renderCartItem(item, index))}
              </div>
            )}
          </div>
          
          {/* Promo Code Section */}
          {showPromoCode && cartItems.length > 0 && (
            <div className="p-4 border-t border-white/20 dark:border-gray-700/20">
              {!showPromocodeInput ? (
                <button
                  onClick={() => setShowPromocodeInput(true)}
                  className="w-full glass text-gray-700 dark:text-gray-300 py-3 rounded-xl hover:glass transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Gift size={16} />
                  <span>Have a promo code?</span>
                </button>
              ) : (
                <div className="space-y-3">
                  {promoApplied && (
                    <div className="bg-green-500/20 border border-green-500/30 text-green-700 dark:text-green-300 p-3 rounded-xl flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Sparkles size={16} />
                        <span className="font-semibold">{promoApplied.code} applied!</span>
                      </div>
                      <button
                        onClick={() => {
                          setPromoApplied(null);
                          setPromoCode('');
                        }}
                        className="text-green-600 hover:text-green-800"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <input
                      id="promo-input"
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="Enter promo code"
                      className="flex-1 glass text-gray-900 dark:text-white px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleApplyPromo()}
                    />
                    <button
                      id="apply-promo-btn"
                      onClick={handleApplyPromo}
                      disabled={!promoCode.trim()}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200"
                    >
                      Apply
                    </button>
                  </div>
                  
                  {/* Quick Promo Suggestions */}
                  <div className="flex flex-wrap gap-2">
                    {['SAVE10', 'WELCOME', 'FREESHIP'].map((code) => (
                      <button
                        key={code}
                        onClick={() => {
                          setPromoCode(code);
                          setTimeout(handleApplyPromo, 100);
                        }}
                        className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full hover:bg-blue-100 hover:text-blue-600 transition-colors"
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Order Summary */}
          {cartItems.length > 0 && (
            <div className="p-4 border-t border-white/20 dark:border-gray-700/20 space-y-3">
              
              {/* Subtotal */}
              <div className="flex items-center justify-between text-gray-700 dark:text-gray-300">
                <span>Subtotal</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              
              {/* Promo Discount */}
              {promoApplied && promoApplied.discount > 0 && (
                <div className="flex items-center justify-between text-green-600 dark:text-green-400">
                  <span className="flex items-center">
                    <Sparkles size={14} className="mr-1" />
                    Discount ({promoApplied.discount}%)
                  </span>
                  <span className="font-semibold">-{formatCurrency(promoDiscount)}</span>
                </div>
              )}
              
              {/* Shipping */}
              <div className="flex items-center justify-between text-gray-700 dark:text-gray-300">
                <span className="flex items-center">
                  <Truck size={14} className="mr-1" />
                  Shipping
                </span>
                <span className="font-semibold">
                  {shippingCost === 0 ? (
                    <span className="text-green-600 dark:text-green-400">Free</span>
                  ) : (
                    formatCurrency(shippingCost)
                  )}
                </span>
              </div>
              
              {/* Tax */}
              <div className="flex items-center justify-between text-gray-700 dark:text-gray-300">
                <span>Tax (8%)</span>
                <span className="font-semibold">{formatCurrency(tax)}</span>
              </div>
              
              {/* Total */}
              <div className="flex items-center justify-between text-lg font-bold text-gray-900 dark:text-white pt-3 border-t border-white/20 dark:border-gray-700/20">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="p-4 space-y-3 border-t border-white/20 dark:border-gray-700/20">
            
            {cartItems.length > 0 && (
              <>
                <button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full btn-premium text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-3 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CreditCard size={20} />
                      <span>Checkout</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
                
                <Link
                  to="/cart"
                  onClick={handleClose}
                  className="w-full glass text-gray-700 dark:text-gray-300 py-3 rounded-xl font-semibold hover:glass transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <ShoppingCart size={16} />
                  <span>View Full Cart</span>
                </Link>
                
                {/* Quick Actions */}
                <div className="flex items-center justify-center space-x-4 pt-2">
                  <button
                    onClick={() => {
                      handleClose();
                      navigate('/wishlist');
                    }}
                    className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Heart size={16} />
                    <span className="text-sm">Wishlist</span>
                  </button>
                  
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear your cart?')) {
                        dispatch(clearCart());
                        toast.success('Cart cleared');
                      }
                    }}
                    className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                    <span className="text-sm">Clear Cart</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;
