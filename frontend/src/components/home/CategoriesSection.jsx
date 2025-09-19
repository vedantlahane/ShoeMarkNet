import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CategoriesSection = () => {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [visibleCategories, setVisibleCategories] = useState([]);

  const categories = [
    {
      id: 1,
      name: 'Running Shoes',
      slug: 'running-shoes',
      count: 156,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop',
      color: 'from-orange-400 to-red-500',
      icon: 'fas fa-running',
      description: 'Performance & Comfort',
      badge: 'Trending'
    },
    {
      id: 2,
      name: 'Basketball',
      slug: 'basketball',
      count: 134,
      image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=400&auto=format&fit=crop',
      color: 'from-purple-400 to-pink-500',
      icon: 'fas fa-basketball-ball',
      description: 'Court Dominance',
      badge: 'Pro Series'
    },
    {
      id: 3,
      name: 'Casual',
      slug: 'casual',
      count: 198,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=400&auto=format&fit=crop',
      color: 'from-green-400 to-blue-500',
      icon: 'fas fa-shoe-prints',
      description: 'Style & Comfort',
      badge: 'Popular'
    },
    {
      id: 4,
      name: 'Formal',
      slug: 'formal',
      count: 87,
      image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=400&auto=format&fit=crop',
      color: 'from-gray-600 to-gray-800',
      icon: 'fas fa-tie',
      description: 'Elegance & Class',
      badge: 'Premium'
    }
  ];

  useEffect(() => {
    // Stagger animation for categories
    categories.forEach((_, index) => {
      setTimeout(() => {
        setVisibleCategories(prev => [...prev, index]);
      }, index * 200);
    });
  }, []);

  return (
    <section id="categories" className="py-20 bg-gray-50 dark:bg-gray-800 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="text-center mb-16 reveal">
          <div className="inline-flex items-center space-x-2 glass bg-purple-100/50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full px-6 py-3 mb-6">
            <i className="fas fa-th-large animate-pulse"></i>
            <span className="text-sm font-medium">Shop by Style</span>
          </div>

          <h2 className="text-4xl lg:text-6xl font-heading font-bold mb-6 text-gray-900 dark:text-white">
            Explore <span className="text-gradient">Categories</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            <i className="fas fa-compass mr-2"></i>Find the perfect footwear for every occasion and activity
            in our diverse collection of premium brands
          </p>
        </div>

        {/* Enhanced Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className={`group relative block overflow-hidden rounded-3xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 reveal ${
                visibleCategories.includes(index)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              {/* Glassmorphism Card */}
              <div className="glass rounded-3xl overflow-hidden h-full">
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                  {/* Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30">
                      {category.badge}
                    </span>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-600/80 to-purple-600/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Content Section */}
                <div className="relative p-6">
                  {/* Icon */}
                  <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <i className={`${category.icon} text-white text-xl`}></i>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {category.name}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 font-medium">
                    {category.description}
                  </p>

                  {/* Count & CTA */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      {category.count} products
                    </span>
                    <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-1 transition-transform duration-300">
                      <span className="text-sm">Explore</span>
                      <i className="fas fa-arrow-right ml-2"></i>
                    </div>
                  </div>
                </div>

                {/* Animated Border */}
                <div className={`absolute inset-0 rounded-3xl border-2 border-gradient-to-r from-blue-500/50 to-purple-500/50 transition-all duration-300 ${
                  hoveredCategory === category.id ? 'border-blue-500/80 scale-105' : 'border-transparent'
                }`}></div>

                {/* Floating Elements */}
                {hoveredCategory === category.id && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                    <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                    <div className="absolute bottom-4 left-4 w-1 h-1 bg-purple-400 rounded-full animate-ping delay-300"></div>
                    <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white/60 rounded-full animate-ping delay-700"></div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Enhanced Bottom CTA */}
        <div className="text-center mt-16 reveal">
          <div className="glass bg-white/50 dark:bg-gray-900/50 rounded-2xl p-8 max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <i className="fas fa-search text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Can't find what you're looking for?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Explore our complete collection of premium footwear from top brands worldwide
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl transition-all duration-300 font-semibold text-lg hover:shadow-xl hover:shadow-blue-500/25 micro-bounce"
            >
              <i className="fas fa-th-large"></i>
              Browse All Products
              <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform duration-300"></i>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
