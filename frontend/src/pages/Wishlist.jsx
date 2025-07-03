// src/pages/Wishlist.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { toast } from 'react-toastify';

const Wishlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, error } = useSelector((state) => state.wishlist);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [isRemoving, setIsRemoving] = useState(null);
  const [animateElements, setAnimateElements] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedItems, setSelectedItems] = useState([]);

  // Trigger animations
  useEffect(() => {
    setAnimateElements(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/wishlist');
      return;
    }
    if (user) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, user, isAuthenticated, navigate]);

  const calculateDiscountPrice = (price, discountPercentage) => {
    if (discountPercentage && discountPercentage > 0) {
      return price - (price * discountPercentage / 100);
    }
    return null;
  };

  const handleRemoveFromWishlist = async (productId) => {
    setIsRemoving(productId);
    try {
      await dispatch(removeFromWishlist(productId)).unwrap();
      toast.success("💔 Item removed from wishlist");
    } catch (err) {
      toast.error(typeof err === 'string' ? err : "Failed to remove item from wishlist");
    } finally {
      setIsRemoving(null);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await dispatch(addToCart({ 
        productId: product._id, 
        quantity: 1,
        name: product.name,
        price: product.price,
        image: product.images && product.images.length > 0 ? product.images[0] : null
      })).unwrap();
      toast.success(`🛒 ${product.name} added to cart!`);
    } catch (err) {
      toast.error(typeof err === 'string' ? err : "Failed to add item to cart");
    }
  };

  const handleBulkAddToCart = async () => {
    const availableItems = selectedItems.filter(id => {
      const item = wishlistItems.find(item => item._id === id);
      return item && item.countInStock > 0;
    });

    if (availableItems.length === 0) {
      toast.warning("No available items selected");
      return;
    }

    try {
      for (const itemId of availableItems) {
        const item = wishlistItems.find(item => item._id === itemId);
        await dispatch(addToCart({
          productId: item._id,
          quantity: 1,
          name: item.name,
          price: item.price,
          image: item.images?.[0]
        })).unwrap();
      }
      toast.success(`🎉 ${availableItems.length} items added to cart!`);
      setSelectedItems([]);
    } catch (err) {
      toast.error("Failed to add items to cart");
    }
  };

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectAllItems = () => {
    if (selectedItems.length === wishlistItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlistItems.map(item => item._id));
    }
  };

  // Enhanced loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex justify-center items-center h-96">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-12 text-center shadow-2xl">
            <div className="w-16 h-16 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              <i className="fas fa-heart mr-2 text-pink-500"></i>
              Loading Your Wishlist
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Gathering your favorite items...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-500/20 backdrop-blur-xl border border-red-300/50 rounded-3xl p-12 text-center shadow-2xl max-w-md">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-exclamation-triangle text-white text-2xl"></i>
          </div>
          <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
            Failed to Load Wishlist
          </h3>
          <p className="text-red-500 dark:text-red-300 mb-6">{error || 'Something went wrong'}</p>
          <button
            onClick={() => dispatch(fetchWishlist())}
            className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200"
          >
            <i className="fas fa-redo mr-2"></i>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const wishlistItems = Array.isArray(items) ? items : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-pink-400/20 rounded-full animate-float"
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
                
                <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-red-600 to-rose-600 bg-clip-text text-transparent mb-2">
                  <i className="fas fa-heart mr-3"></i>
                  Your Wishlist
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  <i className="fas fa-sparkles mr-2"></i>
                  Save your favorite items for later
                </p>
              </div>
              
              {wishlistItems.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  <div className="bg-pink-500/20 backdrop-blur-lg border border-pink-300/50 rounded-2xl px-4 py-2 text-pink-800 dark:text-pink-200">
                    <i className="fas fa-heart mr-2"></i>
                    {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
                  </div>
                  
                  {selectedItems.length > 0 && (
                    <button
                      onClick={handleBulkAddToCart}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-2xl transition-all duration-200"
                    >
                      <i className="fas fa-cart-plus mr-2"></i>
                      Add Selected to Cart ({selectedItems.length})
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          /* Enhanced Empty State */
          <div className={`text-center py-16 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-12 shadow-2xl max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl animate-pulse">
                <i className="fas fa-heart text-4xl text-white"></i>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Your Wishlist is Empty
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg leading-relaxed">
                Start adding items you love to your wishlist. 
                It's a great way to keep track of products you want to buy later!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/products">
                  <button className="bg-gradient-to-r from-pink-600 via-red-600 to-rose-600 hover:from-pink-700 hover:via-red-700 hover:to-rose-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-2xl">
                    <i className="fas fa-search mr-3"></i>
                    Discover Products
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
          <>
            {/* Controls Bar */}
            <div className={`mb-8 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  
                  {/* Selection Controls */}
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={selectAllItems}
                      className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <div className={`w-5 h-5 rounded border-2 border-current flex items-center justify-center ${
                        selectedItems.length === wishlistItems.length ? 'bg-blue-600 border-blue-600' : ''
                      }`}>
                        {selectedItems.length === wishlistItems.length && (
                          <i className="fas fa-check text-white text-xs"></i>
                        )}
                      </div>
                      <span className="font-medium">
                        {selectedItems.length === wishlistItems.length ? 'Deselect All' : 'Select All'}
                      </span>
                    </button>
                    
                    {selectedItems.length > 0 && (
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedItems.length} selected
                      </span>
                    )}
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex items-center space-x-4">
                    <div className="flex bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-xl transition-all duration-200 ${
                          viewMode === 'grid' 
                            ? 'bg-pink-600 text-white' 
                            : 'text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400'
                        }`}
                      >
                        <i className="fas fa-th-large"></i>
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-xl transition-all duration-200 ${
                          viewMode === 'list' 
                            ? 'bg-pink-600 text-white' 
                            : 'text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400'
                        }`}
                      >
                        <i className="fas fa-list"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Wishlist Items */}
            <div className={`${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {wishlistItems.map((item, index) => {
                  const salePrice = calculateDiscountPrice(item.price, item.discountPercentage);
                  const isSelected = selectedItems.includes(item._id);
                  
                  return (
                    <div
                      key={item._id}
                      className={`group bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden shadow-2xl hover:scale-105 transition-all duration-500 ${
                        viewMode === 'list' ? 'flex flex-col md:flex-row' : ''
                      } ${animateElements ? 'animate-fade-in-scale' : 'opacity-0'}`}
                      style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                    >
                      
                      {/* Image Section */}
                      <div className={`relative overflow-hidden ${viewMode === 'list' ? 'md:w-64 h-48 md:h-full' : 'h-64'}`}>
                        {/* Selection Checkbox */}
                        <div className="absolute top-4 left-4 z-10">
                          <button
                            onClick={() => toggleItemSelection(item._id)}
                            className={`w-6 h-6 rounded border-2 border-white/50 flex items-center justify-center transition-all duration-200 ${
                              isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white/20 backdrop-blur-lg'
                            }`}
                          >
                            {isSelected && <i className="fas fa-check text-white text-xs"></i>}
                          </button>
                        </div>

                        <Link to={`/products/${item._id}`}>
                          <img 
                            src={item.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop'} 
                            alt={item.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          
                          {/* Enhanced Badges */}
                          <div className="absolute top-4 right-4 flex flex-col space-y-2">
                            {item.discountPercentage > 0 && (
                              <div className="bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                                <i className="fas fa-percentage mr-1"></i>
                                {item.discountPercentage}% OFF
                              </div>
                            )}
                            {item.isNew && (
                              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                                <i className="fas fa-sparkles mr-1"></i>
                                NEW
                              </div>
                            )}
                          </div>
                        </Link>

                        {/* Remove Button */}
                        <button 
                          onClick={() => handleRemoveFromWishlist(item._id)}
                          disabled={isRemoving === item._id}
                          className="absolute bottom-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 group"
                          title="Remove from wishlist"
                        >
                          {isRemoving === item._id ? (
                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <i className="fas fa-trash group-hover:animate-bounce"></i>
                          )}
                        </button>

                        {/* Quick View on Hover */}
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Link
                            to={`/products/${item._id}`}
                            className="bg-white/20 backdrop-blur-lg border border-white/30 text-white font-semibold py-2 px-4 rounded-2xl hover:bg-white/30 transition-all duration-200"
                          >
                            <i className="fas fa-eye mr-2"></i>
                            Quick View
                          </Link>
                        </div>
                      </div>
                      
                      {/* Content Section */}
                      <div className={`p-6 flex-1 flex flex-col ${viewMode === 'list' ? 'justify-between' : ''}`}>
                        {/* Brand */}
                        {item.brand && (
                          <div className="flex items-center mb-2">
                            <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full mr-2"></div>
                            <span className="text-xs font-semibold text-pink-600 dark:text-pink-400 uppercase tracking-wider">
                              {item.brand}
                            </span>
                          </div>
                        )}

                        {/* Product Name */}
                        <Link to={`/products/${item._id}`}>
                          <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white hover:text-pink-600 dark:hover:text-pink-400 transition-colors duration-200 line-clamp-2 leading-tight">
                            {item.name}
                          </h3>
                        </Link>
                        
                        {/* Enhanced Price Display */}
                        <div className="mb-6">
                          {salePrice ? (
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-2xl font-black bg-gradient-to-r from-pink-600 via-red-600 to-rose-600 bg-clip-text text-transparent">
                                ${salePrice.toFixed(2)}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                ${item.price.toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-2xl font-black bg-gradient-to-r from-pink-600 via-red-600 to-rose-600 bg-clip-text text-transparent">
                              ${item.price.toFixed(2)}
                            </span>
                          )}
                          
                          {/* Savings Badge */}
                          {salePrice && (
                            <div className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full inline-block">
                              <i className="fas fa-piggy-bank mr-1"></i>
                              Save ${(item.price - salePrice).toFixed(2)}
                            </div>
                          )}
                        </div>
                        
                        {/* Stock Status */}
                        <div className="mb-4">
                          <div className={`flex items-center text-sm font-semibold ${
                            item.countInStock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              item.countInStock > 0 ? 'bg-green-400' : 'bg-red-400'
                            }`}></div>
                            {item.countInStock > 0 ? `${item.countInStock} in stock` : 'Out of Stock'}
                          </div>
                        </div>
                        
                        {/* Enhanced Action Buttons */}
                        <div className="space-y-3 mt-auto">
                          <button 
                            onClick={() => handleAddToCart(item)}
                            disabled={item.countInStock === 0}
                            className={`w-full flex items-center justify-center py-3 px-4 rounded-2xl font-semibold transition-all duration-200 ${
                              item.countInStock === 0 
                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:scale-105 active:scale-95'
                            }`}
                          >
                            <i className={`fas ${item.countInStock === 0 ? 'fa-times' : 'fa-cart-plus'} mr-2`}></i>
                            {item.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                          </button>
                          
                          <div className="flex space-x-2">
                            <Link 
                              to={`/products/${item._id}`}
                              className="flex-1 text-center py-2 px-4 bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 dark:text-white rounded-2xl hover:bg-white/30 transition-all duration-200 font-semibold"
                            >
                              <i className="fas fa-eye mr-2"></i>
                              View Details
                            </Link>
                            <button className="flex-1 text-center py-2 px-4 bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 dark:text-white rounded-2xl hover:bg-white/30 transition-all duration-200 font-semibold">
                              <i className="fas fa-share mr-2"></i>
                              Share
                            </button>
                          </div>
                        </div>

                        {/* Product Features */}
                        <div className="mt-4 pt-4 border-t border-white/10 dark:border-gray-700/20">
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                              <i className="fas fa-shipping-fast mr-1 text-blue-500"></i>
                              <span>Free Ship</span>
                            </div>
                            <div className="flex items-center">
                              <i className="fas fa-undo mr-1 text-green-500"></i>
                              <span>Returns</span>
                            </div>
                            <div className="flex items-center">
                              <i className="fas fa-shield-alt mr-1 text-purple-500"></i>
                              <span>Warranty</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Continue Shopping CTA */}
            <div className={`mt-12 text-center ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  <i className="fas fa-search mr-3 text-blue-500"></i>
                  Looking for More?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Discover more amazing products from our curated collection
                </p>
                <Link to="/products">
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-2xl transition-all duration-200 transform hover:scale-105">
                    <i className="fas fa-store mr-2"></i>
                    Continue Shopping
                  </button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(-5px) rotate(-1deg); }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-scale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animate-fade-in-scale {
          animation: fade-in-scale 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Wishlist;
