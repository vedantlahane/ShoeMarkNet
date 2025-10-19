import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Grid3X3,
  TrendingUp,
  Sparkles,
  Star,
  ArrowRight,
  ShoppingBag,
  Activity,
  Zap,
  Heart
} from 'lucide-react';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

const DEFAULT_CATEGORIES = [
  {
    id: 'running',
    name: 'Running',
    slug: 'running',
    count: 156,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop',
    color: 'from-orange-500 to-red-500',
    icon: Activity,
    description: 'Performance meets innovation',
    badge: 'Most Popular',
    trending: true
  },
  {
    id: 'basketball',
    name: 'Basketball',
    slug: 'basketball',
    count: 134,
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=600&auto=format&fit=crop',
    color: 'from-purple-500 to-pink-500',
    icon: Zap,
    description: 'Court-ready style and grip',
    badge: 'Pro Choice',
    trending: true
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    slug: 'lifestyle',
    count: 203,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=600&auto=format&fit=crop',
    color: 'from-blue-500 to-cyan-500',
    icon: Heart,
    description: 'Street style essentials',
    badge: 'Trending',
    trending: false
  }
];

const CategoriesSection = ({ categories: propCategories = [] }) => {
  const [visibleCategories, setVisibleCategories] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const enableAnimations = !prefersReducedMotion;
  const gridRef = useRef(null);

  const categories = useMemo(() => {
    if (Array.isArray(propCategories) && propCategories.length > 0) {
      return propCategories.map((cat, index) => ({
        ...DEFAULT_CATEGORIES[index % DEFAULT_CATEGORIES.length],
        ...cat,
        icon: cat.icon || DEFAULT_CATEGORIES[index % DEFAULT_CATEGORIES.length].icon
      }));
    }
    return DEFAULT_CATEGORIES;
  }, [propCategories]);

  useEffect(() => {
    if (!enableAnimations) {
      setVisibleCategories(categories.map((_, index) => index));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const timeouts = [];
            categories.forEach((_, index) => {
              const timeout = setTimeout(() => {
                setVisibleCategories((prev) => 
                  prev.includes(index) ? prev : [...prev, index]
                );
              }, index * 100);
              timeouts.push(timeout);
            });

            return () => timeouts.forEach(clearTimeout);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (gridRef.current) {
      observer.observe(gridRef.current);
    }

    return () => observer.disconnect();
  }, [categories, enableAnimations]);

  const handleCardPointerMove = useCallback((event) => {
    if (!enableAnimations) return;

    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--hover-x', `${x}%`);
    card.style.setProperty('--hover-y', `${y}%`);
  }, [enableAnimations]);

  const handleCardLeave = useCallback((event) => {
    setHoveredCategory(null);
    const card = event.currentTarget;
    card.style.removeProperty('--hover-x');
    card.style.removeProperty('--hover-y');
  }, []);

  return (
    <section 
      id="categories" 
      className="py-20 md:py-24 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 relative overflow-hidden"
      aria-label="Product categories"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className={`absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl ${enableAnimations ? 'animate-pulse' : ''}`} />
        <div className={`absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-full blur-3xl ${enableAnimations ? 'animate-pulse' : ''}`} style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100/80 to-blue-100/80 dark:from-purple-900/30 dark:to-blue-900/30 text-purple-600 dark:text-purple-400 rounded-full px-6 py-3 mb-6 backdrop-blur-sm">
            <Grid3X3 size={18} className={enableAnimations ? 'animate-pulse' : ''} aria-hidden="true" />
            <span className="text-sm font-semibold tracking-wide uppercase">Shop by Category</span>
            <Sparkles size={14} className={enableAnimations ? 'animate-pulse' : ''} aria-hidden="true" />
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Find Your Perfect{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Style
            </span>
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore our curated collection of premium footwear across all categories
          </p>
        </div>

        {/* Categories Grid */}
        <div 
          ref={gridRef}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            const isVisible = visibleCategories.includes(index);
            
            return (
              <Link
                key={category.id}
                to={`/products?category=${category.slug}`}
                className={`group relative block overflow-hidden rounded-3xl transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-blue-500/30 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                } ${hoveredCategory === category.id ? 'scale-105 shadow-2xl' : 'shadow-lg hover:shadow-xl'}`}
                style={{ transitionDelay: `${index * 80}ms` }}
                onPointerMove={handleCardPointerMove}
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={handleCardLeave}
                onFocus={() => setHoveredCategory(category.id)}
                onBlur={handleCardLeave}
              >
                {/* Pointer gradient highlight */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
                  style={{
                    background: 'radial-gradient(220px circle at var(--hover-x, 50%) var(--hover-y, 50%), rgba(59,130,246,0.2), transparent 65%)',
                  }}
                  aria-hidden="true"
                />

                {/* Card Container */}
                <div className="relative h-full bg-white dark:bg-gray-800 rounded-3xl overflow-hidden">
                  {/* Image Section */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={category.image}
                      alt={`${category.name} category`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                    {/* Badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`bg-gradient-to-r ${category.color} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg`}>
                        {category.badge}
                      </span>
                    </div>

                    {/* Count */}
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-gray-900 dark:text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                      {category.count} items
                    </div>

                    {/* Trending Indicator */}
                    {category.trending && (
                      <div className="absolute bottom-4 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                        <TrendingUp size={12} />
                        <span>Trending</span>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-purple-600/90 to-pink-600/90 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                      <div className="text-white text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <ShoppingBag size={32} className="mx-auto mb-2" />
                        <p className="text-lg font-bold">Shop Now</p>
                        <p className="text-sm opacity-90">{category.count} Products</p>
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {category.description}
                        </p>
                      </div>
                      <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                        <IconComponent size={20} className="text-white" />
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center justify-between pt-2">
                                            <div className="flex items-center gap-1">
                        <Star size={14} className="text-amber-400 fill-current" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">4.8</span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold text-sm group-hover:gap-2 transition-all duration-300">
                        <span>Explore</span>
                        <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
          >
            View All Products
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;