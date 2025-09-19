import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ProductCard from '../products/ProductCard';

const FeaturedProducts = ({ products, onAddToCart }) => {
  const { featuredLoading: loading } = useSelector(state => state.product);
  const [visibleProducts, setVisibleProducts] = useState([]);

  // Use passed products or fallback to empty array
  const displayProducts = products || [];

  useEffect(() => {
    if (displayProducts.length > 0) {
      // Stagger animation for products
      displayProducts.forEach((_, index) => {
        setTimeout(() => {
          setVisibleProducts(prev => [...prev, index]);
        }, index * 150);
      });
    }
  }, [displayProducts]);

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-2xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <i className="fas fa-star text-yellow-500"></i>
            Premium Collection
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Featured Products
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover our hand-picked selection of premium footwear, crafted for style, comfort, and performance
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mt-6"></div>
        </div>

        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayProducts.map((product, index) => (
              <div
                key={product._id || product.id}
                className={`transform transition-all duration-700 ${
                  visibleProducts.includes(index)
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <ProductCard
                  product={product}
                  onAddToCart={onAddToCart}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-box-open text-4xl text-gray-400"></i>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Products Available</h3>
            <p className="text-gray-600 mb-6">We're working on bringing you the best products. Check back soon!</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Refresh Page
            </button>
          </div>
        )}

        {/* Call to Action */}
        {displayProducts.length > 0 && (
          <div className="text-center mt-16">
            <div className="inline-block">
              <a
                href="/products"
                className="group bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 font-semibold text-lg inline-flex items-center gap-3"
              >
                View All Products
                <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform duration-300"></i>
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
