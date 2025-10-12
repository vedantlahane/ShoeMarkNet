import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
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

const DEFAULT_COUNTDOWN_DURATION = 72 * 60 * 60; // 72 hours in seconds

const HeroSection = ({ data, isLoading = false }) => {
  const dispatch = useDispatch();
  const prefersReducedMotion = usePrefersReducedMotion();


  const [targetDate, setTargetDate] = useState(() => {
    if (!data?.countdownTarget) {
      return new Date(Date.now() + DEFAULT_COUNTDOWN_DURATION * 1000);
    }
    const parsed = new Date(data.countdownTarget);
    return Number.isNaN(parsed.getTime())
      ? new Date(Date.now() + DEFAULT_COUNTDOWN_DURATION * 1000)
      : parsed;
  });
  const [timeLeft, setTimeLeft] = useState(() => ({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  }));
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const heroData = useMemo(() => (data && typeof data === 'object' ? data : {}), [data]);
  const {
    headline: rawHeadline,
    subheading: rawSubheading,
    description: rawDescription,
    countdownLabel: rawCountdownLabel,
    stats: rawStats,
    features: rawFeatures,
    product: rawProduct,
  } = heroData || {};

  const heroHeadline = useMemo(() => {
    const fallback = 'Discover premium footwear for every journey';
    const value = typeof rawHeadline === 'string' ? rawHeadline.trim() : '';
    return value.length ? value : fallback;
  }, [rawHeadline]);

  const heroSubheading = useMemo(() => {
    const fallback = 'Featured release';
    const value = typeof rawSubheading === 'string' ? rawSubheading.trim() : '';
    return value.length ? value : fallback;
  }, [rawSubheading]);

  const heroDescription = useMemo(() => {
    const fallback = 'Engineered with adaptive cushioning and breathable knit, our featured release keeps pace with every sprint, stride, and slowdown. Join a community of sneaker obsessives discovering their perfect fit.';
    const value = typeof rawDescription === 'string' ? rawDescription.trim() : '';
    return value.length ? value : fallback;
  }, [rawDescription]);

  const stats = useMemo(() => {
    if (Array.isArray(rawStats) && rawStats.length > 0) {
      const iconPool = [Users, Zap, Star, TrendingUp];
      return rawStats.map((stat, index) => ({
        icon: iconPool[index % iconPool.length],
        value: stat?.value ?? '—',
        label: stat?.label ?? '',
      }));
    }
    return [];
  }, [rawStats]);

  const featurePills = useMemo(() => {
    if (Array.isArray(rawFeatures) && rawFeatures.length > 0) {
      const iconPool = [ShieldCheck, Truck, Sparkles];
      return rawFeatures.map((label, index) => ({
        icon: iconPool[index % iconPool.length],
        label,
      }));
    }
    return [];
  }, [rawFeatures]);

  const floatingShapes = useMemo(() => ([
    { left: '8%', top: '18%', size: 220, blur: 180, color: 'bg-sky-500/20' },
    { left: '70%', top: '12%', size: 160, blur: 140, color: 'bg-violet-500/25' },
    { left: '16%', top: '70%', size: 140, blur: 120, color: 'bg-cyan-400/25' },
    { left: '82%', top: '66%', size: 260, blur: 210, color: 'bg-pink-500/20' }
  ]), []);

  const heroProduct = useMemo(() => {
    if (rawProduct && typeof rawProduct === 'object') {
      return rawProduct;
    }
    return null;
  }, [rawProduct]);

  const shouldHighlightProduct = useMemo(() => {
    if (!heroProduct?.name) return false;
    return heroHeadline.toLowerCase().includes(heroProduct.name.toLowerCase());
  }, [heroHeadline, heroProduct?.name]);

  const headlineBase = useMemo(() => {
    if (!shouldHighlightProduct || !heroProduct?.name) {
      return heroHeadline;
    }
    const regex = new RegExp(heroProduct.name, 'i');
    return heroHeadline.replace(regex, '').trim();
  }, [heroHeadline, heroProduct?.name, shouldHighlightProduct]);

  const productPricing = useMemo(() => {
    if (!heroProduct) {
      return { price: null, original: null, discount: null };
    }
    const price = typeof heroProduct.price === 'number' ? heroProduct.price : null;
    const original = typeof heroProduct.originalPrice === 'number' ? heroProduct.originalPrice : null;
    const discount = typeof heroProduct.discountPercentage === 'number' ? heroProduct.discountPercentage : null;
    return { price, original, discount };
  }, [heroProduct]);

  const formatPrice = useCallback((value) => {
    if (typeof value !== 'number') return null;
    return value.toFixed(2);
  }, []);

  const { price: productPrice, original: productOriginal } = productPricing;

  const priceLabels = useMemo(() => ({
    price: productPrice !== null ? formatPrice(productPrice) : null,
    original: productOriginal !== null ? formatPrice(productOriginal) : null,
  }), [productPrice, productOriginal, formatPrice]);

  const countdownHeadline = useMemo(() => {
    const fallback = 'Flash drop ends in';
    const label = typeof rawCountdownLabel === 'string' ? rawCountdownLabel.trim() : '';
    return label.length ? label : fallback;
  }, [rawCountdownLabel]);

  const productDisplayName = useMemo(() => {
    if (heroProduct?.name) return heroProduct.name;
    if (heroSubheading) return heroSubheading;
    return 'Featured drop';
  }, [heroProduct?.name, heroSubheading]);

  const productBadgeLabel = useMemo(() => {
    if (heroProduct?.brand) return heroProduct.brand;
    return heroSubheading;
  }, [heroProduct?.brand, heroSubheading]);

  const productHighlights = useMemo(() => {
    if (Array.isArray(rawProduct?.highlights) && rawProduct.highlights.length > 0) {
      const iconPool = [Sparkle, CheckCircle2, Layers3];
      return rawProduct.highlights.map((label, index) => ({
        icon: iconPool[index % iconPool.length],
        label,
      }));
    }

    if (Array.isArray(rawFeatures)) {
      const iconPool = [Sparkle, CheckCircle2, Layers3];
      return rawFeatures.slice(0, 3).map((label, index) => ({
        icon: iconPool[index % iconPool.length],
        label,
      }));
    }

    return [];
  }, [rawProduct?.highlights, rawFeatures]);

  useEffect(() => {
    if (!data?.countdownTarget) {
      setTargetDate(new Date(Date.now() + DEFAULT_COUNTDOWN_DURATION * 1000));
      return;
    }

    const parsed = new Date(data.countdownTarget);
    setTargetDate(Number.isNaN(parsed.getTime()) ? new Date(Date.now() + DEFAULT_COUNTDOWN_DURATION * 1000) : parsed);
  }, [data?.countdownTarget]);

  const updateCountdown = useCallback(() => {
    if (!targetDate) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const difference = Math.max(0, targetDate.getTime() - Date.now());
    const totalSeconds = Math.floor(difference / 1000);
    const days = Math.floor(totalSeconds / (60 * 60 * 24));
    const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    setTimeLeft({ days, hours, minutes, seconds });
  }, [targetDate]);

  const formatTimeUnit = useCallback((value) => value.toString().padStart(2, '0'), []);

  const countdownSegments = useMemo(() => ([
    { label: 'Days', value: formatTimeUnit(timeLeft.days ?? 0) },
    { label: 'Hours', value: formatTimeUnit(timeLeft.hours ?? 0) },
    { label: 'Mins', value: formatTimeUnit(timeLeft.minutes ?? 0) },
    { label: 'Secs', value: formatTimeUnit(timeLeft.seconds ?? 0) }
  ]), [timeLeft, formatTimeUnit]);

  useEffect(() => {
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [updateCountdown]);

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsLoaded(true);
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => setIsLoaded(true));
    return () => window.cancelAnimationFrame(frame);
  }, [prefersReducedMotion]);

  const handleAddToCart = useCallback((productOverride) => {
    const product = productOverride || heroProduct;

    if (!product) {
      toast.error('Featured product is unavailable right now');
      return;
    }

    dispatch(addToCart({
      productId: product.id,
      quantity: 1,
      product
    }));

    toast.success(`${product.name} added to cart`);
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
              <span className="text-xs font-semibold uppercase tracking-[0.28em]">{heroSubheading}</span>
              <span className="flex items-center gap-1 text-xs text-muted-theme">
                <History className="h-3.5 w-3.5" aria-hidden="true" />
                Ends in {formatTimeUnit(timeLeft?.hours ?? 0)}h {formatTimeUnit(timeLeft?.minutes ?? 0)}m
              </span>
            </div>

            <div className="space-y-5">
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold leading-[1.05] tracking-tight">
                {shouldHighlightProduct && headlineBase && (
                  <span className="block">{headlineBase}</span>
                )}
                <span className="block bg-gradient-to-r from-sky-400 via-indigo-300 to-rose-400 bg-clip-text text-transparent">
                  {shouldHighlightProduct && heroProduct?.name ? heroProduct.name : heroHeadline}
                </span>
              </h1>
            </div>

            <p
              className="max-w-2xl text-base text-muted-theme sm:text-lg md:text-xl md:leading-relaxed"
            >
              {heroDescription}
            </p>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-theme-strong/10 bg-surface/5 px-4 py-5 text-muted-theme shadow-[0_14px_50px_rgba(15,23,42,0.45)] backdrop-blur-xl"
                  >
                    <Icon className="mb-3 h-5 w-5 text-cyan-300" aria-hidden="true" />
                    <div className="text-2xl font-semibold text-theme">{stat.value}</div>
                    <div className="text-xs uppercase tracking-[0.28em] text-muted-strong">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                onClick={() => handleAddToCart()}
                className="add-to-cart-btn inline-flex items-center justify-center gap-3 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-[0_20px_40px_rgba(148,163,184,0.35)] transition-all duration-300 hover:shadow-[0_26px_56px_rgba(148,163,184,0.4)] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-theme disabled:cursor-not-allowed disabled:opacity-70"
                aria-label={heroProduct?.name ? `Add ${heroProduct.name} to cart` : 'Add featured product to cart'}
                disabled={!heroProduct}
              >
                <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                {heroProduct?.name ? `Shop ${heroProduct.name}` : 'Shop featured drop'}
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
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-theme">{countdownHeadline}</span>
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

          <div className="relative">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 text-white backdrop-blur-2xl shadow-[0_46px_120px_rgba(15,15,35,0.6)]">
              <div className="absolute inset-x-6 top-6 flex items-center justify-between text-xs uppercase tracking-[0.28em] text-white/60">
                <span className="inline-flex items-center gap-2">
                  <Sparkle className="h-4 w-4 text-cyan-300" aria-hidden="true" />
                  {productBadgeLabel}
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-300">
                  <TrendingUp className="h-4 w-4" aria-hidden="true" />
                  {productPricing.discount !== null ? `${productPricing.discount}% off` : 'Just dropped'}
                </span>
              </div>

              <div className="relative mt-16">
                <div
                  className="pointer-events-none absolute inset-0 -translate-y-6 scale-105 rounded-full bg-gradient-to-t from-cyan-500/30 via-indigo-500/20 to-transparent blur-3xl"
                  aria-hidden="true"
                />
                {imageError || !heroProduct?.image ? (
                  <div className="relative mx-auto flex h-64 w-full max-w-md items-center justify-center rounded-[2rem] bg-slate-900/60 text-sm text-white/60">
                    Product visual coming soon
                  </div>
                ) : (
                  <img
                    src={heroProduct.image}
                    alt={productDisplayName}
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
                    <p className="text-xs uppercase tracking-[0.32em] text-muted-theme">{productBadgeLabel}</p>
                    <h3 className="text-2xl font-semibold text-theme">{productDisplayName}</h3>
                  </div>
                  <div className="text-right">
                    {priceLabels.original && (
                      <p className="text-sm text-muted-theme line-through">${priceLabels.original}</p>
                    )}
                    <p className="text-3xl font-semibold text-theme">
                      {priceLabels.price ? `$${priceLabels.price}` : 'Coming soon'}
                    </p>
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
                  className="add-to-cart-btn inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_22px_60px_rgba(14,116,232,0.5)] transition-all duration-300 hover:shadow-[0_28px_72px_rgba(14,116,232,0.55)] focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
                  aria-label={heroProduct?.name ? `Add ${heroProduct.name} to cart` : 'Add featured product to cart'}
                  disabled={!heroProduct}
                >
                  <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                  {heroProduct ? 'Add to cart' : 'Notify me'}
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
