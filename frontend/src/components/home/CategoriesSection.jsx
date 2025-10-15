import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Grid3X3,
  TrendingUp,
  Sparkles,
  Star,
  ArrowRight,
  Eye,
  ShoppingBag,
  Zap,
  Activity,
  Users,
  Heart,
  Briefcase,
  Dumbbell
} from 'lucide-react';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

const DEFAULT_CATEGORIES = [
  {
    id: 'running-shoes',
    name: 'Running Shoes',
    slug: 'running-shoes',
    count: 156,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop',
    color: 'from-orange-400 to-red-500',
    lucideIcon: Activity,
    description: 'Performance & Comfort',
    badge: 'Trending',
    badgeColor: 'from-orange-500 to-red-500',
    features: ['Lightweight', 'Breathable', 'Durable'],
    stats: { avgRating: 4.8, sales: 1234, trending: true }
  },
  {
    id: 'basketball-shoes',
    name: 'Basketball Shoes',
    slug: 'basketball-shoes',
    count: 134,
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=400&auto=format&fit=crop',
    color: 'from-purple-400 to-pink-500',
    lucideIcon: Zap,
    description: 'Court Dominance',
    badge: 'Pro Series',
    badgeColor: 'from-purple-500 to-pink-500',
    features: ['High Tops', 'Ankle Support', 'Grip'],
    stats: { avgRating: 4.6, sales: 987, trending: false }
  },
  {
    id: 'lifestyle-sneakers',
    name: 'Lifestyle Sneakers',
    slug: 'lifestyle-sneakers',
    count: 203,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=400&auto=format&fit=crop',
    color: 'from-pink-400 to-rose-500',
    lucideIcon: Heart,
    description: 'Fashion Forward',
    badge: 'Exclusive',
    badgeColor: 'from-pink-500 to-rose-500',
    features: ['Designer', 'Limited Edition', 'Premium'],
    stats: { avgRating: 4.8, sales: 1123, trending: true }
  }
];

const CATEGORY_ICON_POOL = [Activity, Zap, Heart, Users, Briefcase, Dumbbell];
const CATEGORY_COLOR_GRADIENTS = [
  'from-blue-500 via-indigo-500 to-purple-500',
  'from-rose-500 via-pink-500 to-orange-500',
  'from-emerald-500 via-teal-500 to-cyan-500',
  'from-amber-500 via-yellow-500 to-lime-500',
  'from-purple-500 via-fuchsia-500 to-pink-600',
  'from-sky-500 via-blue-500 to-indigo-500'
];
const CATEGORY_BADGE_GRADIENTS = [
  'from-orange-500 to-red-500',
  'from-purple-500 to-pink-500',
  'from-emerald-500 to-teal-500',
  'from-blue-500 to-cyan-500',
  'from-rose-500 to-pink-500',
  'from-indigo-500 to-purple-500'
];
const CATEGORY_FEATURE_PRESETS = [
  ['Responsive cushioning', 'Breathable mesh', 'Lightweight build'],
  ['Court-ready grip', 'Ankle support', 'Shock absorption'],
  ['Limited releases', 'Premium materials', 'Street-ready style'],
  ['Eco-certified', 'Weather resistant', 'Trail traction'],
  ['Everyday comfort', 'Adaptive fit', 'Moisture control'],
  ['Performance foam', 'Stability tuned', 'Pro feedback'],
];

const categoryNumberFormatter = new Intl.NumberFormat('en-US');

const toSlug = (value, fallback) => {
  if (!value || typeof value !== 'string') return fallback;
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || fallback;
};

const buildCategoryCard = (category, index) => {
  const icon = category.lucideIcon || CATEGORY_ICON_POOL[index % CATEGORY_ICON_POOL.length];
  const colorGradient = category.color || CATEGORY_COLOR_GRADIENTS[index % CATEGORY_COLOR_GRADIENTS.length];
  const badgeGradient = category.badgeColor || CATEGORY_BADGE_GRADIENTS[index % CATEGORY_BADGE_GRADIENTS.length];
  const features = Array.isArray(category.features) && category.features.length > 0
    ? category.features
    : CATEGORY_FEATURE_PRESETS[index % CATEGORY_FEATURE_PRESETS.length];

  const count = typeof category.count === 'number'
    ? category.count
    : typeof category.productCount === 'number'
      ? category.productCount
      : 0;

  const avgRating = category?.stats?.avgRating
    || (4.4 + (index % 4) * 0.1).toFixed(1);
  const sales = category?.stats?.sales
    || Math.max(320, Math.round(count * 6.5));
  const trending = typeof category?.stats?.trending === 'boolean'
    ? category.stats.trending
    : index < 3;

  const badgeLabel = category.badge
    || (trending ? 'Trending' : 'Featured');

  const description = category.description
    || 'Discover curated selections and fan-favourite styles tailored to your passion.';

  const id = category.id || category._id || category.slug || `category-${index}`;
  const slug = category.slug || toSlug(category.name, `category-${index}`);

  return {
    ...category,
    id,
    slug,
    color: colorGradient,
    badgeColor: badgeGradient,
    features,
    lucideIcon: icon,
    description,
    count,
    stats: {
      avgRating: typeof avgRating === 'number' ? avgRating.toFixed(1) : avgRating,
      sales: categoryNumberFormatter.format(sales),
      trending,
    },
    image: category.image || '/api/placeholder/400/300',
    badge: badgeLabel,
  };
};

const CategoriesSection = ({ 
  categories: propCategories,
  showHeader = true,
  showStats = true,
  variant = 'premium', // premium, minimal, compact
  animateOnScroll = true,
  className = ''
}) => {
  const [visibleCategories, setVisibleCategories] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const enableReveal = animateOnScroll && !prefersReducedMotion;
  const gridRef = useRef(null);

  const categories = useMemo(() => {
    if (Array.isArray(propCategories) && propCategories.length > 0) {
      return propCategories.map((category, index) => buildCategoryCard(category, index));
    }
    return DEFAULT_CATEGORIES.map((category, index) => buildCategoryCard(category, index));
  }, [propCategories]);

  const statsSummary = useMemo(() => {
    if (!categories?.length) {
      return { totalProducts: 0, avgRating: 0, trendingCount: 0 };
    }

    const totalProducts = categories.reduce((total, cat) => total + (cat.count || 0), 0);
    const totalRating = categories.reduce(
      (total, cat) => total + (parseFloat(cat?.stats?.avgRating) || 0),
      0
    );
    const trendingCount = categories.reduce(
      (total, cat) => total + (cat?.stats?.trending ? 1 : 0),
      0
    );

    return {
      totalProducts,
      avgRating: Number((totalRating / categories.length).toFixed(1)),
      trendingCount
    };
  }, [categories]);

  useEffect(() => {
    if (!enableReveal) {
      setVisibleCategories(categories.map((_, index) => index));
      return;
    }

    setVisibleCategories([]);

    const element = gridRef.current;
    if (!element) {
      return;
    }

    const timeouts = [];
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry?.isIntersecting) {
        categories.forEach((_, index) => {
          const timeout = window.setTimeout(() => {
            setVisibleCategories((prev) => (prev.includes(index) ? prev : [...prev, index]));
          }, index * 120);
          timeouts.push(timeout);
        });
        observer.disconnect();
      }
    }, { threshold: 0.25 });

    observer.observe(element);

    return () => {
      observer.disconnect();
      timeouts.forEach(window.clearTimeout);
    };
  }, [categories, enableReveal]);

  const handleCardPointerMove = useCallback((event) => {
    if (prefersReducedMotion) {
      return;
    }

    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return;
    }

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    card.style.setProperty('--hover-x', `${x}%`);
    card.style.setProperty('--hover-y', `${y}%`);
  }, [prefersReducedMotion]);

  const handleCategoryHover = useCallback((categoryId) => {
    setHoveredCategory(categoryId);
  }, []);

  const handleCategoryLeave = useCallback((event) => {
    setHoveredCategory(null);
    const cardElement = event?.currentTarget;
    if (cardElement) {
      cardElement.style.removeProperty('--hover-x');
      cardElement.style.removeProperty('--hover-y');
    }
  }, []);

  const gridColumns = useMemo(() => {
    if (variant === 'compact') {
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
    if (variant === 'minimal') {
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
    }
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3';
  }, [variant]);

  return (
    <section 
      id="categories" 
      className={`py-16 md:py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 relative overflow-hidden ${className}`}
      aria-label="Product categories"
    >
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-cyan-400/10 to-teal-400/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative mx-auto w-full  px-4 sm:px-5 lg:px-6">
        {/* Enhanced Section Header */}
        {showHeader && (
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-3 glass bg-gradient-to-r from-purple-100/50 to-blue-100/50 dark:from-purple-900/30 dark:to-blue-900/30 text-purple-600 dark:text-purple-400 rounded-full px-8 py-4 mb-8 shadow-lg">
              <Grid3X3 size={20} className="animate-pulse" aria-hidden="true" />
              <span className="text-sm font-semibold tracking-wide">Shop by Style</span>
              <Sparkles size={16} className="animate-spin-slow" aria-hidden="true" />
            </div>

            <h2 className="text-4xl lg:text-7xl font-heading font-bold mb-6 text-gray-900 dark:text-white">
              Explore{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                Categories
              </span>
            </h2>
            
            <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              <Eye className="inline mr-2" size={20} aria-hidden="true" />
              Find the perfect footwear for every occasion and activity in our diverse collection of premium brands
            </p>

            {/* Stats Section */}
            {showStats && (
              <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
                <div className="glass px-4 py-2 rounded-full">
                  <span className="text-2xl font-bold text-blue-600 mr-2">{categories.length.toLocaleString()}</span>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Categories</span>
                </div>
                <div className="glass px-4 py-2 rounded-full">
                  <span className="text-2xl font-bold text-purple-600 mr-2">
                    {statsSummary.totalProducts.toLocaleString()}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Products</span>
                </div>
                <div className="glass px-4 py-2 rounded-full">
                  <span className="text-2xl font-bold text-pink-600 mr-2">{statsSummary.avgRating}</span>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Avg Rating</span>
                </div>
                <div className="glass px-4 py-2 rounded-full">
                  <span className="text-2xl font-bold text-orange-500 mr-2">{statsSummary.trendingCount}</span>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Trending Now</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Categories Grid */}
        <div 
          ref={gridRef}
          className={`grid gap-8 ${gridColumns}`}
          role="grid"
          aria-label="Product categories grid"
        >
          {categories.map((category, index) => {
            const IconComponent = category.lucideIcon;
            const isVisible = visibleCategories.includes(index);
            return (
              <Link
                key={category.id}
                to={`/categories/${category.slug}`}
                data-category-id={category.id}
                className={`group relative block overflow-hidden rounded-3xl transition-all duration-500 ease-out focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                } ${hoveredCategory === category.id ? 'shadow-2xl -translate-y-2' : 'shadow-lg'}`}
                style={{ transitionDelay: enableReveal ? `${index * 80}ms` : '0ms' }}
                onPointerMove={handleCardPointerMove}
                onMouseEnter={() => handleCategoryHover(category.id)}
                onMouseLeave={handleCategoryLeave}
                onFocus={() => handleCategoryHover(category.id)}
                onBlur={handleCategoryLeave}
                role="gridcell"
                aria-label={`${category.name} category with ${category.count} products`}
              >
                {/* Pointer gradient highlight */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300"
                  style={{
                    background:
                      'radial-gradient(220px circle at var(--hover-x, 50%) var(--hover-y, 50%), rgba(59,130,246,0.25), transparent 65%)',
                    mixBlendMode: 'screen'
                  }}
                  aria-hidden="true"
                />

                {/* Premium Glassmorphism Card */}
                <div className="card-premium rounded-3xl overflow-hidden h-full relative z-10">
                  
                  {/* Enhanced Image Section */}
                  <div className="relative h-64 lg:h-72 overflow-hidden">
                    <img
                      src={category.image}
                      alt={`${category.name} category`}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/400/300';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                    {/* Premium Badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`bg-gradient-to-r ${category.badgeColor} text-white text-xs font-bold px-4 py-2 rounded-full border border-white/30 shadow-lg backdrop-blur-sm flex items-center space-x-1`}>
                        <IconComponent size={12} aria-hidden="true" />
                        <span>{category.badge}</span>
                      </span>
                    </div>

                    {/* Stats Badge */}
                    <div className="absolute top-4 right-4 glass text-white text-xs font-semibold px-3 py-2 rounded-full">
                      <Star size={12} className="inline mr-1" aria-hidden="true" />
                      {category.stats.avgRating}
                    </div>

                    {/* Trending Indicator */}
                    {category.stats.trending && (
                      <div className="absolute bottom-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1 animate-pulse">
                        <TrendingUp size={12} aria-hidden="true" />
                        <span>Trending</span>
                      </div>
                    )}

                    {/* Hover Overlay with Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-purple-600/90 to-pink-600/90 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                      
                      {/* Quick Actions */}
                      <div className="flex items-center space-x-4 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
                        <div className="glass text-white px-4 py-2 rounded-xl flex items-center space-x-2">
                          <Eye size={16} aria-hidden="true" />
                          <span className="text-sm font-semibold">Explore</span>
                        </div>
                        <div className="glass text-white px-4 py-2 rounded-xl flex items-center space-x-2">
                          <ShoppingBag size={16} aria-hidden="true" />
                          <span className="text-sm font-semibold">Shop</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Content Section */}
                  <div className="relative p-6 lg:p-8 space-y-4 bg-white/80 dark:bg-slate-900/70 backdrop-blur">
                    
                    {/* Icon & Title Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                          <IconComponent size={24} className="text-white" aria-hidden="true" />
                        </div>
                        
                        <div>
                          <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                            {category.name}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                            {category.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2">
                      {category.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm text-gray-700 dark:text-gray-300 text-xs px-3 py-1 rounded-full border border-white/30"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>{category.count} products</span>
                        <span>{category.stats.sales} sold</span>
                      </div>
                      
                      <div className="flex items-center text-blue-600 dark:text-blue-400 font-bold transition-transform duration-300 group-hover:translate-x-2">
                        <span className="text-sm mr-2">Explore</span>
                        <ArrowRight size={16} aria-hidden="true" />
                      </div>
                    </div>
                  </div>

                  {/* Premium Border Effect */}
                  <div className={`absolute inset-0 rounded-3xl border-2 transition-opacity duration-300 pointer-events-none ${
                    hoveredCategory === category.id ? 'opacity-80 border-white/40' : 'opacity-0 border-transparent'
                  }`} />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Enhanced Bottom CTA */}
        <div className="text-center mt-20">
          <div className="card-premium p-8 lg:p-12 max-w-4xl mx-auto relative overflow-hidden">
            
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5" aria-hidden="true">
              <div className="absolute top-8 left-8 w-4 h-4 border-2 border-blue-500 rounded-full" />
              <div className="absolute bottom-12 right-12 w-6 h-6 border-2 border-purple-500 rotate-45" />
              <div className="absolute top-16 right-16 w-2 h-2 bg-pink-500 rounded-full" />
            </div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl animate-bounce-slow">
                <Grid3X3 size={32} className="text-white" aria-hidden="true" />
              </div>
              
              <h3 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                Can't find what you're looking for?
              </h3>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                Explore our complete collection of premium footwear from top brands worldwide with advanced filtering and personalized recommendations
              </p>
              
              <Link
                to="/products"
                className="inline-flex items-center gap-4 btn-premium text-white px-10 py-5 rounded-2xl text-lg font-bold hover:shadow-2xl hover:shadow-blue-500/25 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
              >
                <Grid3X3 size={24} aria-hidden="true" />
                Browse All Products
                <ArrowRight size={24} className="transition-transform duration-300 group-hover:translate-x-2" aria-hidden="true" />
              </Link>
              
              {/* Additional CTA Options */}
              <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
                <Link
                  to="/deals"
                  className="glass text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl transition-all duration-200 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Zap size={16} aria-hidden="true" />
                  <span>Hot Deals</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
                
                <Link
                  to="/new-arrivals"
                  className="glass text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl transition-all duration-200 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Star size={16} aria-hidden="true" />
                  <span>New Arrivals</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
