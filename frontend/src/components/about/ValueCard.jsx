import React, { useState, useCallback, useRef, useEffect } from 'react';

// Utils
import { trackEvent } from '../../utils/analytics';

const ValueCard = ({
  value = {},
  index = 0,
  variant = 'default', // default, compact, featured
  interactive = true,
  showDetails = true,
  onValueClick = null,
  className = ''
}) => {
  // Default value data structure
  const defaultValue = {
    id: '1',
    title: 'Innovation',
    subtitle: 'Pioneering the Future',
    description: 'We constantly push boundaries and embrace cutting-edge technologies to deliver exceptional footwear experiences that exceed customer expectations.',
    icon: 'fas fa-lightbulb',
    color: 'from-blue-500 to-cyan-500',
    stats: {
      metric: '50+',
      label: 'Innovations'
    },
    details: [
      'Advanced material research',
      'Sustainable manufacturing',
      'Customer-centric design',
      'Technology integration'
    ],
    examples: [
      'AI-powered size recommendations',
      'Sustainable eco-friendly materials',
      'Virtual try-on technology'
    ]
  };

  // Merge provided value with defaults
  const valueData = {
    ...defaultValue,
    ...value,
    stats: { ...defaultValue.stats, ...value.stats }
  };

  // Local state
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [animateElements, setAnimateElements] = useState(false);
  const [rippleEffect, setRippleEffect] = useState({ active: false, x: 0, y: 0 });

  // Refs
  const cardRef = useRef(null);

  // Initialize animations
  useEffect(() => {
    const timer = setTimeout(() => setAnimateElements(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  // Handle card click with ripple effect
  const handleCardClick = useCallback((e) => {
    if (!interactive) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setRippleEffect({ active: true, x, y });
    setTimeout(() => setRippleEffect({ active: false, x: 0, y: 0 }), 600);

    setIsExpanded(!isExpanded);

    if (onValueClick) {
      onValueClick(valueData);
    }

    trackEvent('value_card_clicked', {
      value_id: valueData.id,
      value_title: valueData.title,
      expanded: !isExpanded
    });
  }, [interactive, isExpanded, onValueClick, valueData]);

  // Handle mouse events
  const handleMouseEnter = useCallback(() => {
    if (interactive) {
      setIsHovered(true);
    }
  }, [interactive]);

  const handleMouseLeave = useCallback(() => {
    if (interactive) {
      setIsHovered(false);
    }
  }, [interactive]);

  // Render compact variant
  if (variant === 'compact') {
    return (
      <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 ${className}`}>
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 bg-gradient-to-r ${valueData.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <i className={`${valueData.icon} text-white text-lg`}></i>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate">
              {valueData.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm truncate">
              {valueData.subtitle}
            </p>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {valueData.stats.metric}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {valueData.stats.label}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render full variant
  return (
    <div 
      ref={cardRef}
      className={`relative bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ${
        isHovered ? 'scale-105 shadow-3xl' : ''
      } ${variant === 'featured' ? 'ring-2 ring-blue-500/50' : ''} ${
        interactive ? 'cursor-pointer' : ''
      } ${animateElements ? 'animate-fade-in-up' : 'opacity-0'} ${className}`}
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      
      {/* Ripple Effect */}
      {rippleEffect.active && (
        <div
          className="absolute bg-white/30 rounded-full animate-ping pointer-events-none z-10"
          style={{
            left: rippleEffect.x - 20,
            top: rippleEffect.y - 20,
            width: 40,
            height: 40,
          }}
        />
      )}

      {/* Header Section */}
      <div className={`relative p-8 bg-gradient-to-br ${valueData.color} text-white overflow-hidden`}>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white transform translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white transform -translate-x-12 translate-y-12"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
              <i className={`${valueData.icon} text-2xl`}></i>
            </div>
            
            {showDetails && interactive && (
              <button
                className={`w-8 h-8 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              >
                <i className="fas fa-chevron-down text-sm"></i>
              </button>
            )}
          </div>

          <h3 className="text-2xl font-black mb-2">
            {valueData.title}
          </h3>
          
          <p className="text-white/90 font-semibold mb-4">
            {valueData.subtitle}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-between">
            <div className="bg-white/20 backdrop-blur-lg rounded-xl px-4 py-2">
              <div className="text-xl font-bold">
                {valueData.stats.metric}
              </div>
              <div className="text-white/80 text-sm">
                {valueData.stats.label}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-white/60 text-sm">Impact Score</div>
              <div className="flex space-x-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < 4 ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8">
        
        {/* Description */}
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 text-lg">
          {valueData.description}
        </p>

        {/* Key Details */}
        {valueData.details && valueData.details.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <i className="fas fa-check-circle mr-2 text-green-500"></i>
              How We Deliver
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {valueData.details.map((detail, index) => (
                <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <i className="fas fa-arrow-right mr-2 text-blue-500 flex-shrink-0"></i>
                  {detail}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Examples (shown when expanded or always visible) */}
        {valueData.examples && valueData.examples.length > 0 && (isExpanded || !interactive) && (
          <div className={`${isExpanded ? 'animate-fade-in' : ''} bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-6`}>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <i className="fas fa-star mr-2 text-yellow-500"></i>
              Real Examples
            </h4>
            <div className="space-y-3">
              {valueData.examples.map((example, index) => (
                <div key={index} className="flex items-start bg-white/10 backdrop-blur-lg rounded-xl p-3">
                  <div className={`w-6 h-6 bg-gradient-to-r ${valueData.color} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <i className="fas fa-lightbulb text-white text-xs"></i>
                  </div>
                  <span className="ml-3 text-gray-700 dark:text-gray-300 text-sm">{example}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        {interactive && (
          <div className="mt-6 pt-6 border-t border-white/20 dark:border-gray-700/20">
            <button className="group flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors font-semibold">
              <i className="fas fa-arrow-right mr-2 group-hover:translate-x-1 transition-transform duration-200"></i>
              {isExpanded ? 'Learn Less' : 'Learn More'}
            </button>
          </div>
        )}
      </div>

      {/* Hover Glow Effect */}
      {isHovered && (
        <div className={`absolute inset-0 bg-gradient-to-r ${valueData.color} opacity-5 pointer-events-none rounded-3xl`}></div>
      )}

      {/* Custom Styles */}
    </div>
  );
};

export default ValueCard;
