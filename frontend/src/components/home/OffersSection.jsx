import React, { memo, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Tag, Sparkles } from 'lucide-react';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

const OffersSection = memo(() => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const enableAnimations = !prefersReducedMotion;
  const shimmerClass = enableAnimations ? 'animate-gradient' : '';
  const pulseClass = enableAnimations ? 'animate-pulse-slow' : '';
  const floatClass = enableAnimations ? 'animate-bounce-slow' : '';
  const underlineClass = enableAnimations ? 'after:w-full after:opacity-100' : 'after:w-full after:opacity-40';
  const [hoveredOffer, setHoveredOffer] = useState(null);

  const offers = useMemo(() => ([
    {
      id: 1,
      title: 'Summer Sale',
      description: 'Up to 50% off on all summer footwear',
      discount: '50%',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=600&auto=format&fit=crop',
      link: '/sale',
      badge: 'Limited Time'
    },
    {
      id: 2,
      title: 'New Arrivals',
      description: 'Latest collection of premium shoes',
      discount: '25%',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop',
      link: '/new-arrivals',
      badge: 'Fresh Stock'
    }
  ]), []);

  const handlePointerMove = useCallback((event, offerId) => {
    if (!enableAnimations) {
      return;
    }

    setHoveredOffer(prev => (prev === offerId ? prev : offerId));
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return;
    }

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--hover-x', `${x}%`);
    card.style.setProperty('--hover-y', `${y}%`);
  }, [enableAnimations]);

  const handlePointerLeave = useCallback((event) => {
    setHoveredOffer(null);
    if (!enableAnimations) {
      return;
    }

    const card = event.currentTarget;
    card.style.removeProperty('--hover-x');
    card.style.removeProperty('--hover-y');
  }, [enableAnimations]);

  const handleFocus = useCallback((event, offerId) => {
    setHoveredOffer(offerId);
    if (!enableAnimations) {
      return;
    }

    const card = event.currentTarget;
    card.style.setProperty('--hover-x', '50%');
    card.style.setProperty('--hover-y', '50%');
  }, [enableAnimations]);

  return (
    <section 
      id="offers"
      className="relative overflow-hidden py-16 md:py-20 bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950"
      aria-label="Special offers and deals"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className={`absolute -top-24 left-10 h-60 w-60 rounded-full bg-gradient-to-br from-blue-400/20 via-indigo-400/20 to-purple-400/20 blur-3xl ${pulseClass}`}></div>
        <div className={`absolute bottom-[-5rem] right-16 h-64 w-64 rounded-full bg-gradient-to-br from-violet-500/15 via-purple-500/10 to-pink-500/10 blur-3xl ${pulseClass}`} style={{ animationDelay: '1.4s' }}></div>
        <div className={`absolute top-1/3 right-24 h-14 w-36 rounded-2xl border border-white/20 bg-white/10 backdrop-blur ${floatClass}`} style={{ animationDelay: '0.7s' }}></div>
        <div className={`absolute bottom-24 left-1/4 h-10 w-10 rounded-full border border-white/10 bg-white/10 ${floatClass}`} style={{ animationDelay: '1.9s' }}></div>
        <div className="absolute inset-0 mix-blend-soft-light">
          <div className={`absolute left-1/2 top-12 h-px w-48 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent ${shimmerClass}`}></div>
        </div>
      </div>
  <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-5 lg:px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-blue-100/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full px-6 py-3 mb-6">
            <Tag size={16} className={enableAnimations ? 'animate-pulse' : ''} aria-hidden="true" />
            <span className="text-sm font-semibold">Exclusive Deals</span>
            <Sparkles size={14} className={enableAnimations ? 'animate-spin-slow' : ''} aria-hidden="true" />
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Special{' '}
            <span className={`bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent ${shimmerClass}`}>
              Offers
            </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            Don't miss out on curated bundles and seasonal steals tailored to elevate your rotation.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs uppercase tracking-widest text-blue-600/80 dark:text-blue-300/80">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 dark:border-blue-800/60 bg-white/50 dark:bg-white/10 px-4 py-2">
              <Sparkles size={12} aria-hidden="true" />
              Updated hourly
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 dark:border-blue-800/60 bg-white/50 dark:bg-white/10 px-4 py-2">
              {offers.length} hand-picked deals
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {offers.map((offer) => {
            const isActive = enableAnimations && hoveredOffer === offer.id;
            return (
            <Link
              key={offer.id}
              to={offer.link}
              className={`group relative block overflow-hidden rounded-3xl border ${
                isActive ? 'border-blue-400/50 shadow-[0_20px_45px_-20px_rgba(37,99,235,0.45)]' : 'border-blue-100/40 dark:border-slate-800/60 shadow-[0_15px_35px_-25px_rgba(15,23,42,0.9)]'
              } bg-white/80 dark:bg-gray-900/80 backdrop-blur transform-gpu transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_55px_-25px_rgba(30,64,175,0.55)] focus:outline-none focus:ring-4 focus:ring-blue-500/40 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900`}
              aria-label={`${offer.title} - ${offer.description} - ${offer.discount} off`}
              onPointerMove={(event) => handlePointerMove(event, offer.id)}
              onPointerLeave={handlePointerLeave}
              onFocus={(event) => handleFocus(event, offer.id)}
              onBlur={handlePointerLeave}
            >
              <div className="relative">
                <img
                  src={offer.image}
                  alt={`${offer.title} promotion`}
                  className="w-full h-48 lg:h-56 object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = '/api/placeholder/600/300';
                  }}
                />
                
                {/* Discount Badge */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                  {offer.discount} OFF
                </div>
                
                {/* Limited Time Badge */}
                <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  {offer.badge}
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              </div>
              
              <div className="p-6 lg:p-8">
                <h3 className="relative text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-3 transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  <span className={`relative inline-block after:absolute after:left-0 after:bottom-[-6px] after:h-[2px] after:bg-gradient-to-r from-blue-500 to-purple-500 after:transition-all after:duration-300 after:w-0 after:opacity-0 ${underlineClass}`}>
                  {offer.title}
                  </span>
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-base lg:text-lg">
                  {offer.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold text-lg flex items-center gap-2 group-hover:gap-4 transition-all duration-300">
                    Shop Now
                    <ArrowRight 
                      size={20} 
                      className="group-hover:translate-x-2 transition-transform duration-300" 
                      aria-hidden="true"
                    />
                  </span>
                  
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Limited time offer
                  </div>
                </div>
              </div>
              
              {/* Shine Effect */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: 'radial-gradient(240px circle at var(--hover-x, 50%) var(--hover-y, 50%), rgba(59,130,246,0.25), transparent 65%)',
                  mixBlendMode: 'screen'
                }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out opacity-0 group-hover:opacity-100"></div>
            </Link>
          );
          })}
        </div>
      </div>
    </section>
  );
});

OffersSection.displayName = 'OffersSection';

export default OffersSection;
