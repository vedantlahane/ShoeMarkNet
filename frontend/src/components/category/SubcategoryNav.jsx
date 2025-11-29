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
      id: 'running-shoes',
      name: 'Running Shoes',
      slug: 'running-shoes',
      icon: 'fas fa-running',
      color: 'from-blue-500 to-cyan-500',
      count: 156,
      subcategories: [
        { id: 'road-running', name: 'Road Running', slug: 'road-running', count: 89 },
        { id: 'trail-running', name: 'Trail Running', slug: 'trail-running', count: 45 },
        { id: 'marathon', name: 'Marathon', slug: 'marathon', count: 22 }
      ]
    },
    {
      id: 'basketball-shoes',
      name: 'Basketball Shoes',
      slug: 'basketball-shoes',
      icon: 'fas fa-basketball-ball',
      color: 'from-orange-500 to-red-500',
      count: 134,
      subcategories: [
        { id: 'high-top', name: 'High Top', slug: 'high-top', count: 67 },
        { id: 'low-top', name: 'Low Top', slug: 'low-top', count: 45 },
        { id: 'mid-top', name: 'Mid Top', slug: 'mid-top', count: 22 }
      ]
    },
    {
      id: 'lifestyle-sneakers',
      name: 'Lifestyle Sneakers',
      slug: 'lifestyle-sneakers',
      icon: 'fas fa-walking',
      color: 'from-pink-500 to-rose-500',
      count: 203,
      subcategories: [
        { id: 'street-style', name: 'Street Style', slug: 'street-style', count: 89 },
        { id: 'limited-edition', name: 'Limited Edition', slug: 'limited-edition', count: 56 },
        { id: 'collaborations', name: 'Collaborations', slug: 'collaborations', count: 53 }
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
        ? `/categories/${category.slug}?sub=${subcategory.slug}`
        : `/categories/${category.slug}`;
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
      <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-lg dark:shadow-none ${className}`}>
        <div className="flex flex-wrap gap-2">
          {categoryData.map((category, index) => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category)}
              className={`flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
                activeCategory === category.id
                  ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <i className={`${category.icon} mr-2`}></i>
              {category.name}
              <span className="ml-2 bg-white/20 dark:bg-black/20 px-2 py-1 rounded-full text-xs">
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
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg dark:shadow-none"
        >
          <div className="flex items-center">
            <i className="fas fa-th-large mr-3 text-blue-500"></i>
            <span className="font-semibold text-slate-900 dark:text-white">
              {currentCategory ? currentCategory.name : 'All Categories'}
            </span>
          </div>
          <i className={`fas fa-chevron-${isMobileMenuOpen ? 'up' : 'down'} text-slate-500`}></i>
        </button>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl dark:shadow-none animate-fade-in overflow-hidden">
            {categoryData.map((category) => (
              <div key={category.id} className="border-b border-slate-200 dark:border-slate-800 last:border-b-0">
                <button
                  onClick={() => handleCategoryToggle(category.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  <div className="flex items-center">
                    <i className={`${category.icon} mr-3 text-slate-600 dark:text-slate-400`}></i>
                    <span className="font-medium text-slate-900 dark:text-white">{category.name}</span>
                    <span className="ml-2 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full text-xs text-slate-600 dark:text-slate-400">
                      {category.count}
                    </span>
                  </div>
                  <i className={`fas fa-chevron-${expandedCategories.has(category.id) ? 'up' : 'down'} text-slate-400`}></i>
                </button>

                {expandedCategories.has(category.id) && category.subcategories && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 py-2">
                    {category.subcategories.map((subcategory) => (
                      <button
                        key={subcategory.id}
                        onClick={() => handleCategorySelect(category, subcategory)}
                        className="w-full px-8 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-700 dark:text-slate-300">{subcategory.name}</span>
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
              <p className="text-muted-theme">
                Discover our extensive collection organized by category
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-theme">
                {categoryData.reduce((total, cat) => total + cat.count, 0)}
              </div>
              <div className="text-muted-theme text-sm">Total Products</div>
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
    </div>
  );
};

export default SubcategoryNav;
