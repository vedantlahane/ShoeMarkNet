import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CategoriesSection = ({ className = '' }) => {
  const [animateElements, setAnimateElements] = useState(false);

  const categories = [
    {
      id: 1,
      name: 'Running Shoes',
      slug: 'running-shoes',
      icon: 'fas fa-running',
      color: 'from-blue-500 to-cyan-500',
      count: 156,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop'
    },
    {
      id: 2,
      name: 'Basketball',
      slug: 'basketball',
      icon: 'fas fa-basketball-ball',
      color: 'from-orange-500 to-red-500',
      count: 134,
      image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=400&auto=format&fit=crop'
    },
    {
      id: 3,
      name: 'Casual',
      slug: 'casual',
      icon: 'fas fa-walking',
      color: 'from-green-500 to-emerald-500',
      count: 198,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=400&auto=format&fit=crop'
    },
    {
      id: 4,
      name: 'Formal',
      slug: 'formal',
      icon: 'fas fa-user-tie',
      color: 'from-purple-500 to-pink-500',
      count: 87,
      image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=400&auto=format&fit=crop'
    }
  ];

  useEffect(() => {
    setTimeout(() => setAnimateElements(true), 100);
  }, []);

  return (
    <section className={`py-16 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 ${className}`}>
      <div className="container mx-auto px-4">
        <div className={`text-center mb-12 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Shop by Category
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Discover our extensive collection of premium footwear organized by category
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className={`group ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-80`} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <i className={`${category.icon} text-white text-4xl mb-4`}></i>
                  </div>
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {category.count} products
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
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
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default CategoriesSection;
