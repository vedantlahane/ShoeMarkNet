import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaHeart, FaEye, FaStars } from 'react-icons/fa';
import ProductCard from '../products/ProductCard';

const FeaturedProducts = ({ 
  limit = 8,
  category = null,
  className = "" 
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoading(true);
      try {
        // Mock data - replace with actual API call
        const mockProducts = [
          {
            id: 1,
            name: "Nike Air Force 1",
            brand: "Nike",
            price: 110,
            originalPrice: 130,
            rating: 4.5,
            reviewCount: 234,
            image: "/assets/product1.png",
            category: "sneakers",
            featured: true,
            inStock: true,
            colors: ['white', 'black', 'red'],
            sizes: [8, 9, 10, 11, 12]
          },
          {
            id: 2,
            name: "Adidas Ultraboost 22",
            brand: "Adidas",
            price: 180,
            originalPrice: 200,
            rating: 4.7,
            reviewCount: 156,
            image: "/assets/product2.png",
            category: "running",
            featured: true,
            inStock: true,
            colors: ['black', 'blue', 'grey'],
            sizes: [8, 9, 10, 11]
          },
          {
            id: 3,
            name: "Jordan Retro 1",
            brand: "Jordan",
            price: 170,
            originalPrice: 170,
            rating: 4.8,
            reviewCount: 423,
            image: "/assets/product3.png",
            category: "basketball",
            featured: true,
            inStock: false,
            colors: ['red', 'black', 'white'],
            sizes: [9, 10, 11, 12]
          },
          {
            id: 4,
            name: "Puma RS-X",
            brand: "Puma",
            price: 90,
            originalPrice: 120,
            rating: 4.2,
            reviewCount: 87,
            image: "/assets/product4.png",
            category: "lifestyle",
            featured: true,
            inStock: true,
            colors: ['white', 'multicolor'],
            sizes: [8, 9, 10, 11, 12]
          },
          {
            id: 5,
            name: "Converse Chuck Taylor",
            brand: "Converse",
            price: 65,
            originalPrice: 65,
            rating: 4.3,
            reviewCount: 312,
            image: "/assets/product5.png",
            category: "casual",
            featured: true,
            inStock: true,
            colors: ['black', 'white', 'red'],
            sizes: [7, 8, 9, 10, 11]
          },
          {
            id: 6,
            name: "New Balance 990v5",
            brand: "New Balance",
            price: 185,
            originalPrice: 185,
            rating: 4.6,
            reviewCount: 198,
            image: "/assets/product6.png",
            category: "running",
            featured: true,
            inStock: true,
            colors: ['grey', 'navy'],
            sizes: [8, 9, 10, 11, 12]
          },
          {
            id: 7,
            name: "Vans Old Skool",
            brand: "Vans",
            price: 60,
            originalPrice: 60,
            rating: 4.4,
            reviewCount: 267,
            image: "/assets/product7.png",
            category: "skate",
            featured: true,
            inStock: true,
            colors: ['black', 'white', 'checkered'],
            sizes: [7, 8, 9, 10, 11, 12]
          },
          {
            id: 8,
            name: "Reebok Classic",
            brand: "Reebok",
            price: 75,
            originalPrice: 90,
            rating: 4.1,
            reviewCount: 143,
            image: "/assets/product8.png",
            category: "lifestyle",
            featured: true,
            inStock: true,
            colors: ['white', 'black'],
            sizes: [8, 9, 10, 11]
          }
        ];

        // Filter by category if specified
        let filteredProducts = mockProducts;
        if (category) {
          filteredProducts = mockProducts.filter(product => 
            product.category.toLowerCase() === category.toLowerCase()
          );
        }

        // Limit results
        const limitedProducts = filteredProducts.slice(0, limit);
        
        setProducts(limitedProducts);
      } catch (err) {
        setError('Failed to load featured products');
        console.error('Error fetching featured products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, [limit, category]);

  if (loading) {
    return (
      <section className={`featured-products ${className}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`featured-products ${className}`}>
        <div className="container mx-auto px-4 text-center py-12">
          <div className="text-red-600 mb-4">
            <FaStars className="mx-auto text-4xl mb-2" />
            <p>{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={`featured-products py-12 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <FaStars className="text-yellow-500 mr-3" />
            Featured Products
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our hand-picked selection of the latest and greatest footwear from top brands
          </p>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showQuickActions={true}
                showAddToCart={true}
                showWishlist={true}
                className="featured-product-card"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaShoppingCart className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No Featured Products
            </h3>
            <p className="text-gray-500">
              Check back soon for amazing featured deals!
            </p>
          </div>
        )}

        {/* View All Button */}
        {products.length >= limit && (
          <div className="text-center mt-12">
            <a
              href="/products"
              className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <FaEye className="mr-2" />
              View All Products
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
