import React from 'react';
import StatsCounter from './StatsCounter';

const StatsSection = ({ 
  title = "Our Impact in Numbers",
  subtitle = "Real achievements that showcase our commitment to excellence",
  variant = 'featured',
  customStats = null,
  className = ''
}) => {
  // Custom stats data with more detailed information
  const enhancedStats = customStats || [
    {
      id: 'customers',
      icon: 'fas fa-users',
      value: 2500000,
      label: 'Happy Customers',
      suffix: '+',
      prefix: '',
      color: 'from-blue-500 to-cyan-500',
      description: 'Customers worldwide trust our premium footwear collection'
    },
    {
      id: 'products',
      icon: 'fas fa-shoe-prints',
      value: 150000,
      label: 'Products Sold',
      suffix: '+',
      prefix: '',
      color: 'from-green-500 to-emerald-500',
      description: 'Premium shoes delivered to customers globally'
    },
    {
      id: 'countries',
      icon: 'fas fa-globe',
      value: 45,
      label: 'Countries Served',
      suffix: '+',
      prefix: '',
      color: 'from-purple-500 to-pink-500',
      description: 'International presence across multiple continents'
    },
    {
      id: 'satisfaction',
      icon: 'fas fa-heart',
      value: 99,
      label: 'Customer Satisfaction',
      suffix: '%',
      prefix: '',
      color: 'from-red-500 to-rose-500',
      description: 'Exceptional customer satisfaction and loyalty rate'
    },
    {
      id: 'awards',
      icon: 'fas fa-trophy',
      value: 25,
      label: 'Industry Awards',
      suffix: '+',
      prefix: '',
      color: 'from-yellow-500 to-orange-500',
      description: 'Recognition for excellence and innovation'
    },
    {
      id: 'brands',
      icon: 'fas fa-handshake',
      value: 200,
      label: 'Brand Partners',
      suffix: '+',
      prefix: '',
      color: 'from-indigo-500 to-purple-500',
      description: 'Trusted partnerships with leading footwear brands'
    }
  ];

  return (
    <div className={`py-20 ${className}`}>
      <StatsCounter 
        stats={enhancedStats}
        variant={variant}
        animationDuration={2500}
        staggerDelay={150}
        showIcons={true}
        showLabels={true}
        showPlusSign={true}
      />
    </div>
  );
};

export default StatsSection;
