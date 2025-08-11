import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// Utils
import { trackEvent } from '../../utils/analytics';

const SubcategoryNav = ({
  categories = [],
  currentCategory = null,
  onCategorySelect = null,
  showBreadcrumb = true,
  variant = 'default', // default, compact, mobile
  className = ''
}) => {
  // Default category structure
  const defaultCategories = [
    {
      id: '1',
      name: 'Running Shoes',
      slug: 'running-shoes',
      icon: 'fas fa-running',
      color: 'from-blue-500 to-cyan-500',
      count: 156,
      subcategories: [
        { id: '1a', name: 'Road Running', slug: 'road-running', count: 89 },
        { id: '1b', name: 'Trail Running', slug: 'trail-running', count: 45 },
        { id: '1c', name: 'Marathon', slug: 'marathon', count: 22 }
      ]
    },
    {
      id: '2',
      name: 'Basketball',
      slug: 'basketball',
      icon: 'fas fa-basketball-ball',
      color: 'from-orange-500 to-red-500',
      count: 134,
      subcategories: [
        { id: '2a', name: 'High Top', slug: 'high-top', count: 67 },
        { id: '2b', name: 'Low Top', slug: 'low-top', count: 45 },
        { id: '2c', name: 'Mid Top', slug: 'mid-top', count: 22 }
      ]
    },
    {
      id: '3',
      name: 'Casual',
      slug: 'casual',
      icon: 'fas fa-walking',
      color: 'from-green-500 to-emerald-500',
      count: 198,
      subcategories: [
        { id: '3a', name: 'Sneakers', slug: 'sneakers', count: 89 },
        { id: '3b', name: 'Loafers', slug: 'loafers', count: 56 },
        { id: '3c', name: 'Canvas', slug: 'canvas', count: 53 }
      ]
    },
    {
      id: '4',
      name: 'Formal',
      slug: 'formal',
      icon: 'fas fa-user-tie',
      color: 'from-purple-500 to-pink-500',
      count: 87,
      subcategories: [
        { id: '4a', name: 'Oxford', slug: 'oxford', count: 34 },
        { id: '4b', name: 'Derby', slug: 'derby', count: 28 },
        { id: '4c', name: 'Monk Strap', slug: 'monk-strap', count: 25 }
      ]
    },
    {
      id: '5',
      name: 'Athletic',
      slug: 'athletic',
      icon: 'fas fa-dumbbell',
      color: 'from-indigo-500 to-blue-500',
      count: 112,
      subcategories: [
        { id: '5a', name: 'Cross Training', slug: 'cross-training', count: 45 },
        { id: '5b', name: 'Gym', slug: 'gym', count: 38 },
        { id: '5c', name: 'Tennis', slug: 'tennis', count: 29 }
      ]
    },
    {
      id: '6',
      name: 'Boots',
      slug: 'boots',
      icon: 'fas fa-hiking',
      color: 'from-yellow-500 to-orange-500',
      count: 78,
      subcategories: [
        { id: '6a', name: 'Work Boots', slug: 'work-boots', count: 32 },
        { id: '6b', name: 'Hiking Boots', slug: 'hiking-boots', count: 28 },
        { id: '6c', name: 'Fashion Boots', slug: 'fashion-boots', count: 18 }
      ]
    }
  ];

  // Use provided categories or fallback to default
  const categoryData = categories.length > 0 ? categories : defaultCategories;
  
  // State management
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [activeCategory, setActiveCategory] = useState(currentCategory?.id || null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [animateElements, setAnimateElements] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hooks
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize animations
  useEffect(() => {
    setTimeout(() => setAnimateElements(true), 100);
  }, []);

  // Auto-expand current category
  useEffect(() => {
    if (currentCategory) {
      setActiveCategory(currentCategory.id);
      setExpandedCategories(prev => new Set([...prev, currentCategory.id]));
    }
  }, [currentCategory]);

  // Handle category expansion
  const handleCategoryToggle = useCallback((categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });

    trackEvent('subcategory_nav_toggle', {
      category_id: categoryId,
      expanded: !expandedCategories.has(categoryId)
    });
  }, [expandedCategories]);

  // Handle category selection
  const handleCategorySelect = useCallback((category, subcategory = null) => {
    const selectedItem = subcategory || category;
    
    setActiveCategory(category.id);
    
    if (onCategorySelect) {
      onCategorySelect(selectedItem, category);
    } else {
      // Default navigation behavior
      const path = subcategory 
        ? `/category/${category.slug}/${subcategory.slug}`
        : `/category/${category.slug}`;
      navigate(path);
    }

    trackEvent('subcategory_nav_select', {
      category_id: category.id,
      category_name: category.name,
      subcategory_id: subcategory?.id,
      subcategory_name: subcategory?.name
    });

    // Close mobile menu after selection
    if (variant === 'mobile') {
      setIsMobileMenuOpen(false);
    }
  }, [onCategorySelect, navigate, variant]);

  // Generate breadcrumb path
  const getBreadcrumbPath = useCallback(() => {
    if (!currentCategory) return [];

    const path = [{ name: 'All Categories', slug: '', isActive: false }];
    
    if (currentCategory.parent) {
      path.push({
        name: currentCategory.parent.name,
        slug: currentCategory.parent.slug,
        isActive: false
      });
    }
    
    path.push({
      name: currentCategory.name,
      slug: currentCategory.slug,
      isActive: true
    });

    return path;
  }, [currentCategory]);

  const breadcrumbPath = getBreadcrumbPath();

  // Render compact variant
  if (variant === 'compact') {
    return (
      <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl p-4 shadow-xl ${className}`}>
        <div className="flex flex-wrap gap-2">
          {categoryData.map((category, index) => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category)}
              className={`flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
                activeCategory === category.id
                  ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                  : 'bg-white/20 text-gray-700 dark:text-gray-300 hover:bg-white/30'
              }`}
            >
              <i className={`${category.icon} mr-2`}></i>
              {category.name}
              <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-xs">
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Render mobile variant
  if (variant === 'mobile') {
    return (
      <div className={`${className}`}>
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-full bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl p-4 flex items-center justify-between shadow-xl"
        >
          <div className="flex items-center">
            <i className="fas fa-th-large mr-3 text-blue-500"></i>
            <span className="font-semibold text-gray-900 dark:text-white">
              {currentCategory ? currentCategory.name : 'All Categories'}
            </span>
          </div>
          <i className={`fas fa-chevron-${isMobileMenuOpen ? 'up' : 'down'} text-gray-500`}></i>
        </button>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mt-2 bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl shadow-2xl animate-fade-in overflow-hidden">
            {categoryData.map((category) => (
              <div key={category.id} className="border-b border-white/10 dark:border-gray-700/10 last:border-b-0">
                <button
                  onClick={() => handleCategoryToggle(category.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-white/20 transition-colors text-left"
                >
                  <div className="flex items-center">
                    <i className={`${category.icon} mr-3 text-gray-600 dark:text-gray-400`}></i>
                    <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
                    <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-xs text-gray-600 dark:text-gray-400">
                      {category.count}
                    </span>
                  </div>
                  <i className={`fas fa-chevron-${expandedCategories.has(category.id) ? 'up' : 'down'} text-gray-400`}></i>
                </button>

                {expandedCategories.has(category.id) && category.subcategories && (
                  <div className="bg-white/5 py-2">
                    {category.subcategories.map((subcategory) => (
                      <button
                        key={subcategory.id}
                        onClick={() => handleCategorySelect(category, subcategory)}
                        className="w-full px-8 py-2 text-left hover:bg-white/20 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{subcategory.name}</span>
                          <span className="text-xs text-gray-500">{subcategory.count}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Render default variant
  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* Enhanced Breadcrumb */}
      {showBreadcrumb && breadcrumbPath.length > 0 && (
        <div className={`${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl p-4 shadow-xl">
            <nav className="flex items-center space-x-2 text-sm">
              <i className="fas fa-home text-blue-500"></i>
              {breadcrumbPath.map((item, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <i className="fas fa-chevron-right text-gray-400"></i>}
                  {item.isActive ? (
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {item.name}
                    </span>
                  ) : (
                    <Link
                      to={item.slug ? `/category/${item.slug}` : '/categories'}
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {item.name}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Category Navigation */}
      <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden shadow-2xl ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                <i className="fas fa-th-large mr-3"></i>
                Browse Categories
              </h3>
              <p className="text-blue-100">
                Discover our extensive collection organized by category
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">
                {categoryData.reduce((total, cat) => total + cat.count, 0)}
              </div>
              <div className="text-blue-100 text-sm">Total Products</div>
            </div>
          </div>
        </div>

        {/* Category Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryData.map((category, index) => (
              <div
                key={category.id}
                className={`group ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                <div
                  className={`bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer ${
                    activeCategory === category.id ? 'ring-2 ring-blue-500 shadow-xl' : ''
                  }`}
                  onMouseEnter={() => setHoveredCategory(category.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  
                  {/* Category Header */}
                  <div
                    className={`bg-gradient-to-r ${category.color} p-4 relative overflow-hidden`}
                    onClick={() => handleCategorySelect(category)}
                  >
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 opacity-20">
                      <i className={`${category.icon} text-6xl transform rotate-12`}></i>
                    </div>
                    
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center mr-3">
                          <i className={`${category.icon} text-white text-xl`}></i>
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-lg">{category.name}</h4>
                          <p className="text-white/80 text-sm">{category.count} products</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCategoryToggle(category.id);
                        }}
                        className="w-8 h-8 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                      >
                        <i className={`fas fa-chevron-${expandedCategories.has(category.id) ? 'up' : 'down'} text-sm`}></i>
                      </button>
                    </div>
                  </div>

                  {/* Subcategories */}
                  {expandedCategories.has(category.id) && category.subcategories && (
                    <div className="p-4 space-y-2 animate-fade-in">
                      <h5 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">
                        <i className="fas fa-list mr-2 text-blue-500"></i>
                        Subcategories
                      </h5>
                      {category.subcategories.map((subcategory) => (
                        <button
                          key={subcategory.id}
                          onClick={() => handleCategorySelect(category, subcategory)}
                          className="w-full flex items-center justify-between p-3 bg-white/10 backdrop-blur-lg rounded-xl hover:bg-white/20 transition-all duration-200 hover:scale-105 group/sub"
                        >
                          <div className="flex items-center">
                            <i className="fas fa-arrow-right mr-3 text-blue-500 group-hover/sub:translate-x-1 transition-transform duration-200"></i>
                            <span className="font-medium text-gray-900 dark:text-white">{subcategory.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="bg-white/20 px-2 py-1 rounded-full text-xs text-gray-600 dark:text-gray-400">
                              {subcategory.count}
                            </span>
                            <i className="fas fa-external-link-alt text-xs text-gray-500 group-hover/sub:text-blue-500 transition-colors"></i>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Quick Stats */}
                  {hoveredCategory === category.id && (
                    <div className="p-4 bg-white/5 border-t border-white/10 animate-fade-in">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <i className="fas fa-chart-bar mr-2 text-green-500"></i>
                          <span>Popular Choice</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <i className="fas fa-star mr-1 text-yellow-500"></i>
                          <span>4.8 rating</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white/5 border-t border-white/10 dark:border-gray-700/10 p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            <i className="fas fa-info-circle mr-2 text-blue-500"></i>
            Can't find what you're looking for? 
            <Link to="/search" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium ml-1">
              Try our advanced search
            </Link>
          </p>
        </div>
      </div>

      {/* Custom Styles */}
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
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SubcategoryNav;
