// src/pages/Category.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProducts } from '../redux/slices/productSlice';
import ProductCard from '../components/ProductCard';

const Category = () => {
  const { categoryName } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, loading, error } = useSelector((state) => state.product);
  
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    dispatch(fetchProducts({ category: categoryName }));
  }, [dispatch, categoryName]);

  // Ensure products is always an array
  const productsList = Array.isArray(products) ? products : [];

  // Sort and filter products
  const processedProducts = productsList
    .filter(product => {
      if (filterBy === 'all') return true;
      if (filterBy === 'sale') return product.discountPercentage > 0;
      if (filterBy === 'new') return product.isNew;
      if (filterBy === 'popular') return product.rating >= 4.5;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
        default:
          return (a.name || '').localeCompare(b.name || '');
      }
    });

  // Category icon mapping
  const getCategoryIcon = (category) => {
    const iconMap = {
      'electronics': 'fa-laptop',
      'fashion': 'fa-tshirt',
      'home': 'fa-home',
      'beauty': 'fa-spa',
      'sports': 'fa-running',
      'books': 'fa-book',
      'toys': 'fa-gamepad',
      'automotive': 'fa-car',
      'health': 'fa-heartbeat',
      'jewelry': 'fa-gem',
      'shoes': 'fa-shoe-prints',
      'bags': 'fa-shopping-bag'
    };
    return iconMap[category?.toLowerCase()] || 'fa-box';
  };

  // Category color mapping
  const getCategoryColor = (category) => {
    const colorMap = {
      'electronics': 'from-blue-500 to-cyan-500',
      'fashion': 'from-pink-500 to-rose-500',
      'home': 'from-green-500 to-emerald-500',
      'beauty': 'from-purple-500 to-violet-500',
      'sports': 'from-orange-500 to-red-500',
      'books': 'from-indigo-500 to-purple-500',
      'toys': 'from-yellow-500 to-orange-500',
      'automotive': 'from-gray-500 to-slate-500',
      'health': 'from-green-400 to-teal-500',
      'jewelry': 'from-yellow-400 to-amber-500',
      'shoes': 'from-brown-500 to-amber-600',
      'bags': 'from-purple-600 to-pink-600'
    };
    return colorMap[category?.toLowerCase()] || 'from-blue-500 to-purple-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      
      {/* Enhanced Header Section */}
      <section className="pt-24 pb-12 relative overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${4 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            {/* Breadcrumb Navigation */}
            <div className="mb-6">
              <nav className="flex justify-center items-center space-x-2 text-blue-200">
                <button 
                  onClick={() => navigate('/')}
                  className="hover:text-white transition-colors duration-200"
                >
                  <i className="fas fa-home mr-1"></i>Home
                </button>
                <i className="fas fa-chevron-right text-xs"></i>
                <span className="text-white font-medium">Categories</span>
                <i className="fas fa-chevron-right text-xs"></i>
                <span className="text-yellow-300 font-semibold">{categoryName}</span>
              </nav>
            </div>

            {/* Category Icon and Title */}
            <div className="mb-8">
              <div className={`inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r ${getCategoryColor(categoryName)} rounded-3xl shadow-2xl mb-6`}>
                <i className={`fas ${getCategoryIcon(categoryName)} text-4xl text-white`}></i>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4">
                {categoryName} <span className="text-yellow-300">Collection</span>
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                <i className="fas fa-search mr-2"></i>
                Discover premium {categoryName?.toLowerCase()} products with exclusive deals
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
                <div className="text-2xl font-bold text-white">{productsList.length}</div>
                <div className="text-sm text-blue-100">Products</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
                <div className="text-2xl font-bold text-white">
                  <i className="fas fa-percentage text-green-300"></i>
                </div>
                <div className="text-sm text-blue-100">On Sale</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
                <div className="text-2xl font-bold text-white">
                  <i className="fas fa-shipping-fast text-yellow-300"></i>
                </div>
                <div className="text-sm text-blue-100">Free Ship</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Controls Section */}
      <section className="py-8 bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg border-y border-white/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            
            {/* Filter and Sort Controls */}
            <div className="flex flex-wrap items-center gap-4">
              
              {/* Filter Dropdown */}
              <div className="relative">
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl px-6 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none pr-12"
                >
                  <option value="all" className="bg-gray-800 text-white">All Products</option>
                  <option value="sale" className="bg-gray-800 text-white">On Sale</option>
                  <option value="new" className="bg-gray-800 text-white">New Arrivals</option>
                  <option value="popular" className="bg-gray-800 text-white">Popular</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <i className="fas fa-chevron-down text-gray-600 dark:text-gray-400"></i>
                </div>
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl px-6 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none pr-12"
                >
                  <option value="name" className="bg-gray-800 text-white">Sort by Name</option>
                  <option value="price-low" className="bg-gray-800 text-white">Price: Low to High</option>
                  <option value="price-high" className="bg-gray-800 text-white">Price: High to Low</option>
                  <option value="rating" className="bg-gray-800 text-white">Highest Rated</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <i className="fas fa-chevron-down text-gray-600 dark:text-gray-400"></i>
                </div>
              </div>
            </div>

            {/* View Mode and Results Count */}
            <div className="flex items-center gap-4">
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                <i className="fas fa-box mr-2"></i>
                Showing {processedProducts.length} of {productsList.length} products
              </span>
              
              {/* View Mode Toggle */}
              <div className="flex bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  <i className="fas fa-th-large"></i>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  <i className="fas fa-list"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          
          {/* Error State */}
          {error && (
            <div className="text-center py-16">
              <div className="bg-red-500/20 backdrop-blur-lg border border-red-300/50 rounded-3xl p-8 max-w-md mx-auto">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-exclamation-triangle text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
                  Error Loading Products
                </h3>
                <p className="text-red-500 dark:text-red-300 mb-6">{error}</p>
                <button
                  onClick={() => dispatch(fetchProducts({ category: categoryName }))}
                  className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200"
                >
                  <i className="fas fa-redo mr-2"></i>
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className={`grid gap-8 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden animate-pulse">
                  <div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full w-3/4"></div>
                    <div className="h-6 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 rounded-full w-1/2"></div>
                    <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Products Grid/List */}
          {!loading && !error && (
            <>
              {processedProducts.length === 0 ? (
                /* Enhanced Empty State */
                <div className="text-center py-20">
                  <div className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-3xl p-12 max-w-lg mx-auto">
                    <div className={`w-24 h-24 bg-gradient-to-r ${getCategoryColor(categoryName)} rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse`}>
                      <i className={`fas ${getCategoryIcon(categoryName)} text-4xl text-white`}></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      No Products Found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                      We couldn't find any {categoryName?.toLowerCase()} products matching your criteria.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={() => {
                          setSortBy('name');
                          setFilterBy('all');
                        }}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200"
                      >
                        <i className="fas fa-undo mr-2"></i>
                        Reset Filters
                      </button>
                      <button
                        onClick={() => navigate('/')}
                        className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 text-gray-900 dark:text-white font-bold py-3 px-6 rounded-2xl hover:bg-white/20 transition-all duration-200"
                      >
                        <i className="fas fa-home mr-2"></i>
                        Browse All
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`grid gap-8 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1 max-w-4xl mx-auto'
                }`}>
                  {processedProducts.map((product, index) => (
                    <div
                      key={product._id || index}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <ProductCard 
                        product={product} 
                        viewMode={viewMode}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Load More Button (if pagination needed) */}
          {!loading && !error && processedProducts.length > 0 && (
            <div className="text-center mt-16">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 transform hover:scale-105">
                <i className="fas fa-plus mr-2"></i>
                Load More Products
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-2xl transition-all duration-200 transform hover:scale-110 z-50"
        aria-label="Back to top"
      >
        <i className="fas fa-chevron-up"></i>
      </button>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(-5px) rotate(-1deg); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
        
        select option {
          background-color: #1f2937;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default Category;
