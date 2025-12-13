import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

// Utils
import { trackEvent } from '../../utils/analytics';
import { formatCurrency } from '../../utils/helpers';

// Hooks
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';
import useLocalStorage from '../../hooks/useLocalStorage';

const CompareDrawer = ({
  isOpen = false,
  onClose = () => {},
  onAddToCart = () => {},
  onRemoveFromCompare = () => {},
  maxCompareItems = 4,
  variant = 'default', // default, compact, mobile
  className = ''
}) => {
  // Redux state
  const { compareItems = [], cart, wishlist } = useSelector(state => ({
    compareItems: state.compare?.items || [],
    cart: state.cart?.items || [],
    wishlist: state.wishlist?.items || []
  }));
  const dispatch = useDispatch();

  // Local state
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAttributes, setSelectedAttributes] = useState(new Set(['price', 'rating', 'brand']));
  const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const [compactView, setCompactView] = useState(false);

  // Refs
  const drawerRef = useRef(null);
  const contentRef = useRef(null);

  // Local storage for comparison preferences
  const [comparePreferences, setComparePreferences] = useLocalStorage('comparePreferences', {
    selectedAttributes: ['price', 'rating', 'brand', 'features'],
    showDifferencesOnly: false,
    compactView: false
  });

  // Initialize animations
  useEffect(() => {
    if (isOpen) {
      setAnimationClass('animate-slide-in-right');
      // Load saved preferences
      setSelectedAttributes(new Set(comparePreferences.selectedAttributes));
      setShowDifferencesOnly(comparePreferences.showDifferencesOnly);
      setCompactView(comparePreferences.compactView);
    } else {
      setAnimationClass('animate-slide-out-right');
    }
  }, [isOpen, comparePreferences]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'escape': () => onClose(),
    'ctrl+shift+c': () => onClose(),
    'ctrl+a': () => handleSelectAllAttributes(),
    'ctrl+d': () => setShowDifferencesOnly(!showDifferencesOnly)
  });

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Save preferences when they change
  useEffect(() => {
    setComparePreferences({
      selectedAttributes: Array.from(selectedAttributes),
      showDifferencesOnly,
      compactView
    });
  }, [selectedAttributes, showDifferencesOnly, compactView, setComparePreferences]);

  // All possible attributes for comparison
  const allAttributes = [
    { id: 'price', label: 'Price', icon: 'fas fa-dollar-sign', type: 'currency' },
    { id: 'rating', label: 'Rating', icon: 'fas fa-star', type: 'rating' },
    { id: 'brand', label: 'Brand', icon: 'fas fa-tags', type: 'text' },
    { id: 'category', label: 'Category', icon: 'fas fa-th-large', type: 'text' },
    { id: 'sizes', label: 'Available Sizes', icon: 'fas fa-ruler', type: 'array' },
    { id: 'colors', label: 'Colors', icon: 'fas fa-palette', type: 'array' },
    { id: 'material', label: 'Material', icon: 'fas fa-cube', type: 'text' },
    { id: 'features', label: 'Key Features', icon: 'fas fa-list', type: 'array' },
    { id: 'warranty', label: 'Warranty', icon: 'fas fa-shield-alt', type: 'text' },
    { id: 'shipping', label: 'Shipping', icon: 'fas fa-shipping-fast', type: 'text' }
  ];

  // Handle attribute selection
  const handleAttributeToggle = useCallback((attributeId) => {
    setSelectedAttributes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(attributeId)) {
        newSet.delete(attributeId);
      } else {
        newSet.add(attributeId);
      }
      return newSet;
    });
  }, []);

  // Handle select all attributes
  const handleSelectAllAttributes = useCallback(() => {
    if (selectedAttributes.size === allAttributes.length) {
      setSelectedAttributes(new Set(['price', 'rating', 'brand']));
    } else {
      setSelectedAttributes(new Set(allAttributes.map(attr => attr.id)));
    }
  }, [selectedAttributes.size, allAttributes]);

  // Handle remove item from comparison
  const handleRemoveItem = useCallback((productId) => {
    onRemoveFromCompare(productId);
    
    trackEvent('compare_drawer_item_removed', {
      product_id: productId,
      remaining_items: compareItems.length - 1
    });
    
    toast.success('Product removed from comparison');
  }, [onRemoveFromCompare, compareItems.length]);

  // Handle add to cart
  const handleAddToCart = useCallback(async (product) => {
    try {
      await onAddToCart({
        ...product,
        quantity: 1,
        selectedSize: product.sizes?.[0]?.id || '',
        selectedColor: product.colors?.[0]?.id || ''
      });
      
      toast.success(`${product.name} added to cart!`);
      
      trackEvent('compare_drawer_add_to_cart', {
        product_id: product.id,
        product_name: product.name,
        price: product.price
      });
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  }, [onAddToCart]);

  // Filter attributes based on differences only setting
  const getVisibleAttributes = useCallback(() => {
    if (!showDifferencesOnly) {
      return allAttributes.filter(attr => selectedAttributes.has(attr.id));
    }

    return allAttributes.filter(attr => {
      if (!selectedAttributes.has(attr.id)) return false;
      
      // Check if this attribute has differences across products
      const values = compareItems.map(item => item[attr.id]);
      const uniqueValues = new Set(values.map(val => 
        Array.isArray(val) ? val.join(',') : String(val)
      ));
      
      return uniqueValues.size > 1;
    });
  }, [allAttributes, selectedAttributes, showDifferencesOnly, compareItems]);

  const visibleAttributes = getVisibleAttributes();

  // Render attribute value
  const renderAttributeValue = useCallback((item, attribute) => {
    const value = item[attribute.id];
    
    if (!value && value !== 0) {
      return <span className="text-gray-400">—</span>;
    }

    switch (attribute.type) {
      case 'currency':
        return (
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {formatCurrency(value)}
            {item.originalPrice && item.originalPrice > value && (
              <div className="text-sm text-gray-500 line-through">
                {formatCurrency(item.originalPrice)}
              </div>
            )}
          </div>
        );
      
      case 'rating':
        return (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <i
                  key={i}
                  className={`fas fa-star text-sm ${
                    i < Math.floor(value) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {value}/5
            </span>
          </div>
        );
      
      case 'array':
        if (Array.isArray(value)) {
          return (
            <div className="space-y-1">
              {value.slice(0, 3).map((item, index) => (
                <div key={index} className="text-sm text-gray-700 dark:text-gray-300">
                  {typeof item === 'object' ? item.label || item.name : item}
                </div>
              ))}
              {value.length > 3 && (
                <div className="text-xs text-gray-500">
                  +{value.length - 3} more
                </div>
              )}
            </div>
          );
        }
        return <span className="text-gray-700 dark:text-gray-300">{String(value)}</span>;
      
      default:
        return <span className="text-gray-700 dark:text-gray-300">{String(value)}</span>;
    }
  }, []);

  // Check if product is in cart/wishlist
  const isInCart = useCallback((productId) => {
    return cart.some(item => item.id === productId);
  }, [cart]);

  const isInWishlist = useCallback((productId) => {
    return wishlist.some(item => item.id === productId);
  }, [wishlist]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="flex-1 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`w-full max-w-6xl bg-white/10 backdrop-blur-xl border-l border-white/20 dark:border-gray-700/20 shadow-2xl overflow-hidden ${animationClass} ${className}`}
      >
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
                <i className="fas fa-balance-scale text-white text-xl"></i>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-theme">Compare Products</h2>
                <p className="text-muted-theme">
                  {compareItems.length} of {maxCompareItems} products selected
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* View Toggle */}
              <button
                onClick={() => setCompactView(!compactView)}
                className="w-10 h-10 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                title={compactView ? 'Expanded View' : 'Compact View'}
              >
                <i className={`fas ${compactView ? 'fa-expand' : 'fa-compress'}`}></i>
              </button>
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                title="Close (ESC)"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${(compareItems.length / maxCompareItems) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div ref={contentRef} className="h-full overflow-hidden flex flex-col">
          
          {/* Empty State */}
          {compareItems.length === 0 && (
            <div className="flex-1 flex items-center justify-center p-12">
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                  <i className="fas fa-balance-scale text-gray-400 text-3xl"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    No Products to Compare
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md">
                    Start comparing products by clicking the "Compare" button on product cards
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200"
                >
                  <i className="fas fa-shopping-bag mr-2"></i>
                  Continue Shopping
                </button>
              </div>
            </div>
          )}

          {/* Comparison Content */}
          {compareItems.length > 0 && (
            <>
              {/* Controls */}
              <div className="border-b border-white/20 dark:border-gray-700/20 p-6 space-y-4">
                
                {/* Tabs */}
                <div className="flex space-x-1 bg-white/10 backdrop-blur-lg rounded-2xl p-1">
                  {[
                    { id: 'overview', label: 'Overview', icon: 'fa-eye' },
                    { id: 'specifications', label: 'Specifications', icon: 'fa-list' },
                    { id: 'reviews', label: 'Reviews', icon: 'fa-star' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center py-2 px-4 rounded-xl transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-white/20 text-blue-600 dark:text-blue-400 shadow-lg'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                      }`}
                    >
                      <i className={`fas ${tab.icon} mr-2 text-sm`}></i>
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-4">
                  
                  {/* Attribute Selector */}
                  <div className="relative group">
                    <button className="flex items-center space-x-2 bg-white/20 backdrop-blur-lg border border-white/30 px-4 py-2 rounded-xl hover:bg-white/30 transition-colors">
                      <i className="fas fa-filter text-blue-500"></i>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Attributes ({selectedAttributes.size})
                      </span>
                      <i className="fas fa-chevron-down text-xs"></i>
                    </button>
                    
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">Select Attributes</span>
                          <button
                            onClick={handleSelectAllAttributes}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                          >
                            {selectedAttributes.size === allAttributes.length ? 'Reset' : 'Select All'}
                          </button>
                        </div>
                        {allAttributes.map((attribute) => (
                          <label key={attribute.id} className="flex items-center space-x-3 cursor-pointer hover:bg-white/10 rounded-xl p-2">
                            <input
                              type="checkbox"
                              checked={selectedAttributes.has(attribute.id)}
                              onChange={() => handleAttributeToggle(attribute.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <i className={`${attribute.icon} text-gray-500 w-4`}></i>
                            <span className="text-sm text-gray-700 dark:text-gray-300">{attribute.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Differences Only Toggle */}
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showDifferencesOnly}
                      onChange={(e) => setShowDifferencesOnly(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Show differences only
                    </span>
                  </label>

                  {/* Clear All */}
                  <button
                    onClick={() => compareItems.forEach(item => handleRemoveItem(item.id))}
                    className="flex items-center space-x-2 bg-red-500/20 border border-red-300 text-red-700 dark:text-red-400 px-4 py-2 rounded-xl hover:bg-red-500/30 transition-colors"
                  >
                    <i className="fas fa-trash text-sm"></i>
                    <span className="text-sm font-medium">Clear All</span>
                  </button>
                </div>
              </div>

              {/* Comparison Table */}
              <div className="flex-1 overflow-auto">
                <div className="min-w-full">
                  
                  {/* Product Headers */}
                  <div className="sticky top-0 bg-white/10 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/20 z-10">
                    <div className="flex">
                      <div className="w-48 p-4 font-semibold text-gray-900 dark:text-white">
                        Products
                      </div>
                      {compareItems.map((product) => (
                        <div key={product.id} className="flex-1 min-w-64 p-4 border-l border-white/20 dark:border-gray-700/20">
                          <div className="space-y-4">
                            
                            {/* Product Image */}
                            <div className="relative">
                              <img
                                src={product.images?.[0] || product.image}
                                alt={product.name}
                                className="w-full h-32 object-cover rounded-xl"
                              />
                              <button
                                onClick={() => handleRemoveItem(product.id)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                title="Remove from comparison"
                              >
                                <i className="fas fa-times text-xs"></i>
                              </button>
                            </div>

                            {/* Product Info */}
                            <div className="space-y-2">
                              <Link
                                to={`/product/${product.slug || product.id}`}
                                className="font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2"
                              >
                                {product.name}
                              </Link>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {product.brand}
                              </div>
                              <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {formatCurrency(product.price)}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-2">
                              <button
                                onClick={() => handleAddToCart(product)}
                                disabled={isInCart(product.id)}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 text-sm"
                              >
                                {isInCart(product.id) ? (
                                  <>
                                    <i className="fas fa-check mr-2"></i>
                                    In Cart
                                  </>
                                ) : (
                                  <>
                                    <i className="fas fa-shopping-cart mr-2"></i>
                                    Add to Cart
                                  </>
                                )}
                              </button>
                              
                              <Link
                                to={`/product/${product.slug || product.id}`}
                                className="block w-full bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-xl hover:bg-white/30 transition-colors text-center text-sm"
                              >
                                View Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Attribute Rows */}
                  <div className="divide-y divide-white/20 dark:divide-gray-700/20">
                    {visibleAttributes.map((attribute) => (
                      <div key={attribute.id} className="flex hover:bg-white/5 transition-colors">
                        <div className="w-48 p-4 font-medium text-gray-900 dark:text-white flex items-center">
                          <i className={`${attribute.icon} mr-3 text-gray-500`}></i>
                          {attribute.label}
                        </div>
                        {compareItems.map((product) => (
                          <div key={product.id} className="flex-1 min-w-64 p-4 border-l border-white/20 dark:border-gray-700/20">
                            {renderAttributeValue(product, attribute)}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/20 dark:border-gray-700/20 p-6 bg-white/5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <i className="fas fa-info-circle mr-2"></i>
              Use keyboard shortcuts: ESC to close, Ctrl+A to select all attributes
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDifferencesOnly(!showDifferencesOnly)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium"
              >
                {showDifferencesOnly ? 'Show All' : 'Show Differences'}
              </button>
              <button
                onClick={onClose}
                className="bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-xl hover:bg-white/30 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        {/* Custom Styles */}
      </div>
    </div>
  );
};

export default CompareDrawer;
