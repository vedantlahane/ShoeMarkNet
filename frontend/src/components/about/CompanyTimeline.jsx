import React, { useState, useEffect, useCallback, useRef } from 'react';

// Utils
import { trackEvent } from '../../utils/analytics';

// Constants
const TIMELINE_DATA = [
  {
    id: 1,
    year: '2018',
    quarter: 'Q1',
    title: 'The Beginning',
    subtitle: 'ShoeMarkNet Founded',
    description: 'Started as a small passion project in a garage, with a vision to revolutionize online shoe shopping and bring premium footwear to everyone.',
    icon: 'fas fa-rocket',
    color: 'from-blue-500 to-cyan-500',
    achievements: [
      'Founded by two passionate entrepreneurs',
      'First 100 customers acquired',
      'Partnership with 5 local shoe brands'
    ],
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=400&auto=format&fit=crop',
    stats: {
      customers: '100+',
      products: '50+',
      revenue: '$10K'
    }
  },
  {
    id: 2,
    year: '2019',
    quarter: 'Q3',
    title: 'First Expansion',
    subtitle: 'National Reach Achieved',
    description: 'Expanded operations nationwide, established partnerships with major brands, and launched our first mobile app to serve customers better.',
    icon: 'fas fa-expand-arrows-alt',
    color: 'from-green-500 to-emerald-500',
    achievements: [
      'Launched iOS and Android apps',
      'Partnerships with Nike, Adidas, Puma',
      'First warehouse facility opened',
      'Customer service team established'
    ],
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=400&auto=format&fit=crop',
    stats: {
      customers: '10K+',
      products: '500+',
      revenue: '$500K'
    }
  },
  {
    id: 3,
    year: '2020',
    quarter: 'Q2',
    title: 'Digital Innovation',
    subtitle: 'Virtual Try-On Technology',
    description: 'Despite pandemic challenges, we pioneered virtual try-on technology using AR, making online shoe shopping more interactive and reliable.',
    icon: 'fas fa-magic',
    color: 'from-purple-500 to-pink-500',
    achievements: [
      'AR virtual try-on feature launched',
      'AI-powered size recommendation',
      'Same-day delivery in major cities',
      'Sustainable packaging initiative'
    ],
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=400&auto=format&fit=crop',
    stats: {
      customers: '100K+',
      products: '2,000+',
      revenue: '$5M'
    }
  },
  {
    id: 4,
    year: '2021',
    quarter: 'Q4',
    title: 'Market Leadership',
    subtitle: 'Industry Recognition',
    description: 'Achieved market leadership position, won multiple industry awards, and launched our premium loyalty program for valued customers.',
    icon: 'fas fa-trophy',
    color: 'from-yellow-500 to-orange-500',
    achievements: [
      'Best E-commerce Platform Award',
      'Premium loyalty program launched',
      'International shipping to 50+ countries',
      'Customer satisfaction: 98%'
    ],
    image: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?q=80&w=400&auto=format&fit=crop',
    stats: {
      customers: '500K+',
      products: '5,000+',
      revenue: '$25M'
    }
  },
  {
    id: 5,
    year: '2022',
    quarter: 'Q2',
    title: 'Sustainability Focus',
    subtitle: 'Eco-Friendly Initiative',
    description: 'Launched comprehensive sustainability program, carbon-neutral shipping, and partnerships with eco-conscious brands.',
    icon: 'fas fa-leaf',
    color: 'from-green-600 to-teal-500',
    achievements: [
      'Carbon-neutral shipping achieved',
      'Eco-friendly packaging 100%',
      'Sustainable brand partnerships',
      'Tree planting program: 100K trees'
    ],
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=400&auto=format&fit=crop',
    stats: {
      customers: '1M+',
      products: '8,000+',
      revenue: '$50M'
    }
  },
  {
    id: 6,
    year: '2023',
    quarter: 'Q1',
    title: 'Global Expansion',
    subtitle: 'International Markets',
    description: 'Expanded to European and Asian markets, established regional distribution centers, and localized shopping experiences.',
    icon: 'fas fa-globe',
    color: 'from-indigo-500 to-purple-500',
    achievements: [
      'European market entry',
      'Asian distribution centers',
      'Multi-language platform',
      'Local payment methods integration'
    ],
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=400&auto=format&fit=crop',
    stats: {
      customers: '2.5M+',
      products: '15,000+',
      revenue: '$120M'
    }
  },
  {
    id: 7,
    year: '2024',
    quarter: 'Q3',
    title: 'AI & Personalization',
    subtitle: 'Smart Shopping Experience',
    description: 'Integrated advanced AI for personalized recommendations, predictive analytics, and enhanced customer experience.',
    icon: 'fas fa-brain',
    color: 'from-cyan-500 to-blue-500',
    achievements: [
      'AI recommendation engine',
      'Predictive inventory management',
      'Personalized shopping assistant',
      'Voice search capability'
    ],
    image: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?q=80&w=400&auto=format&fit=crop',
    stats: {
      customers: '5M+',
      products: '25,000+',
      revenue: '$250M'
    }
  },
  {
    id: 8,
    year: '2025',
    quarter: 'Q1',
    title: 'Future Vision',
    subtitle: 'Innovation Continues',
    description: 'Looking ahead with cutting-edge technologies, sustainable practices, and commitment to customer satisfaction.',
    icon: 'fas fa-star',
    color: 'from-pink-500 to-rose-500',
    achievements: [
      'Metaverse shopping experience',
      'Blockchain authentication',
      'Drone delivery pilots',
      'Community marketplace launch'
    ],
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&auto=format&fit=crop',
    stats: {
      customers: '10M+',
      products: '50,000+',
      revenue: '$500M'
    },
    isFuture: true
  }
];

const CompanyTimeline = ({
  interactive = true,
  showStats = true,
  autoPlay = false,
  autoPlayInterval = 5000,
  className = ''
}) => {
  // State management
  const [activeItem, setActiveItem] = useState(null);
  const [visibleItems, setVisibleItems] = useState(new Set());
  const [hoveredItem, setHoveredItem] = useState(null);
  const [animateElements, setAnimateElements] = useState(false);
  const [currentAutoPlay, setCurrentAutoPlay] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);

  // Refs
  const timelineRef = useRef(null);
  const observerRef = useRef(null);
  const autoPlayIntervalRef = useRef(null);

  // Initialize animations
  useEffect(() => {
    setTimeout(() => setAnimateElements(true), 100);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && interactive) {
      autoPlayIntervalRef.current = setInterval(() => {
        setCurrentAutoPlay(prev => {
          const next = (prev + 1) % TIMELINE_DATA.length;
          setActiveItem(TIMELINE_DATA[next]);
          return next;
        });
      }, autoPlayInterval);
    } else {
      clearInterval(autoPlayIntervalRef.current);
    }

    return () => clearInterval(autoPlayIntervalRef.current);
  }, [isAutoPlaying, autoPlayInterval, interactive]);

  // Intersection Observer for scroll animations
  useEffect(() => {
    if (!timelineRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const itemId = parseInt(entry.target.dataset.itemId);
            setVisibleItems(prev => new Set([...prev, itemId]));
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '50px'
      }
    );

    const timelineItems = timelineRef.current.querySelectorAll('[data-item-id]');
    timelineItems.forEach(item => observerRef.current.observe(item));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Handle item click
  const handleItemClick = useCallback((item) => {
    if (!interactive) return;
    
    setActiveItem(activeItem?.id === item.id ? null : item);
    setIsAutoPlaying(false);
    
    trackEvent('timeline_item_clicked', {
      item_id: item.id,
      item_year: item.year,
      item_title: item.title
    });
  }, [activeItem, interactive]);

  // Handle mouse enter/leave
  const handleMouseEnter = useCallback((item) => {
    if (!interactive) return;
    setHoveredItem(item);
  }, [interactive]);

  const handleMouseLeave = useCallback(() => {
    if (!interactive) return;
    setHoveredItem(null);
  }, [interactive]);

  // Format number with commas
  const formatNumber = useCallback((num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }, []);

  return (
    <div className={`relative max-w-7xl mx-auto ${className}`}>
      
      {/* Header */}
      <div className={`text-center mb-16 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`}>
        <h2 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
          <i className="fas fa-history mr-4"></i>
          Our Journey
        </h2>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
          From humble beginnings to industry leadership - discover the milestones that shaped ShoeMarkNet
        </p>
        
        {/* Auto-play control */}
        {interactive && (
          <div className="mt-8">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 text-gray-900 dark:text-white px-6 py-3 rounded-2xl hover:bg-white/20 transition-all duration-200"
            >
              <i className={`fas ${isAutoPlaying ? 'fa-pause' : 'fa-play'} mr-2`}></i>
              {isAutoPlaying ? 'Pause Tour' : 'Start Tour'}
            </button>
          </div>
        )}
      </div>

      {/* Timeline Container */}
      <div ref={timelineRef} className="relative">
        
        {/* Timeline Line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full hidden md:block">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-pink-500 rounded-full animate-pulse"></div>
        </div>

        {/* Timeline Items */}
        <div className="space-y-12 md:space-y-20">
          {TIMELINE_DATA.map((item, index) => {
            const isVisible = visibleItems.has(item.id);
            const isActive = activeItem?.id === item.id;
            const isHovered = hoveredItem?.id === item.id;
            const isLeft = index % 2 === 0;
            
            return (
              <div
                key={item.id}
                data-item-id={item.id}
                className={`relative ${
                  isVisible ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                
                {/* Timeline Node */}
                <div className="absolute left-1/2 transform -translate-x-1/2 z-20 hidden md:block">
                  <button
                    onClick={() => handleItemClick(item)}
                    onMouseEnter={() => handleMouseEnter(item)}
                    onMouseLeave={handleMouseLeave}
                    className={`w-16 h-16 rounded-full border-4 border-white shadow-2xl transition-all duration-300 hover:scale-125 ${
                      isActive || isHovered
                        ? 'bg-gradient-to-r ' + item.color + ' transform scale-125'
                        : 'bg-white dark:bg-gray-800'
                    } ${interactive ? 'cursor-pointer' : ''}`}
                    title={`${item.year} - ${item.title}`}
                  >
                    <i className={`${item.icon} text-xl ${
                      isActive || isHovered 
                        ? 'text-white' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}></i>
                  </button>
                  
                  {/* Year Badge */}
                  <div className={`absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gradient-to-r ${item.color} text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                    item.isFuture ? 'animate-pulse' : ''
                  }`}>
                    {item.year}
                  </div>
                </div>

                {/* Content Card */}
                <div className={`md:w-5/12 ${isLeft ? 'md:mr-auto md:pr-16' : 'md:ml-auto md:pl-16'}`}>
                  <div
                    className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-3xl ${
                      isActive ? 'ring-4 ring-blue-500/50 scale-105' : ''
                    } ${interactive ? 'cursor-pointer hover:scale-105' : ''}`}
                    onClick={() => handleItemClick(item)}
                    onMouseEnter={() => handleMouseEnter(item)}
                    onMouseLeave={handleMouseLeave}
                  >
                    
                    {/* Card Header */}
                    <div className={`bg-gradient-to-r ${item.color} p-6 text-white relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 opacity-20">
                        <i className={`${item.icon} text-6xl`}></i>
                      </div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                          <span className="bg-white/20 backdrop-blur-lg px-3 py-1 rounded-full text-sm font-bold">
                            {item.quarter} {item.year}
                          </span>
                          {item.isFuture && (
                            <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                              FUTURE
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                        <p className="text-white/90 font-semibold">{item.subtitle}</p>
                      </div>
                    </div>

                    {/* Card Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        {item.description}
                      </p>

                      {/* Key Achievements */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <i className="fas fa-check-circle mr-2 text-green-500"></i>
                          Key Achievements
                        </h4>
                        <ul className="space-y-2">
                          {item.achievements.map((achievement, idx) => (
                            <li key={idx} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                              <i className="fas fa-arrow-right mr-2 text-blue-500 mt-1 flex-shrink-0"></i>
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Stats */}
                      {showStats && (
                        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20 dark:border-gray-700/20">
                          <div className="text-center">
                            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                              {item.stats.customers}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                              Customers
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                              {item.stats.products}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                              Products
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                              {item.stats.revenue}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                              Revenue
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Expand Indicator */}
                    {interactive && (
                      <div className="absolute top-4 right-4">
                        <div className={`w-8 h-8 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center transition-all duration-200 ${
                          isActive ? 'rotate-180' : ''
                        }`}>
                          <i className="fas fa-chevron-down text-white text-sm"></i>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mobile Year Badge */}
                  <div className="md:hidden mt-4 text-center">
                    <span className={`inline-block bg-gradient-to-r ${item.color} text-white px-6 py-2 rounded-full font-bold shadow-lg ${
                      item.isFuture ? 'animate-pulse' : ''
                    }`}>
                      {item.year}
                    </span>
                  </div>
                </div>

                {/* Expanded Content */}
                {isActive && interactive && (
                  <div className="mt-8 animate-fade-in">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 dark:border-gray-700/10 rounded-3xl p-8">
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        <i className="fas fa-info-circle mr-2 text-blue-500"></i>
                        More Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                            Innovation Highlights
                          </h5>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            This period marked significant technological and business milestones that positioned us for future growth and success.
                          </p>
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                            Impact & Growth
                          </h5>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Customer satisfaction increased significantly during this period, establishing strong foundations for our continued expansion.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress Indicator */}
        {interactive && isAutoPlaying && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-full px-6 py-3 shadow-2xl">
              <div className="flex items-center space-x-2">
                <i className="fas fa-play text-blue-500 animate-pulse"></i>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Tour Progress: {currentAutoPlay + 1} / {TIMELINE_DATA.length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {showStats && (
        <div className={`mt-20 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '1s' }}>
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white">
            <h3 className="text-2xl font-bold text-center mb-8">
              <i className="fas fa-chart-line mr-3"></i>
              Our Growth Story
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-4xl font-black mb-2">7+</div>
                <div className="text-white/80">Years of Innovation</div>
              </div>
              <div>
                <div className="text-4xl font-black mb-2">10M+</div>
                <div className="text-white/80">Happy Customers</div>
              </div>
              <div>
                <div className="text-4xl font-black mb-2">50K+</div>
                <div className="text-white/80">Products Available</div>
              </div>
              <div>
                <div className="text-4xl font-black mb-2">50+</div>
                <div className="text-white/80">Countries Served</div>
              </div>
            </div>
          </div>
        </div>
      )}

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
          animation: fade-in 0.5s ease-out;
        }
        
        /* Custom scrollbar for timeline */
        .timeline-container::-webkit-scrollbar {
          width: 4px;
        }
        
        .timeline-container::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
        
        .timeline-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
        }
        
        /* Enhanced hover effects */
        @media (hover: hover) {
          .timeline-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
          }
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          .timeline-item {
            margin-left: 0;
            margin-right: 0;
          }
        }
        
        /* Accessibility improvements */
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in-up,
          .animate-fade-in,
          .animate-pulse {
            animation: none !important;
          }
          
          * {
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CompanyTimeline;
