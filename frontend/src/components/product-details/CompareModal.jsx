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

const CompareModal = ({
  isOpen = false,
  onClose = () => {},
  onAddToCart = () => {},
  onRemoveFromCompare = () => {},
  compareItems = [],
  maxCompareItems = 3,
  variant = 'default', // default, compact, fullscreen
  className = ''
}) => {
  // Redux state
  const { cart, wishlist } = useSelector(state => ({
    cart: state.cart?.items || [],
    wishlist: state.wishlist?.items || []
  }));
  const dispatch = useDispatch();

  // Local state
  const [selectedAttributes, setSelectedAttributes] = useState(new Set(['price', 'rating', 'brand']));
  const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const [activeTab, setActiveTab] = useState('comparison');

  // Refs
  const modalRef = useRef(null);

  // Local storage for comparison preferences
  const [comparePreferences, setComparePreferences] = useLocalStorage('compareModalPreferences', {
    selectedAttributes: ['price', 'rating', 'brand', 'features'],
    showDifferencesOnly: false
  });

  // Initialize animations
  useEffect(() => {
    if (isOpen) {
      setAnimationClass('animate-fade-in-scale');
      // Load saved preferences
      setSelectedAttributes(new Set(comparePreferences.selectedAttributes));
      setShowDifferencesOnly(comparePreferences.showDifferencesOnly);
    } else {
      setAnimationClass('animate-fade-out-scale');
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
      if (modalRef.current && !modalRef.current.contains(event.target)) {
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
      showDifferencesOnly
    });
  }, [selectedAttributes, showDifferencesOnly, setComparePreferences]);

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
    
    trackEvent('compare_modal_item_removed', {
      product_id: productId,
      remaining_items: compareItems.length - 1
    });
    
    toast.success('Product removed from comparison');
    
    // Close modal if no items left
    if (compareItems.length <= 1) {
      onClose();
    }
  }, [onRemoveFromCompare, compareItems.length, onClose]);

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
      
      trackEvent('compare_modal_add_to_cart', {
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
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(value)}
            </div>
            {item.originalPrice && item.originalPrice > value && (
              <div className="text-sm text-gray-500 line-through">
                {formatCurrency(item.originalPrice)}
              </div>
            )}
          </div>
        );
      
      case 'rating':
        return (
          <div className="flex flex-col items-center space-y-1">
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
            <div className="space-y-1 text-center">
              {value.slice(0, 2).map((item, index) => (
                <div key={index} className="text-sm text-gray-700 dark:text-gray-300">
                  {typeof item === 'object' ? item.label || item.name : item}
                </div>
              ))}
              {value.length > 2 && (
                <div className="text-xs text-gray-500">
                  +{value.length - 2} more
                </div>
              )}
            </div>
          );
        }
        return <span className="text-gray-700 dark:text-gray-300">{String(value)}</span>;
      
      default:
        return <span className="text-gray-700 dark:text-gray-300 text-center block">{String(value)}</span>;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className={`relative w-full max-w-7xl max-h-[90vh] bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl shadow-2xl overflow-hidden ${animationClass} ${className}`}
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
                  Comparing {compareItems.length} of {maxCompareItems} products
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 hover:scale-110"
              title="Close (ESC)"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Empty State */}
        {compareItems.length === 0 && (
          <div className="flex items-center justify-center p-16">
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                <i className="fas fa-balance-scale text-gray-400 text-3xl"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  No Products to Compare
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                  Add products to your comparison to see detailed side-by-side analysis
                </p>
              </div>
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200"
              >
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
                  { id: 'comparison', label: 'Comparison', icon: 'fa-balance-scale' },
                  { id: 'overview', label: 'Overview', icon: 'fa-eye' },
                  { id: 'details', label: 'Details', icon: 'fa-list' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-white/20 text-blue-600 dark:text-blue-400 shadow-lg'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    <i className={`fas ${tab.icon} mr-2 text-sm`}></i>
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Filter Controls */}
              {activeTab === 'comparison' && (
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
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-6">
              
              {/* Product Cards Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {compareItems.map((product) => (
                  <div key={product.id} className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
                    
                    {/* Product Image */}
                    <div className="relative h-48 bg-gray-100 dark:bg-gray-800">
                      <img
                        src={product.images?.[0] || product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleRemoveItem(product.id)}
                        className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                        title="Remove from comparison"
                      >
                        <i className="fas fa-times text-sm"></i>
                      </button>
                      
                      {/* Wishlist indicator */}
                      {isInWishlist(product.id) && (
                        <div className="absolute top-3 left-3 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                          <i className="fas fa-heart text-white text-sm"></i>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4 space-y-4">
                      <div>
                        <Link
                          to={`/product/${product.slug || product.id}`}
                          className="font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2"
                        >
                          {product.name}
                        </Link>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {product.brand}
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          {formatCurrency(product.price)}
                        </div>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <div className="text-sm text-gray-500 line-through">
                            {formatCurrency(product.originalPrice)}
                          </div>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="flex items-center justify-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <i
                              key={i}
                              className={`fas fa-star text-sm ${
                                i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          ({product.reviewCount})
                        </span>
                      </div>

                      {/* Actions */}
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

              {/* Detailed Comparison Table */}
              {activeTab === 'comparison' && visibleAttributes.length > 0 && (
                <div className="bg-white/5 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl overflow-hidden">
                  <div className="p-4 bg-white/10 border-b border-white/20">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Detailed Comparison
                    </h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">
                            Attribute
                          </th>
                          {compareItems.map((product) => (
                            <th key={product.id} className="text-center p-4 font-semibold text-gray-900 dark:text-white min-w-48">
                              {product.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {visibleAttributes.map((attribute) => (
                          <tr key={attribute.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-medium text-gray-900 dark:text-white">
                              <div className="flex items-center">
                                <i className={`${attribute.icon} mr-3 text-gray-500`}></i>
                                {attribute.label}
                              </div>
                            </td>
                            {compareItems.map((product) => (
                              <td key={product.id} className="p-4 text-center">
                                {renderAttributeValue(product, attribute)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Custom Styles */}
      </div>
    </div>
  );
};

export default CompareModal;
