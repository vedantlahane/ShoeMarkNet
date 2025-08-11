import React, { useState } from 'react';
import ValueCard from './ValueCard';

// Sample company values data
const COMPANY_VALUES = [
  {
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
  },
  {
    id: '2',
    title: 'Quality',
    subtitle: 'Excellence in Every Step',
    description: 'Our commitment to quality drives everything we do. From premium materials to meticulous craftsmanship, we ensure every product meets the highest standards.',
    icon: 'fas fa-award',
    color: 'from-green-500 to-emerald-500',
    stats: {
      metric: '99.8%',
      label: 'Quality Score'
    },
    details: [
      'Premium material sourcing',
      'Rigorous quality testing',
      'Expert craftsmanship',
      'Continuous improvement'
    ],
    examples: [
      '200+ quality checkpoints',
      'Premium leather certification',
      'Durability stress testing'
    ]
  },
  {
    id: '3',
    title: 'Sustainability',
    subtitle: 'Protecting Our Planet',
    description: 'Environmental responsibility is at the core of our operations. We\'re committed to sustainable practices that protect our planet for future generations.',
    icon: 'fas fa-leaf',
    color: 'from-green-600 to-teal-500',
    stats: {
      metric: '75%',
      label: 'Carbon Reduction'
    },
    details: [
      'Eco-friendly materials',
      'Carbon-neutral shipping',
      'Renewable energy usage',
      'Waste reduction programs'
    ],
    examples: [
      'Recycled packaging materials',
      'Solar-powered facilities',
      'Water conservation initiatives'
    ]
  },
  {
    id: '4',
    title: 'Customer Focus',
    subtitle: 'Your Success, Our Mission',
    description: 'Every decision we make starts with our customers. We listen, learn, and continuously improve to deliver experiences that delight and inspire.',
    icon: 'fas fa-users',
    color: 'from-purple-500 to-pink-500',
    stats: {
      metric: '4.9/5',
      label: 'Customer Rating'
    },
    details: [
      '24/7 customer support',
      'Personalized recommendations',
      'Easy returns & exchanges',
      'Community engagement'
    ],
    examples: [
      '30-day satisfaction guarantee',
      'Personal shopping assistance',
      'Customer feedback integration'
    ]
  }
];

const ValuesSection = ({ 
  values = COMPANY_VALUES,
  showStats = true,
  variant = 'default',
  className = ''
}) => {
  const [animateElements, setAnimateElements] = useState(false);

  // Trigger animations
  React.useEffect(() => {
    setTimeout(() => setAnimateElements(true), 100);
  }, []);

  return (
    <div className={`max-w-7xl mx-auto ${className}`}>
      
      {/* Header */}
      <div className={`text-center mb-16 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`}>
        <h2 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
          <i className="fas fa-heart mr-4"></i>
          Our Core Values
        </h2>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
          The principles that guide everything we do and shape our company culture
        </p>
      </div>

      {/* Values Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {values.map((value, index) => (
          <ValueCard
            key={value.id}
            value={value}
            index={index}
            variant={variant}
            showDetails={true}
            interactive={true}
          />
        ))}
      </div>

      {/* Stats Summary */}
      {showStats && (
        <div className={`${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white">
            <h3 className="text-2xl font-bold text-center mb-8">
              <i className="fas fa-chart-line mr-3"></i>
              Values in Action
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-4xl font-black mb-2">50+</div>
                <div className="text-white/80">Innovations Launched</div>
              </div>
              <div>
                <div className="text-4xl font-black mb-2">99.8%</div>
                <div className="text-white/80">Quality Standards</div>
              </div>
              <div>
                <div className="text-4xl font-black mb-2">75%</div>
                <div className="text-white/80">Carbon Reduction</div>
              </div>
              <div>
                <div className="text-4xl font-black mb-2">4.9★</div>
                <div className="text-white/80">Customer Rating</div>
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
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default ValuesSection;
