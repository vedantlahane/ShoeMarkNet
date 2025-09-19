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
      icon: 'fas fa-running'
    },
    {
      id: 2,
      name: 'Basketball',
      slug: 'basketball',
      count: 134,
      image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=400&auto=format&fit=crop',
      color: 'from-purple-400 to-pink-500',
      icon: 'fas fa-basketball-ball'
    },
    {
      id: 3,
      name: 'Casual',
      slug: 'casual',
      count: 198,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=400&auto=format&fit=crop',
      color: 'from-green-400 to-blue-500',
      icon: 'fas fa-shoe-prints'
    },
    {
      id: 4,
      name: 'Formal',
      slug: 'formal',
      count: 87,
      image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=400&auto=format&fit=crop',
      color: 'from-gray-600 to-gray-800',
      icon: 'fas fa-tie'
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
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 right-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-purple-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <i className="fas fa-th-large text-purple-600"></i>
            Shop by Style
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Explore Categories
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Find the perfect footwear for every occasion and activity in our diverse collection
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full mt-6"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className={`group relative block overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                visibleCategories.includes(index)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-90 group-hover:opacity-100 transition-opacity duration-300`}></div>

              {/* Image Overlay */}
              <div className="relative h-64 overflow-hidden rounded-t-3xl">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
              </div>

              {/* Content */}
              <div className="relative p-6 text-white">
                {/* Icon */}
                <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full mb-4 group-hover:bg-white/30 transition-colors duration-300">
                  <i className={`${category.icon} text-xl`}></i>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-200 transition-colors duration-300">
                  {category.name}
                </h3>

                {/* Count */}
                <p className="text-white/80 text-sm mb-4">
                  {category.count} products available
                </p>

                {/* CTA */}
                <div className="flex items-center text-sm font-medium group-hover:text-yellow-200 transition-colors duration-300">
                  <span>Shop Now</span>
                  <i className="fas fa-arrow-right ml-2 transform group-hover:translate-x-1 transition-transform duration-300"></i>
                </div>
              </div>

              {/* Hover Effect Border */}
              <div className={`absolute inset-0 rounded-3xl border-2 border-white/30 transition-all duration-300 ${
                hoveredCategory === category.id ? 'border-white/60 scale-105' : ''
              }`}></div>

              {/* Floating Particles Effect */}
              {hoveredCategory === category.id && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-4 right-4 w-2 h-2 bg-white/60 rounded-full animate-ping"></div>
                  <div className="absolute bottom-4 left-4 w-1 h-1 bg-white/40 rounded-full animate-ping delay-300"></div>
                  <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white/50 rounded-full animate-ping delay-700"></div>
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-6">Can't find what you're looking for?</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl hover:bg-gray-800 transition-all duration-300 font-semibold text-lg hover:shadow-xl"
          >
            <i className="fas fa-search"></i>
            Browse All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
