// src/pages/Home.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';
import productService from '../services/productService';
import categoryService from '../services/categoryService';

// Dummy data configurations
const mockFeaturedProducts = [
  {
    _id: '1',
    name: 'Premium Running Shoes',
    price: 129.99,
    originalPrice: 199.99,
    images: ['/product1.jpg'],
    rating: 4.8,
    brand: 'SportFlex',
    description: 'High-performance running shoes with breathable mesh',
    stock: 50,
    discount: 35,
    isNew: false,
    createdAt: new Date().toISOString()
  },
  {
    _id: '2',
    name: 'Casual Leather Loafers',
    price: 89.99,
    originalPrice: 150.00,
    images: ['/product2.jpg'],
    rating: 4.5,
    brand: 'UrbanWalk',
    description: 'Genuine leather casual loafers',
    stock: 30,
    discount: 40,
    isNew: false,
    createdAt: new Date().toISOString()
  },
  {
    _id: '3',
    name: 'Athletic Sneakers',
    price: 99.00,
    originalPrice: 180.00,
    images: ['/product3.jpg'],
    rating: 4.9,
    brand: 'SportMax',
    description: 'Premium athletic sneakers for performance',
    stock: 25,
    discount: 45,
    isNew: false,
    createdAt: new Date().toISOString()
  },
  {
    _id: '4',
    name: 'Formal Dress Shoes',
    price: 159.99,
    originalPrice: 220.00,
    images: ['/product4.jpg'],
    rating: 4.7,
    brand: 'ElegantStep',
    description: 'Classic formal dress shoes',
    stock: 15,
    discount: 25,
    isNew: true,
    createdAt: new Date().toISOString()
  }
];

const mockCategories = [
  { 
    _id: '1', 
    name: 'Running', 
    image: '/category-running.jpg',
    icon: 'fa-running',
    color: 'from-blue-500 to-cyan-500'
  },
  { 
    _id: '2', 
    name: 'Casual', 
    image: '/category-casual.jpg',
    icon: 'fa-walking',
    color: 'from-purple-500 to-pink-500'
  },
  { 
    _id: '3', 
    name: 'Formal', 
    image: '/category-formal.jpg',
    icon: 'fa-user-tie',
    color: 'from-gray-700 to-gray-900'
  },
  { 
    _id: '4', 
    name: 'Sports', 
    image: '/category-sports.jpg',
    icon: 'fa-futbol',
    color: 'from-green-500 to-emerald-500'
  }
];

const promoOffers = [
  {
    id: 'weekend20',
    title: 'Weekend Flash Sale',
    description: 'Get 20% off on all products + Free shipping!',
    code: 'WEEKEND20',
    type: 'mega',
    gradient: 'from-orange-500 via-red-500 to-pink-600'
  },
  {
    id: 'freeship',
    title: 'Free Shipping',
    description: 'Free shipping on orders over $75',
    code: 'FREESHIP',
    icon: 'fa-shipping-fast',
    color: 'from-blue-600 to-cyan-600'
  },
  {
    id: 'vip3free',
    title: 'VIP Deal',
    description: 'Buy 2 get 1 free on selected items',
    code: 'VIP3FREE',
    icon: 'fa-crown',
    color: 'from-purple-600 to-pink-600'
  },
  {
    id: 'welcome15',
    title: 'First Order',
    description: '15% off your first purchase',
    code: 'WELCOME15',
    icon: 'fa-user-plus',
    color: 'from-green-600 to-emerald-600'
  }
];

const fallbackCategoryImage = '/assets/images/category-placeholder.jpg';

const Home = () => {
  const [bannerIndex, setBannerIndex] = useState(0);
  const [isImagesLoaded, setIsImagesLoaded] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [countdown, setCountdown] = useState({
    days: '07',
    hours: '15',
    minutes: '23',
    seconds: '42'
  });

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch featured products
        const featuredResponse = await productService.getFeaturedProducts();
        setFeaturedProducts(featuredResponse.products || featuredResponse || []);
        
        // Fetch categories
        const categoriesResponse = await categoryService.getCategories();
        setCategories(categoriesResponse.categories || categoriesResponse || []);
        
        setIsImagesLoaded(true);
      } catch (err) {
        console.error('Failed to load data:', err);
        // Fallback to mock data if API fails
        toast.warning('Using demo data - API not available');
        setFeaturedProducts(mockFeaturedProducts);
        setCategories(mockCategories);
        setIsImagesLoaded(true);
      }
    };
    
    loadData();
  }, []);

  // Countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextWeekend = new Date();
      nextWeekend.setDate(now.getDate() + (7 - now.getDay()));
      nextWeekend.setHours(23, 59, 59, 999);

      const distance = nextWeekend.getTime() - now.getTime();

      if (distance < 0) {
        nextWeekend.setDate(nextWeekend.getDate() + 7);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown({
        days: days.toString().padStart(2, '0'),
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0')
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Product carousel navigation
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(featuredProducts.length / 4));
  }, [featuredProducts.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => prev === 0 ? Math.ceil(featuredProducts.length / 4) - 1 : prev - 1);
  }, [featuredProducts.length]);

  // Auto-rotate carousel
  useEffect(() => {
    if (featuredProducts.length > 4) {
      const interval = setInterval(nextSlide, 5000);
      return () => clearInterval(interval);
    }
  }, [nextSlide, featuredProducts.length]);

  const copyPromoCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      toast.success(`Promo code "${code}" copied to clipboard!`);
    }).catch(() => {
      toast.error('Failed to copy code');
    });
  };

  if (!isImagesLoaded) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Enhanced Hero Section */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 animate-gradient-x"></div>
        
        {/* Interactive Particles */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
            <div className="text-center lg:text-left">
              {/* AI Badge */}
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-lg border border-white/20 text-white rounded-full px-6 py-3 mb-8">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <i className="fas fa-sparkles text-yellow-400"></i>
                <span className="text-sm font-medium">AI-Powered Shopping</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="block text-white">Discover</span>
                <span className="block bg-gradient-to-r from-yellow-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  Premium Shoes
                </span>
                <span className="block text-white">at Lightning Speed</span>
              </h1>

              {/* Enhanced Subtitle */}
              <h2 className="text-xl lg:text-3xl font-semibold mb-6 text-blue-100">
                <i className="fas fa-fire mr-2"></i>Save up to 75% with AI-Curated Deals
              </h2>

              {/* Interactive Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8 text-center">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
                  <div className="text-2xl font-bold text-white">
                    <i className="fas fa-users text-blue-300 mb-2"></i>
                    <br />10k+
                  </div>
                  <div className="text-sm text-blue-100">Happy Customers</div>
                </div>
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
                  <div className="text-2xl font-bold text-white">
                    <i className="fas fa-shipping-fast text-green-300 mb-2"></i>
                    <br />24h
                  </div>
                  <div className="text-sm text-blue-100">Fast Delivery</div>
                </div>
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
                  <div className="text-2xl font-bold text-white">
                    <i className="fas fa-star text-yellow-300 mb-2"></i>
                    <br />4.9★
                  </div>
                  <div className="text-sm text-blue-100">Rating</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transform hover:scale-105 transition-all duration-200 shadow-2xl"
                >
                  <i className="fas fa-rocket mr-3"></i>
                  Start Shopping
                  <i className="fas fa-arrow-right ml-3"></i>
                </Link>
                <button
                  onClick={() => document.getElementById('offers')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-lg border-2 border-white text-white font-bold rounded-2xl hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-200"
                >
                  <i className="fas fa-gift mr-3"></i>
                  View Deals
                </button>
              </div>

              {/* Countdown Timer */}
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
                <h3 className="text-lg font-bold mb-4 text-center text-white flex items-center justify-center">
                  <i className="fas fa-clock mr-2 text-yellow-400"></i>
                  <i className="fas fa-bolt mr-2"></i>Flash Sale Ends In:
                </h3>
                <div className="grid grid-cols-4 gap-3 text-center">
                  {Object.entries(countdown).map(([key, value]) => (
                    <div key={key} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-3">
                      <div className="text-2xl lg:text-3xl font-bold text-white">{value}</div>
                      <div className="text-xs lg:text-sm text-blue-100 capitalize">{key === 'minutes' ? 'Min' : key === 'seconds' ? 'Sec' : key}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hero Product Showcase */}
            <div className="relative">
              {featuredProducts.length > 0 && (
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl overflow-hidden shadow-2xl mb-6">
                  <div className="relative">
                    <img
                      src={featuredProducts[0].images[0] || '/product-placeholder.jpg'}
                      alt={featuredProducts[0].name}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold px-3 py-1 rounded-full animate-pulse">
                      <i className="fas fa-percentage mr-1"></i>{featuredProducts[0].discount}% OFF
                    </div>
                  </div>
                  <div className="p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">{featuredProducts[0].name}</h3>
                    <div className="flex items-center mb-3">
                      <div className="flex text-yellow-400 mr-2">
                        {[...Array(5)].map((_, i) => (
                          <i key={i} className={`fas ${i < Math.floor(featuredProducts[0].rating) ? 'fa-star' : i < featuredProducts[0].rating ? 'fa-star-half-alt' : 'fa-star'} ${i >= Math.floor(featuredProducts[0].rating) && i >= featuredProducts[0].rating ? 'far' : ''}`}></i>
                        ))}
                      </div>
                      <span className="text-sm">({featuredProducts[0].rating})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold">${featuredProducts[0].price}</span>
                        <span className="text-lg line-through text-gray-300 ml-2">${featuredProducts[0].originalPrice}</span>
                      </div>
                      <button className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-2 px-4 rounded-xl transition-all duration-200">
                        <i className="fas fa-cart-plus mr-2"></i>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Product Grid */}
              <div className="grid grid-cols-2 gap-4">
                {featuredProducts.slice(1, 3).map((product) => (
                  <div key={product._id} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 text-white">
                    <img
                      src={product.images[0] || '/product-placeholder.jpg'}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h4 className="font-bold text-sm">{product.name}</h4>
                    <p className="text-blue-300 font-bold">${product.price}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Featured Products with Carousel */}
      <section className="py-20 bg-white dark:bg-gray-900 relative overflow-hidden">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full px-6 py-3 mb-6">
              <i className="fas fa-star animate-pulse"></i>
              <span className="text-sm font-medium">Featured Collection</span>
            </div>

            <h2 className="text-4xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Trending</span> Now
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              <i className="fas fa-truck mr-2"></i>Discover premium shoes with exclusive discounts and lightning-fast delivery
            </p>
          </div>

          {/* Carousel Controls */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={prevSlide}
                className="w-12 h-12 bg-white/10 backdrop-blur-lg border border-gray-200 dark:border-gray-700 rounded-2xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <button
                onClick={nextSlide}
                className="w-12 h-12 bg-white/10 backdrop-blur-lg border border-gray-200 dark:border-gray-700 rounded-2xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
            <Link to="/products" className="text-blue-600 hover:underline font-medium">
              View All Products
            </Link>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div key={product._id} className="group">
                <div className="bg-white/10 backdrop-blur-lg border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  <div className="relative">
                    <img
                      src={product.images[0] || '/product-placeholder.jpg'}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {product.discount && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        <i className="fas fa-percentage mr-1"></i>{product.discount}%
                      </div>
                    )}
                    {product.isNew && (
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        <i className="fas fa-sparkles mr-1"></i>NEW
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{product.name}</h3>
                    <div className="flex items-center mb-3">
                      <div className="flex text-yellow-400 text-sm">
                        {[...Array(5)].map((_, i) => (
                          <i key={i} className={`fas ${i < Math.floor(product.rating) ? 'fa-star' : i < product.rating ? 'fa-star-half-alt' : 'fa-star'} ${i >= Math.floor(product.rating) && i >= product.rating ? 'far' : ''}`}></i>
                        ))}
                      </div>
                      <span className="text-gray-600 dark:text-gray-400 ml-2 text-sm">({product.rating})</span>
                    </div>
                    <div className="flex items-center mb-4">
                      <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-gray-500 line-through ml-2">${product.originalPrice}</span>
                      )}
                    </div>
                    <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200">
                      <i className="fas fa-cart-plus mr-2"></i>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Categories Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              <i className="fas fa-compass mr-4"></i>Explore Categories
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              <i className="fas fa-search mr-2"></i>Find exactly what you're looking for in our curated collections
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <Link
                key={category._id}
                to={`/products?category=${encodeURIComponent(category.name)}`}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl overflow-hidden hover:scale-105 transition-all duration-500 group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={category.image || fallbackCategoryImage}
                    alt={`${category.name} category`}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = fallbackCategoryImage;
                    }}
                  />
                </div>
                <div className="p-8 text-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <i className={`fas ${category.icon} text-2xl text-white`}></i>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{category.name}</h3>
                  <p className="text-blue-100 mb-6">Premium {category.name.toLowerCase()} collection</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Offers Section */}
      <section id="offers" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
              Exclusive
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                <i className="fas fa-tags mr-2"></i>Deals
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              <i className="fas fa-discount mr-2"></i>Get the best prices on premium shoes with our exclusive discount codes
            </p>
          </div>

          {/* Mega Deal */}
          {promoOffers.filter(offer => offer.type === 'mega').map(offer => (
            <div key={offer.id} className={`bg-gradient-to-r ${offer.gradient} rounded-3xl p-12 text-white text-center mb-16`}>
              <h3 className="text-4xl lg:text-5xl font-bold mb-6">
                <i className="fas fa-fire mr-4"></i>{offer.title}
              </h3>
              <p className="text-2xl mb-8 text-orange-100 font-medium">
                <i className="fas fa-gift mr-2"></i>{offer.description}
              </p>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl px-8 py-4 inline-block mb-8">
                <span className="font-mono text-3xl font-bold">{offer.code}</span>
              </div>
              <br />
              <button
                onClick={() => copyPromoCode(offer.code)}
                className="bg-white text-orange-600 hover:bg-orange-50 font-bold px-10 py-4 rounded-2xl transition-all duration-200 text-lg"
              >
                <i className="fas fa-copy mr-3"></i>
                Copy Code
              </button>
            </div>
          ))}

          {/* Other Offers */}
          <div className="grid md:grid-cols-3 gap-8">
            {promoOffers.filter(offer => offer.type !== 'mega').map((offer, index) => (
              <div key={offer.id} className="bg-white/10 backdrop-blur-lg border border-gray-200 dark:border-gray-700 rounded-3xl p-8 hover:scale-105 transition-all duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center mb-8 mx-auto">
                  <i className={`fas ${offer.icon} text-3xl text-blue-600 dark:text-blue-400`}></i>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white text-center">{offer.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">{offer.description}</p>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-6 py-3 text-center mb-8">
                  <span className="font-mono font-bold text-gray-900 dark:text-white text-lg">{offer.code}</span>
                </div>
                <button
                  onClick={() => copyPromoCode(offer.code)}
                  className={`w-full bg-gradient-to-r ${offer.color} hover:opacity-90 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200`}
                >
                  <i className="fas fa-copy mr-2"></i>
                  Copy Code
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Customer Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Verified Buyer",
                rating: 5,
                comment: "The shoes are incredibly comfortable and stylish! Best purchase I've made.",
                avatar: "SJ"
              },
              {
                name: "Mike Chen",
                role: "Premium Member",
                rating: 5,
                comment: "Fast delivery and excellent quality. Highly recommend this store!",
                avatar: "MC"
              },
              {
                name: "Emma Davis",
                role: "Fashion Blogger",
                rating: 4,
                comment: "Great variety and competitive prices. My go-to shoe store now.",
                avatar: "ED"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-lg border border-gray-200 dark:border-gray-700 p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
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
                <p className="text-gray-700 dark:text-gray-300 mb-4">"{testimonial.comment}"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-4 flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Newsletter */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full px-6 py-3 mb-8">
              <i className="fas fa-envelope text-yellow-400"></i>
              <span className="text-sm font-medium">Stay Updated</span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Join Our Newsletter</h2>
            <p className="text-xl text-blue-100 mb-8">Get exclusive deals, new arrivals, and style tips delivered to your inbox</p>
            
            <form 
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-8"
              onSubmit={(e) => {
                e.preventDefault();
                toast.success('Thank you for subscribing! Welcome to our community!');
              }}
            >
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-grow px-6 py-4 rounded-2xl text-gray-900 bg-white/90 backdrop-blur-lg border border-white/20 focus:outline-none focus:ring-4 focus:ring-white/30"
                required
              />
              <button
                type="submit"
                className="bg-white text-blue-600 px-8 py-4 rounded-2xl hover:bg-blue-50 transition-all duration-200 font-bold whitespace-nowrap"
              >
                <i className="fas fa-paper-plane mr-2"></i>
                Subscribe
              </button>
            </form>
            
            <div className="flex items-center justify-center space-x-8 text-blue-100">
              <div className="flex items-center">
                <i className="fas fa-shield-alt mr-2"></i>
                <span className="text-sm">Privacy Protected</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-times-circle mr-2"></i>
                <span className="text-sm">Unsubscribe Anytime</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-gift mr-2"></i>
                <span className="text-sm">Exclusive Offers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add custom styles */}
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-10px) rotate(1deg);
          }
          66% {
            transform: translateY(-5px) rotate(-1deg);
          }
        }
        
        .animate-gradient-x {
          background-size: 400% 400%;
          animation: gradient-x 15s ease infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;
