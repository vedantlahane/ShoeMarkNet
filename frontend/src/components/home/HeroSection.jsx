import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { addToCart } from '../../redux/slices/cartSlice';
import { 
  ShoppingBag, 
  Star, 
  ArrowRight, 
  Zap, 
  Users, 
  Clock, 
  Gift,
  Sparkles,
  TrendingUp
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const HeroSection = () => {
  const dispatch = useDispatch();
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const particlesRef = useRef(null);
  const productRef = useRef(null);
  const statsRef = useRef([]);

  const [timeLeft, setTimeLeft] = useState({
    days: 7,
    hours: 15,
    minutes: 23,
    seconds: 42
  });

  const [isLoaded, setIsLoaded] = useState(false);

  // Animated statistics
  const stats = [
    { icon: Users, value: '50K+', label: 'Happy Customers', color: 'text-blue-400' },
    { icon: Zap, value: '24h', label: 'Fast Delivery', color: 'text-yellow-400' },
    { icon: Star, value: '4.9★', label: 'Rating', color: 'text-pink-400' },
    { icon: TrendingUp, value: '99%', label: 'Satisfaction', color: 'text-green-400' }
  ];

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else if (days > 0) {
          days--;
          hours = 23;
          minutes = 59;
          seconds = 59;
        }

        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // GSAP Animations
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.5 });
    
    // Animate background gradient
    gsap.to('.hero-bg', {
      backgroundPosition: '200% center',
      duration: 20,
      ease: 'none',
      repeat: -1
    });

    // Create floating particles animation
    const createParticles = () => {
      if (particlesRef.current) {
        for (let i = 0; i < 50; i++) {
          const particle = document.createElement('div');
          particle.className = 'absolute rounded-full bg-white/20 pointer-events-none';
          const size = Math.random() * 8 + 2;
          particle.style.width = `${size}px`;
          particle.style.height = `${size}px`;
          particle.style.left = `${Math.random() * 100}%`;
          particle.style.top = `${Math.random() * 100}%`;
          
          particlesRef.current.appendChild(particle);
          
          // Animate particles
          gsap.to(particle, {
            y: -100,
            x: Math.random() * 100 - 50,
            opacity: 0,
            duration: Math.random() * 3 + 2,
            repeat: -1,
            delay: Math.random() * 2,
            ease: 'none'
          });
        }
      }
    };

    // Hero entrance animations
    tl.fromTo(titleRef.current, 
      { y: 100, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1.2, ease: 'power4.out' }
    )
    .fromTo(subtitleRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
      '-=0.8'
    )
    .fromTo(statsRef.current,
      { y: 30, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.7)' },
      '-=0.4'
    )
    .fromTo(ctaRef.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
      '-=0.3'
    )
    .fromTo(productRef.current,
      { x: 100, opacity: 0, rotationY: -15 },
      { x: 0, opacity: 1, rotationY: 0, duration: 1.2, ease: 'power4.out' },
      '-=1'
    );

    createParticles();
    setIsLoaded(true);

    // Scroll-triggered animations
    ScrollTrigger.create({
      trigger: heroRef.current,
      start: 'top center',
      end: 'bottom center',
      scrub: 1,
      onUpdate: (self) => {
        gsap.to('.hero-content', {
          y: -50 * self.progress,
          opacity: 1 - self.progress * 0.5,
          duration: 0.3
        });
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const handleAddToCart = (product) => {
    dispatch(addToCart({
      productId: product.id,
      quantity: 1,
      product
    }));

    // Add to cart animation
    gsap.to('.add-to-cart-btn', {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut'
    });
  };

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const headerHeight = 80;
      const elementPosition = section.offsetTop - headerHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Animated Background */}
      <div className="hero-bg absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 bg-[length:200%_200%]">
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Floating Particles */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none"></div>

      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 glass opacity-10"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Hero Content */}
          <div className="hero-content text-center lg:text-left">
            
            {/* Premium Badge */}
            <div className="inline-flex items-center space-x-2 glass-card px-6 py-3 mb-8 animate-float">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <Sparkles size={16} className="text-yellow-400" />
              <span className="text-sm font-semibold text-white">AI-Powered Shopping Experience</span>
            </div>

            {/* Main Heading */}
            <div ref={titleRef} className="mb-6">
              <h1 className="text-5xl lg:text-7xl font-heading font-bold leading-tight">
                <span className="block text-white">Discover Your</span>
                <span className="block gradient-text bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent animate-gradient-shift">
                  Perfect Style
                </span>
                <span className="block text-white">Today</span>
              </h1>
            </div>

            {/* Subtitle */}
            <div ref={subtitleRef} className="mb-8">
              <p className="text-xl lg:text-2xl text-blue-100 max-w-lg mx-auto lg:mx-0">
                Premium footwear collection with up to <span className="font-bold text-yellow-400">75% off</span> and lightning-fast delivery.
              </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div
                    key={index}
                    ref={el => statsRef.current[index] = el}
                    className="glass-card p-4 text-center hover-lift cursor-pointer"
                  >
                    <IconComponent size={24} className={`${stat.color} mx-auto mb-2`} />
                    <div className="text-2xl lg:text-3xl font-bold text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs lg:text-sm text-blue-100">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Buttons */}
            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 mb-8 justify-center lg:justify-start">
              <button
                onClick={() => scrollToSection('featured')}
                className="btn-premium inline-flex items-center justify-center space-x-3 hover-scale group"
              >
                <ShoppingBag size={20} />
                <span>Start Shopping</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              
              <button
                onClick={() => scrollToSection('offers')}
                className="btn-glass inline-flex items-center justify-center space-x-3 text-white hover:text-white hover-scale group"
              >
                <Gift size={20} />
                <span>View Deals</span>
              </button>
            </div>

            {/* Countdown Timer */}
            <div className="glass-card max-w-md mx-auto lg:mx-0">
              <div className="flex items-center justify-center mb-4 space-x-2">
                <Clock size={20} className="text-yellow-400" />
                <Zap size={16} className="text-pink-400" />
                <span className="text-lg font-bold text-white">Flash Sale Ends In</span>
              </div>
              
              <div className="grid grid-cols-4 gap-3">
                {[
                  { value: timeLeft.days, label: 'Days' },
                  { value: timeLeft.hours, label: 'Hours' },
                  { value: timeLeft.minutes, label: 'Min' },
                  { value: timeLeft.seconds, label: 'Sec' }
                ].map((time, index) => (
                  <div key={index} className="glass text-center p-3 rounded-xl animate-pulse-glow">
                    <div className="text-2xl lg:text-3xl font-bold text-white">
                      {time.value.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs text-blue-100">
                      {time.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hero Product Showcase */}
          <div ref={productRef} className="relative">
            
            {/* Main Featured Product */}
            <div className="card-premium overflow-hidden mb-6 hover-lift">
              <div className="relative">
                <img
                  src="/api/placeholder/600/400"
                  alt="Premium Sneakers Collection"
                  className="w-full h-64 lg:h-80 object-cover transition-transform duration-700 hover:scale-110"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop';
                  }}
                />
                
                {/* Floating discount badge */}
                <div className="absolute top-4 right-4 bg-gradient-secondary px-4 py-2 rounded-full text-white font-bold animate-bounce-in">
                  <span className="text-sm">-35% OFF</span>
                </div>

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-6 text-white w-full">
                    <p className="text-sm mb-2">Limited Time Offer</p>
                    <button className="btn-premium w-full add-to-cart-btn">
                      Quick Add to Cart
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-current" />
                  ))}
                  <span className="text-sm text-gray-300">(4.9)</span>
                </div>
                
                <h3 className="text-xl lg:text-2xl font-bold text-white mb-2">
                  Premium Athletic Collection
                </h3>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl font-bold text-white">$129.99</span>
                    <span className="text-lg text-gray-400 line-through">$199.99</span>
                  </div>
                  
                  <button
                    onClick={() => handleAddToCart({
                      id: 'hero-premium-1',
                      name: 'Premium Athletic Collection',
                      price: 129.99,
                      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop'
                    })}
                    className="btn-premium text-sm px-6 py-2 add-to-cart-btn"
                  >
                    <ShoppingBag size={16} className="mr-2" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Product Grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  id: 'hero-2',
                  name: 'Sport Runners',
                  price: 89.99,
                  image: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?q=80&w=300&auto=format&fit=crop'
                },
                {
                  id: 'hero-3',
                  name: 'Classic Lifestyle',
                  price: 119.99,
                  image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=300&auto=format&fit=crop'
                }
              ].map((product) => (
                <div key={product.id} className="glass-card p-4 hover-lift">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-lg mb-3 transition-transform duration-300 hover:scale-105"
                  />
                  <h4 className="font-semibold text-white text-sm mb-2">
                    {product.name}
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-400">
                      ${product.price}
                    </span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="text-white hover:text-cyan-400 transition-colors duration-200"
                    >
                      <ShoppingBag size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
