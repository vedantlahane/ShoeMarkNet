// src/pages/Home.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';

// Dummy data configurations
const mockFeaturedProducts = [
  {
    _id: '1',
    name: 'Premium Running Shoes',
    price: 129.99,
    images: ['/product1.jpg'],
    rating: 4.8,
    brand: 'SportFlex',
    description: 'High-performance running shoes with breathable mesh',
    stock: 50,
    createdAt: new Date().toISOString()
  },
  {
    _id: '2',
    name: 'Casual Leather Loafers',
    price: 89.99,
    image: '/product2.jpg',
    rating: 4.5,
    brand: 'UrbanWalk',
    description: 'Genuine leather casual loafers',
    stock: 30,
    createdAt: new Date().toISOString()
  }
];

const mockCategories = [
  { _id: '1', name: 'Running', image: '/category-running.jpg' },
  { _id: '2', name: 'Casual', image: '/category-casual.jpg' },
  { _id: '3', name: 'Formal', image: '/category-formal.jpg' }
];

const bannerImages = [
  '/banner1.png',
  '/banner2.png',
  '/banner3.png',
].map(img => ({ src: img, alt: 'ShoeMarkNet Banner' }));

const fallbackCategoryImage = '/assets/images/category-placeholder.jpg';

const Home = () => {
  const [bannerIndex, setBannerIndex] = useState(0);
  const [isImagesLoaded, setIsImagesLoaded] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Simulate data loading
  useEffect(() => {
    const loadDummyData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setFeaturedProducts(mockFeaturedProducts);
        setCategories(mockCategories);
        setIsImagesLoaded(true);
      } catch (err) {
        toast.error('Failed to load dummy data');
      }
    };
    
    loadDummyData();
  }, []);

  // Banner rotation logic
  const rotateBanner = useCallback(() => {
    setBannerIndex((prev) => (prev + 1) % bannerImages.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(rotateBanner, 5000);
    return () => clearInterval(interval);
  }, [rotateBanner]);

  if (!isImagesLoaded) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Banner */}
      <div className="relative h-[500px] mb-12 overflow-hidden rounded-xl shadow-lg">
        <img
          src={bannerImages[bannerIndex].src}
          alt={bannerImages[bannerIndex].alt}
          className="w-full h-full object-cover transition-transform duration-700"
        />
        
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {bannerImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setBannerIndex(index)}
              className={`w-3 h-3 rounded-full border-2 border-white ${
                index === bannerIndex ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Featured Products</h2>
          <Link to="/products" className="text-blue-600 hover:underline">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8">Shop by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              to={`/products?category=${encodeURIComponent(category.name)}`}
              key={category._id}
              className="relative h-64 rounded-lg overflow-hidden group shadow-md hover:shadow-xl transition-shadow"
            >
              <img
                src={category.image || fallbackCategoryImage}
                alt={`${category.name} category`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = fallbackCategoryImage;
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Customer Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Sarah Johnson",
              role: "Verified Buyer",
              rating: 5,
              comment: "The shoes are incredibly comfortable and stylish!"
            }
          ].map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="h-5 w-5 text-yellow-400"
                    fill={i < testimonial.rating ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4">"{testimonial.comment}"</p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-4 flex items-center justify-center">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-blue-600 text-white rounded-xl p-8 shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Newsletter</h2>
          <form 
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
            onSubmit={(e) => {
              e.preventDefault();
              toast.info('Thank you for subscribing!');
            }}
          >
            <input
              type="email"
              placeholder="Your email"
              className="flex-grow px-4 py-2 rounded-md text-gray-900"
              required
            />
            <button
              type="submit"
              className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              Subscribe
            </button>
          </form>
          <p className="mt-4 text-sm opacity-80">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
