// src/pages/Home.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchFeaturedProducts, fetchCategories, clearProductError } from '../redux/slices/productSlice';
import ProductCard from '../components/ProductCard';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';

const bannerImages = [
  '/banner1.png',
  '/banner2.png',
  '/banner3.png',
].map(img => ({ src: img, alt: 'ShoeMarkNet Banner' }));

const fallbackCategoryImage = '/assets/images/category-placeholder.jpg';

const Home = () => {
  const dispatch = useDispatch();
  const { featuredProducts, categories, loading, error } = useSelector((state) => state.product);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [isImagesLoaded, setIsImagesLoaded] = useState(false);

  // Rotate banners
  const rotateBanner = useCallback(() => {
    setBannerIndex((prevIndex) => (prevIndex + 1) % bannerImages.length);
  }, []);

  // Fetch data and set up banner rotation
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(fetchFeaturedProducts()).unwrap(),
          dispatch(fetchCategories()).unwrap()
        ]);
        setIsImagesLoaded(true);
      } catch (err) {
        toast.error(err.message || 'Failed to load home page data');
      }
    };

    fetchData();

    const interval = setInterval(rotateBanner, 5000);
    return () => {
      clearInterval(interval);
      dispatch(clearProductError());
    };
  }, [dispatch, rotateBanner]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error.message || 'An error occurred');
      dispatch(clearProductError());
    }
  }, [error, dispatch]);

  // Helpers
  const safelyGetFeaturedProducts = () => {
    if (!Array.isArray(featuredProducts)) return [];
    return featuredProducts.filter(product =>
      product && product._id && (product.images?.length > 0 || product.image)
    );
  };

  const safelyGetCategories = () => {
    if (!Array.isArray(categories)) return [];
    return categories.filter(category => category && category._id && category.name);
  };

  const currentBanner = bannerImages[bannerIndex];

  if (loading && !isImagesLoaded) {
    return <Loader />;
  }

  const validFeaturedProducts = safelyGetFeaturedProducts();
  const validCategories = safelyGetCategories();

  // Newsletter form handler
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    toast.info('Thank you for subscribing!');
    // Integrate with backend/email service as needed
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Banner Section */}
      <div className="relative h-[500px] mb-12 overflow-hidden rounded-xl shadow-lg">
        <img
          src={currentBanner.src}
          alt={currentBanner.alt}
          className="w-full h-full object-cover transition-transform duration-700"
          onError={e => {
            e.target.onerror = null;
            e.target.src = '/banner2.png';
          }}
        />
        
        {/* Banner navigation dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {bannerImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setBannerIndex(index)}
              className={`w-3 h-3 rounded-full border-2 border-white transition-colors duration-300 ${
                index === bannerIndex ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Featured Products Section */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Featured Products</h2>
          <Link to="/products" className="text-blue-600 hover:underline transition-colors">
            View All
          </Link>
        </div>
        {validFeaturedProducts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No featured products available at the moment</p>
            <Link to="/products" className="mt-4 inline-block text-blue-600 hover:underline">
              Browse all products instead
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {validFeaturedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Categories Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8">Shop by Category</h2>
        {validCategories.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Categories are being updated</p>
            <Link to="/products" className="mt-4 inline-block text-blue-600 hover:underline">
              Browse all products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {validCategories.map((category) => (
              <Link
                to={`/products?category=${encodeURIComponent(category.name)}`}
                key={category._id}
                className="relative h-64 rounded-lg overflow-hidden group shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <img
                  src={category.image || fallbackCategoryImage}
                  alt={`${category.name} category`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = fallbackCategoryImage;
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <h3 className="text-white text-2xl font-bold drop-shadow">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Promotional Section */}
      <section className="bg-gray-100 rounded-xl p-8 mb-16 shadow-md">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
            <h2 className="text-3xl font-bold mb-4">New Arrivals</h2>
            <p className="text-gray-700 mb-6">
              Check out our latest collection of premium footwear. Designed for comfort and style.
            </p>
            <Link to="/products?sort=newest">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 font-semibold shadow">
                Shop Now
              </button>
            </Link>
          </div>
          <div className="md:w-1/2">
            <img
              src="/banner1.png"
              alt="New Arrivals"
              className="rounded-lg shadow-lg w-full h-64 object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/assets/images/default-promotion.jpg';
              }}
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Sarah Johnson",
              role: "Verified Buyer",
              rating: 5,
              comment: "These shoes are incredibly comfortable and stylish. I've received so many compliments!"
            },
            {
              name: "Michael Chen",
              role: "Verified Buyer",
              rating: 5,
              comment: "Great quality and fast shipping. The shoes fit perfectly and look even better in person."
            },
            {
              name: "Emily Rodriguez",
              role: "Verified Buyer",
              rating: 4,
              comment: "Very happy with my purchase. The customer service was excellent when I needed to exchange sizes."
            }
          ].map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill={i < testimonial.rating ? "currentColor" : "none"}
                      stroke="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "{testimonial.comment}"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-4 flex items-center justify-center text-gray-600 font-bold">
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

      {/* Newsletter Section */}
      <section className="bg-blue-600 text-white rounded-xl p-8 shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Newsletter</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
            onSubmit={handleNewsletterSubmit}
          >
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-2 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Email address"
              required
            />
            <button
              type="submit"
              className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white font-semibold"
            >
              Subscribe
            </button>
          </form>
          <p className="mt-4 text-sm opacity-80">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
