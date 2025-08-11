import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const OffersSection = ({ className = '' }) => {
  const [animateElements, setAnimateElements] = useState(false);

  const offers = [
    {
      id: 1,
      title: 'Summer Sale',
      description: 'Up to 50% off on all summer footwear',
      discount: '50%',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=600&auto=format&fit=crop',
      color: 'from-orange-500 to-red-500',
      link: '/category/summer-sale'
    },
    {
      id: 2,
      title: 'New Arrivals',
      description: 'Latest collection of premium shoes',
      discount: '25%',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop',
      color: 'from-blue-500 to-purple-500',
      link: '/category/new-arrivals'
    }
  ];

  useEffect(() => {
    setTimeout(() => setAnimateElements(true), 100);
  }, []);

  return (
    <section className={`py-16 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 ${className}`}>
      <div className="container mx-auto px-4">
        <div className={`text-center mb-12 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-4">
            Special Offers
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Don't miss out on our exclusive deals and limited-time offers
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {offers.map((offer, index) => (
            <Link
              key={offer.id}
              to={offer.link}
              className={`group ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-r ${offer.color} opacity-80`} />
                  
                  {/* Discount Badge */}
                  <div className="absolute top-6 right-6 bg-white text-gray-900 px-4 py-2 rounded-full font-black text-xl">
                    {offer.discount} OFF
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                    {offer.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {offer.description}
                  </p>
                  <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    Shop Now
                    <i className="fas fa-arrow-right ml-2"></i>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

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
        }
      `}</style>
    </section>
  );
};

export default OffersSection;
