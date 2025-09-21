import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Tag, Sparkles } from 'lucide-react';

const OffersSection = memo(() => {
  const offers = [
    {
      id: 1,
      title: 'Summer Sale',
      description: 'Up to 50% off on all summer footwear',
      discount: '50%',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=600&auto=format&fit=crop',
      link: '/sale',
      badge: 'Limited Time'
    },
    {
      id: 2,
      title: 'New Arrivals',
      description: 'Latest collection of premium shoes',
      discount: '25%',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop',
      link: '/new-arrivals',
      badge: 'Fresh Stock'
    }
  ];

  return (
    <section 
      id="offers"
      className="py-12 bg-blue-50 dark:bg-gray-800"
      aria-label="Special offers and deals"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full px-6 py-3 mb-6">
            <Tag size={16} className="animate-pulse" aria-hidden="true" />
            <span className="text-sm font-semibold">Exclusive Deals</span>
            <Sparkles size={14} aria-hidden="true" />
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Special Offers
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Don't miss out on our exclusive deals
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {offers.map((offer) => (
            <Link
              key={offer.id}
              to={offer.link}
              className="group block bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
              aria-label={`${offer.title} - ${offer.description} - ${offer.discount} off`}
            >
              <div className="relative">
                <img
                  src={offer.image}
                  alt={`${offer.title} promotion`}
                  className="w-full h-48 lg:h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = '/api/placeholder/600/300';
                  }}
                />
                
                {/* Discount Badge */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                  {offer.discount} OFF
                </div>
                
                {/* Limited Time Badge */}
                <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  {offer.badge}
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <div className="p-6 lg:p-8">
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {offer.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-base lg:text-lg">
                  {offer.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold text-lg flex items-center gap-2 group-hover:gap-4 transition-all duration-300">
                    Shop Now
                    <ArrowRight 
                      size={20} 
                      className="group-hover:translate-x-2 transition-transform duration-300" 
                      aria-hidden="true"
                    />
                  </span>
                  
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Limited time offer
                  </div>
                </div>
              </div>
              
              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out opacity-0 group-hover:opacity-100"></div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
});

OffersSection.displayName = 'OffersSection';

export default OffersSection;
