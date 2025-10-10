import React from 'react';
import { Link } from 'react-router-dom';

const CategoryHeader = ({ 
  categoryName, 
  breadcrumb, 
  categoryIcon, 
  categoryColor, 
  stats, 
  animateElements, 
  onNavigate 
}) => {
  return (
    <section className="pt-24 pb-12 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${categoryColor}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 animate-shimmer"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center">
          
          {/* Enhanced Breadcrumb Navigation */}
          <div className={`mb-6 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <nav className="flex justify-center items-center space-x-2 text-muted-theme">
              <button 
                onClick={() => onNavigate('/')}
                className="hover:text-theme transition-colors duration-200 flex items-center"
              >
                <i className="fas fa-home mr-1"></i>Home
              </button>
              <i className="fas fa-chevron-right text-xs"></i>
              
              {breadcrumb && breadcrumb.length > 0 ? (
                breadcrumb.map((crumb, index) => (
                  <React.Fragment key={crumb._id}>
                    <Link 
                      to={`/category/${crumb.slug}`}
                      className="hover:text-theme transition-colors duration-200"
                    >
                      {crumb.name}
                    </Link>
                    {index < breadcrumb.length - 1 && (
                      <i className="fas fa-chevron-right text-xs"></i>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <>
                  <span className="text-theme font-medium">Categories</span>
                  <i className="fas fa-chevron-right text-xs"></i>
                </>
              )}
              
              <span className="text-yellow-300 font-semibold">{categoryName}</span>
            </nav>
          </div>

          {/* Category Icon and Title */}
          <div className={`mb-8 ${animateElements ? 'animate-bounce-in' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            <div className={`inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r ${categoryColor} rounded-3xl shadow-2xl mb-6 transform hover:scale-110 transition-transform duration-300`}>
              <i className={`fas ${categoryIcon} text-4xl text-white`}></i>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-theme mb-4">
              {categoryName} <span className="text-yellow-300">Collection</span>
            </h1>
            <p className="text-xl text-muted-theme max-w-2xl mx-auto">
              <i className="fas fa-search mr-2"></i>
              Discover premium {categoryName?.toLowerCase()} products with exclusive deals and fast shipping
            </p>
          </div>

          {/* Enhanced Stats */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
            <div className="bg-surface backdrop-blur-lg border border-theme-strong rounded-2xl p-4 hover:bg-surface/80 transition-colors duration-200">
              <div className="text-3xl font-bold text-theme mb-1">{stats.total}</div>
              <div className="text-sm text-muted-theme">Products</div>
            </div>
            <div className="bg-surface backdrop-blur-lg border border-theme-strong rounded-2xl p-4 hover:bg-surface/80 transition-colors duration-200">
              <div className="text-3xl font-bold text-theme mb-1">{stats.onSale}</div>
              <div className="text-sm text-muted-theme">On Sale</div>
            </div>
            <div className="bg-surface backdrop-blur-lg border border-theme-strong rounded-2xl p-4 hover:bg-surface/80 transition-colors duration-200">
              <div className="text-3xl font-bold text-theme mb-1">
                <i className="fas fa-star text-yellow-300"></i>
                <span className="ml-1">{stats.averageRating}</span>
              </div>
              <div className="text-sm text-muted-theme">Avg Rating</div>
            </div>
            <div className="bg-surface backdrop-blur-lg border border-theme-strong rounded-2xl p-4 hover:bg-surface/80 transition-colors duration-200">
              <div className="text-3xl font-bold text-theme mb-1">
                <i className="fas fa-shipping-fast text-green-300"></i>
              </div>
              <div className="text-sm text-muted-theme">Free Ship</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryHeader;
