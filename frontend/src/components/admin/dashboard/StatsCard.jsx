import React from 'react';
import { formatPercentage } from '../../../utils/helpers';

const StatsCard = ({
  title,
  value,
  icon,
  color,
  change,
  badge,
  subtitle,
  urgent,
  animateStats,
  animationDelay,
  onClick,
  isActive
}) => {
  return (
    <div 
      className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl hover:scale-105 transition-all duration-500 relative overflow-hidden cursor-pointer ${
        isActive ? 'ring-2 ring-blue-500 bg-white/20' : ''
      } ${animateStats ? 'animate-fade-in-up' : 'opacity-0'}`} 
      style={{ animationDelay }}
      onClick={onClick}
    >
      {/* Background Glow */}
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${color}/20 rounded-full blur-xl`}></div>
      
      {/* Shimmer Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 animate-shimmer"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-14 h-14 bg-gradient-to-r ${color} rounded-2xl flex items-center justify-center shadow-lg`}>
            <i className={`fas ${icon} text-white text-xl`}></i>
          </div>
          
          {/* Badges and Indicators */}
          <div className="flex flex-col items-end space-y-2">
            {change !== undefined && (
              <div className={`text-xs font-medium px-3 py-1 rounded-full ${
                change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <i className={`fas ${change >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'} mr-1`}></i>
                {formatPercentage(Math.abs(change))}
              </div>
            )}
            
            {badge && (
              <div className={`text-xs font-medium px-3 py-1 rounded-full ${
                badge.type === 'success' ? 'bg-green-100 text-green-700' :
                badge.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                badge.type === 'danger' ? 'bg-red-100 text-red-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                <i className={`fas ${
                  badge.type === 'success' ? 'fa-check' :
                  badge.type === 'warning' ? 'fa-exclamation' :
                  badge.type === 'danger' ? 'fa-times' :
                  'fa-info'
                } mr-1`}></i>
                {badge.text}
              </div>
            )}
            
            {urgent && (
              <div className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full animate-pulse">
                <i className="fas fa-exclamation-triangle mr-1"></i>
                Urgent
              </div>
            )}
          </div>
        </div>
        
        <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">{title}</h3>
        <p className="text-3xl font-black text-gray-900 dark:text-white mb-2">{value}</p>
        
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
            <i className="fas fa-info-circle mr-1"></i>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
