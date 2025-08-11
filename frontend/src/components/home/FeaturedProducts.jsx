import React, { useState, useEffect } from 'react';
import ProductCard from '../products/ProductCard';

const FeaturedProducts = ({ limit = 8 }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      // Simple mock data - just what's needed
      const mockProducts = [
        {
          id: 1,
          name: "Nike Air Force 1",
          brand: "Nike",
          price: 110,
          originalPrice: 130,
          rating: 4.5,
          image: "/assets/product1.png",
          inStock: true
        },
        {
          id: 2,
          name: "Adidas Ultraboost 22",
          brand: "Adidas",
          price: 180,
          originalPrice: 200,
          rating: 4.7,
          image: "/assets/product2.png",
          inStock: true
        },
        {
          id: 3,
          name: "Jordan Retro 1",
          brand: "Jordan",
          price: 170,
          rating: 4.8,
          image: "/assets/product3.png",
          inStock: false
        }
      ];

      // Simulate API delay
      setTimeout(() => {
        setProducts(mockProducts.slice(0, limit));
        setLoading(false);
      }, 500);
    };

    fetchProducts();
  }, [limit]);

  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
          <p className="text-gray-600">Discover our hand-picked selection of premium footwear</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
