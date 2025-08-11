import React from 'react';
import { Link } from 'react-router-dom';

const CategoriesSection = () => {
  const categories = [
    {
      id: 1,
      name: 'Running Shoes',
      slug: 'running-shoes',
      count: 156,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop'
    },
    {
      id: 2,
      name: 'Basketball',
      slug: 'basketball',
      count: 134,
      image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=400&auto=format&fit=crop'
    },
    {
      id: 3,
      name: 'Casual',
      slug: 'casual',
      count: 198,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=400&auto=format&fit=crop'
    },
    {
      id: 4,
      name: 'Formal',
      slug: 'formal',
      count: 87,
      image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=400&auto=format&fit=crop'
    }
  ];

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
          <p className="text-gray-600">Find the perfect footwear for every occasion</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="group block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48 overflow-hidden rounded-t-lg">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {category.name}
                </h3>
                <p className="text-gray-500">{category.count} products</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
