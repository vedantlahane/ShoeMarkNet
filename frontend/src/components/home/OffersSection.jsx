import React from 'react';
import { Link } from 'react-router-dom';

const OffersSection = () => {
  const offers = [
    {
      id: 1,
      title: 'Summer Sale',
      description: 'Up to 50% off on all summer footwear',
      discount: '50%',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=600&auto=format&fit=crop',
      link: '/sale'
    },
    {
      id: 2,
      title: 'New Arrivals',
      description: 'Latest collection of premium shoes',
      discount: '25%',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop',
      link: '/new-arrivals'
    }
  ];

  return (
    <section className="py-12 bg-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Special Offers</h2>
          <p className="text-gray-600">Don't miss out on our exclusive deals</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {offers.map((offer) => (
            <Link
              key={offer.id}
              to={offer.link}
              className="group block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="relative">
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold">
                  {offer.discount} OFF
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{offer.title}</h3>
                <p className="text-gray-600 mb-4">{offer.description}</p>
                <span className="text-blue-600 font-semibold">Shop Now →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OffersSection;
