// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchFeaturedProducts, fetchCategories } from '../redux/slices/productSlice';
import ProductCard from '../components/ProductCard';
import Loader from '../components/common/Loader';

// If you have images in "public/assets/images", you can directly use '/assets/images/...' path
const bannerImages = [
  '/assets/images/banner1.jpg',
  '/assets/images/banner2.jpg',
  '/assets/images/banner3.jpg',
];

const Home = () => {
  const dispatch = useDispatch();
  const { featuredProducts, categories, loading } = useSelector((state) => state.product);
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
    dispatch(fetchCategories());

    const interval = setInterval(() => {
      setBannerIndex((prevIndex) => (prevIndex + 1) % bannerImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [dispatch]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Banner Section */}
      <div className="relative h-[500px] mb-12 overflow-hidden rounded-xl">
        <img 
          src={bannerImages[bannerIndex]} 
          alt="ShoeMarkNet Banner" 
          className="w-full h-full object-cover transition-opacity duration-500"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-white p-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-center">Step Into Style</h1>
          <p className="text-xl md:text-2xl mb-8 text-center max-w-2xl">
            Discover the perfect pair for every occasion
          </p>
          <Link to="/products">
            <button className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition">
              Shop Now
            </button>
          </Link>
        </div>
      </div>

      {/* Featured Products Section */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Featured Products</h2>
          <Link to="/products" className="text-primary hover:underline">
            View All
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <p className="text-center text-gray-500">No featured products available</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Categories Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8">Shop by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link 
              to={`/products?category=${category.name}`} 
              key={category._id} 
              className="relative h-64 rounded-lg overflow-hidden group"
            >
              <img 
                src={category.image} 
                alt={category.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Promotional Section */}
      <section className="bg-gray-100 rounded-xl p-8 mb-16">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
            <h2 className="text-3xl font-bold mb-4">New Arrivals</h2>
            <p className="text-gray-700 mb-6">
              Check out our latest collection of premium footwear. Designed for comfort and style.
            </p>
            <Link to="/products?sort=newest">
              <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition">
                Shop Now
              </button>
            </Link>
          </div>
          <div className="md:w-1/2">
            <img 
              src="/assets/images/new-arrivals.jpg" 
              alt="New Arrivals" 
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-4"></div>
                <div>
                  <p className="font-semibold">Customer Name</p>
                  <p className="text-sm text-gray-500">Verified Buyer</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-primary text-white rounded-xl p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Newsletter</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-2 rounded-md text-gray-900 focus:outline-none"
              required
            />
            <button
              type="submit"
              className="bg-white text-primary px-4 py-2 rounded-md hover:bg-gray-200 transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;
