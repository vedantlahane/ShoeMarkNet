import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { gsap } from 'gsap';
import { addToCart } from '../../redux/slices/cartSlice';
import { toast } from 'react-hot-toast';
import {
  ShoppingBag,
  Star,
  ArrowRight,
  ArrowUpRight,
  Zap,
  Users,
  Clock,
  History,
  Sparkles,
  Sparkle,
  TrendingUp,
  ShieldCheck,
  Truck,
  Layers3,
  CheckCircle2,
  Info
} from 'lucide-react';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

const HeroSection = () => {
  const dispatch = useDispatch();
  const prefersReducedMotion = usePrefersReducedMotion();

  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const productRef = useRef(null);
  const statsRef = useRef([]);
  const gsapContextRef = useRef(null);

  const [timeLeft, setTimeLeft] = useState({
    days: 7,
    hours: 15,
    minutes: 23,
    seconds: 42
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const stats = useMemo(() => ([
    { icon: Users, value: '50K+', label: 'Happy customers' },
    { icon: Zap, value: '24h', label: 'Lightning delivery' },
    { icon: Star, value: '4.9★', label: 'Average rating' },
    { icon: TrendingUp, value: '99%', label: 'Fit satisfaction' }
  ]), []);

  const featurePills = useMemo(() => ([
    { icon: ShieldCheck, label: '30-day easy returns' },
    { icon: Truck, label: 'Free express shipping' },
    { icon: Sparkles, label: 'AI size guidance' }
  ]), []);

  const floatingShapes = useMemo(() => ([
    { left: '8%', top: '18%', size: 220, blur: 180, color: 'bg-sky-500/20' },
    { left: '70%', top: '12%', size: 160, blur: 140, color: 'bg-violet-500/25' },
    { left: '16%', top: '70%', size: 140, blur: 120, color: 'bg-cyan-400/25' },
    { left: '82%', top: '66%', size: 260, blur: 210, color: 'bg-pink-500/20' }
  ]), []);

  const heroProduct = useMemo(() => ({
    id: 'hero-premium-1',
    name: 'Nimbus Runner X',
    price: 129.99,
    originalPrice: 189.99,
    discount: 32,
    image: '/assets/hero.png'
  }), []);

  const productHighlights = useMemo(() => ([
    { icon: Sparkle, label: 'FeatherLite cushioning' },
    { icon: CheckCircle2, label: 'Adaptive heel lock' },
    { icon: Layers3, label: 'Breathable knit weave' }
  ]), []);

  const formatTimeUnit = useCallback((value) => value.toString().padStart(2, '0'), []);

  const countdownSegments = useMemo(() => ([
    { label: 'Days', value: formatTimeUnit(timeLeft.days) },
    { label: 'Hours', value: formatTimeUnit(timeLeft.hours) },
    { label: 'Mins', value: formatTimeUnit(timeLeft.minutes) },
    { label: 'Secs', value: formatTimeUnit(timeLeft.seconds) }
  ]), [timeLeft, formatTimeUnit]);

  useEffect(() => {
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

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsLoaded(true);
      return undefined;
    }

    gsapContextRef.current = gsap.context(() => {
      const heroEl = heroRef.current;
      if (!heroEl) {
        setIsLoaded(true);
        return;
      }

      const statNodes = statsRef.current.filter(Boolean);
      const floatingNodes = heroEl.querySelectorAll('.floating-shape');
      const gradientNode = heroEl.querySelector('.hero-gradient');

      const timeline = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.9 } });

      timeline
        .from(titleRef.current, { y: 60, opacity: 0 })
        .from(subtitleRef.current, { y: 40, opacity: 0 }, '-=0.5')
        .from(statNodes, { y: 30, opacity: 0, stagger: 0.12 }, '-=0.5')
        .from(ctaRef.current, { y: 30, opacity: 0 }, '-=0.4')
        .from(productRef.current, { x: 80, opacity: 0, rotateY: -10 }, '-=0.7');

      if (gradientNode) {
        gsap.to(gradientNode, {
          backgroundPosition: '200% 50%',
          duration: 18,
          repeat: -1,
          ease: 'none'
        });
      }

      gsap.utils.toArray(floatingNodes).forEach((shape, index) => {
        gsap.to(shape, {
          y: 30,
          duration: 6 + index,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: index * 0.4
        });
      });

      setIsLoaded(true);
    }, heroRef);

    return () => {
      if (gsapContextRef.current) {
        gsapContextRef.current.revert();
        gsapContextRef.current = null;
      }
    };
  }, [prefersReducedMotion]);

  const handleAddToCart = useCallback((productOverride) => {
    const product = productOverride || heroProduct;

    dispatch(addToCart({
      productId: product.id,
      quantity: 1,
      product
    }));

    toast.success(`${product.name} added to cart`);

    if (!prefersReducedMotion) {
      gsap.to('.add-to-cart-btn', {
        scale: 0.95,
        duration: 0.12,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      });
    }
  }, [dispatch, prefersReducedMotion, heroProduct]);

  const scrollToSection = useCallback((sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const headerHeight = 80;
      const elementPosition = section.offsetTop - headerHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    }
  }, [prefersReducedMotion]);

  return (
    <section
      ref={heroRef}
      className={`relative isolate overflow-hidden pt-28 pb-32 transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      aria-label="Hero section"
    >
      <div className="hero-gradient absolute inset-0 bg-theme" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.28),_transparent_55%)]" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-theme/70 to-transparent" aria-hidden="true" />

      {floatingShapes.map((shape, index) => (
        <span
          key={`shape-${index}`}
          className={`floating-shape absolute rounded-full ${shape.color}`}
          style={{
            left: shape.left,
            top: shape.top,
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            filter: `blur(${shape.blur}px)`
          }}
          aria-hidden="true"
        />
      ))}

  <div className="relative z-10 mx-auto w-full max-w-screen-2xl px-4 sm:px-5 lg:px-6">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <div className="space-y-10 text-theme">
            <div className="inline-flex items-center gap-3 rounded-full border border-theme-strong/15 bg-surface/5 px-5 py-2 text-theme/80 shadow-lg shadow-theme/40 backdrop-blur-xl">
              <Sparkles className="h-4 w-4 text-cyan-300" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-[0.28em]">Premium drop</span>
              <span className="flex items-center gap-1 text-xs text-muted-theme">
                <History className="h-3.5 w-3.5" aria-hidden="true" />
                Ends in {formatTimeUnit(timeLeft.hours)}h {formatTimeUnit(timeLeft.minutes)}m
              </span>
            </div>

            <div ref={titleRef} className="space-y-5">
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold leading-[1.05] tracking-tight">
                Elevate your stride with
                <span className="block bg-gradient-to-r from-sky-400 via-indigo-300 to-rose-400 bg-clip-text text-transparent">
                  Nimbus Runner X
                </span>
              </h1>
            </div>

            <p
              ref={subtitleRef}
              className="max-w-2xl text-base text-muted-theme sm:text-lg md:text-xl md:leading-relaxed"
            >
              Engineered with adaptive cushioning and breathable knit mesh, Nimbus Runner X keeps pace with every sprint, stride, and slowdown. Join a community of sneaker obsessives discovering their perfect fit.
            </p>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    ref={(el) => { statsRef.current[index] = el; }}
                    className="rounded-2xl border border-theme-strong/10 bg-surface/5 px-4 py-5 text-muted-theme shadow-[0_14px_50px_rgba(15,23,42,0.45)] backdrop-blur-xl"
                  >
                    <Icon className="mb-3 h-5 w-5 text-cyan-300" aria-hidden="true" />
                    <div className="text-2xl font-semibold text-theme">{stat.value}</div>
                    <div className="text-xs uppercase tracking-[0.28em] text-muted-strong">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            <div ref={ctaRef} className="flex flex-col gap-4 sm:flex-row">
              <button
                onClick={() => handleAddToCart()}
                className="add-to-cart-btn inline-flex items-center justify-center gap-3 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-[0_20px_40px_rgba(148,163,184,0.35)] transition-all duration-300 hover:shadow-[0_26px_56px_rgba(148,163,184,0.4)] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-theme"
                aria-label="Add Nimbus Runner X to cart"
              >
                <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                Shop Nimbus Runner X
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('new-arrivals')}
                className="inline-flex items-center justify-center gap-3 rounded-full border border-white/20 bg-transparent px-8 py-3 text-sm font-medium text-white/80 transition-all duration-300 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
                aria-label="Explore the new arrivals section"
              >
                Explore collection
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {featurePills.map((pill) => {
                const Icon = pill.icon;
                return (
                  <div
                    key={pill.label}
                    className="inline-flex items-center gap-2 rounded-full border border-theme-strong/15 bg-surface/5 px-4 py-2 text-sm text-muted-theme backdrop-blur-lg"
                  >
                    <Icon className="h-4 w-4 text-cyan-300" aria-hidden="true" />
                    {pill.label}
                  </div>
                );
              })}
            </div>

            <div className="max-w-lg rounded-3xl border border-theme-strong bg-surface px-6 py-5 text-muted-theme shadow-[0_22px_60px_rgba(12,17,28,0.55)] backdrop-blur-2xl">
              <div className="flex items-center gap-3 text-theme">
                <Clock className="h-5 w-5 text-amber-300" aria-hidden="true" />
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-theme">Flash drop ends in</span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                {countdownSegments.map((segment) => (
                  <div
                    key={segment.label}
                    className="flex-1 rounded-2xl border border-theme-strong bg-surface py-3 text-center"
                  >
                    <div className="text-2xl font-semibold text-theme">{segment.value}</div>
                    <div className="text-[0.65rem] uppercase tracking-[0.32em] text-muted-theme">{segment.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div ref={productRef} className="relative">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 text-white backdrop-blur-2xl shadow-[0_46px_120px_rgba(15,15,35,0.6)]">
              <div className="absolute inset-x-6 top-6 flex items-center justify-between text-xs uppercase tracking-[0.28em] text-white/60">
                <span className="inline-flex items-center gap-2">
                  <Sparkle className="h-4 w-4 text-cyan-300" aria-hidden="true" />
                  Limited release
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-300">
                  <TrendingUp className="h-4 w-4" aria-hidden="true" />
                  {heroProduct.discount}% off
                </span>
              </div>

              <div className="relative mt-16">
                <div
                  className="pointer-events-none absolute inset-0 -translate-y-6 scale-105 rounded-full bg-gradient-to-t from-cyan-500/30 via-indigo-500/20 to-transparent blur-3xl"
                  aria-hidden="true"
                />
                {imageError ? (
                  <div className="relative mx-auto flex h-64 w-full max-w-md items-center justify-center rounded-[2rem] bg-slate-900/60 text-sm text-white/60">
                    Image coming soon
                  </div>
                ) : (
                  <img
                    src={heroProduct.image}
                    alt={heroProduct.name}
                    className="relative mx-auto h-64 w-full max-w-md object-contain drop-shadow-[0_26px_48px_rgba(14,14,30,0.55)]"
                    loading="eager"
                    decoding="async"
                    onError={() => setImageError(true)}
                  />
                )}
              </div>

              <div className="mt-10 space-y-6 text-muted-theme">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.32em] text-muted-theme">Nimbus Runner X</p>
                    <h3 className="text-2xl font-semibold text-theme">{heroProduct.name}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-theme line-through">${heroProduct.originalPrice.toFixed(2)}</p>
                    <p className="text-3xl font-semibold text-theme">${heroProduct.price.toFixed(2)}</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {productHighlights.map((highlight) => {
                    const Icon = highlight.icon;
                    return (
                      <div
                        key={highlight.label}
                        className="rounded-2xl border border-theme-strong bg-surface px-3 py-3 text-sm text-muted-theme"
                      >
                        <Icon className="mb-2 h-4 w-4 text-cyan-300" aria-hidden="true" />
                        {highlight.label}
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => handleAddToCart(heroProduct)}
                  className="add-to-cart-btn inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_22px_60px_rgba(14,116,232,0.5)] transition-all duration-300 hover:shadow-[0_28px_72px_rgba(14,116,232,0.55)] focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-slate-950"
                  aria-label="Add Nimbus Runner X to cart"
                >
                  <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                  Add to cart
                </button>
              </div>
            </div>

            <div className="relative mx-auto mt-8 w-full max-w-sm rounded-2xl border border-theme-strong bg-surface px-6 py-5 text-muted-theme shadow-[0_28px_90px_rgba(12,12,30,0.65)] backdrop-blur-2xl">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.32em] text-muted-theme">
                <span className="inline-flex items-center gap-2 text-muted-theme">
                  <Clock className="h-4 w-4 text-amber-300" aria-hidden="true" />
                  Next drop in
                </span>
                <button
                  type="button"
                  onClick={() => scrollToSection('new-arrivals')}
                  className="inline-flex items-center gap-2 text-muted-theme transition-colors duration-200 hover:text-theme"
                >
                  Set reminder
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-4 flex justify-between gap-3">
                {countdownSegments.map((segment) => (
                  <div
                    key={`mini-${segment.label}`}
                    className="flex-1 rounded-xl border border-theme-strong bg-surface py-3 text-center"
                  >
                    <span className="block text-lg font-semibold text-theme">{segment.value}</span>
                    <span className="text-[0.6rem] uppercase tracking-[0.34em] text-muted-theme">{segment.label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-muted-theme">
                <Info className="h-3.5 w-3.5" aria-hidden="true" />
                Members get early colorway access via ShoeMark+ notifications.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
