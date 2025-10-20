'use client';

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import * as motion from 'motion/react-client';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

const CARD_CONTENT = [
  // BRANDS (Partner brands)
  {
    id: 'brand-strideforge',
    name: 'StrideForge',
    type: 'brand',
    accent: 'from-orange-500/80 via-rose-500/70 to-red-500/80',
    href: '/products?brand=strideforge',
    label: 'Partner brand',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80',
    size: 'hero',
  },
  {
    id: 'brand-aurorakicks',
    name: 'AuroraKicks',
    type: 'brand',
    accent: 'from-purple-500/80 via-fuchsia-500/70 to-pink-500/80',
    href: '/products?brand=aurorakicks',
    label: 'Partner brand',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
    size: 'wide',
  },
  {
    id: 'brand-pulserunner',
    name: 'PulseRunner',
    type: 'brand',
    accent: 'from-green-500/80 via-emerald-500/70 to-teal-500/80',
    href: '/products?brand=pulserunner',
    label: 'Partner brand',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    size: 'tall',
  },
  {
    id: 'brand-terratrail',
    name: 'TerraTrail',
    type: 'brand',
    accent: 'from-amber-500/80 via-orange-500/70 to-red-400/80',
    href: '/products?brand=terratrail',
    label: 'Partner brand',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
    size: 'base',
  },
  {
    id: 'brand-metroflex',
    name: 'MetroFlex',
    type: 'brand',
    accent: 'from-blue-500/80 via-indigo-500/70 to-cyan-500/80',
    href: '/products?brand=metroflex',
    label: 'Partner brand',
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80',
    size: 'wide',
  },
  {
    id: 'brand-nimbusstep',
    name: 'NimbusStep',
    type: 'brand',
    accent: 'from-cyan-500/80 via-sky-500/70 to-blue-500/80',
    href: '/products?brand=nimbusstep',
    label: 'Partner brand',
    image: 'https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=800&q=80',
    size: 'base',
  },
  {
    id: 'brand-velocitypro',
    name: 'VelocityPro',
    type: 'brand',
    accent: 'from-red-500/80 via-orange-500/70 to-yellow-500/80',
    href: '/products?brand=velocitypro',
    label: 'Partner brand',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
    size: 'tall',
  },
  {
    id: 'brand-urbanglide',
    name: 'UrbanGlide',
    type: 'brand',
    accent: 'from-slate-500/80 via-gray-500/70 to-zinc-500/80',
    href: '/products?brand=urbanglide',
    label: 'Partner brand',
    image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=800&q=80',
    size: 'base',
  },
  {
    id: 'brand-apexmotion',
    name: 'ApexMotion',
    type: 'brand',
    accent: 'from-violet-500/80 via-purple-500/70 to-indigo-500/80',
    href: '/products?brand=apexmotion',
    label: 'Partner brand',
    image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=800&q=80',
    size: 'wide',
  },
  {
    id: 'brand-summitreach',
    name: 'SummitReach',
    type: 'brand',
    accent: 'from-lime-500/80 via-green-500/70 to-emerald-500/80',
    href: '/products?brand=summitreach',
    label: 'Partner brand',
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80',
    size: 'base',
  },

  // CATEGORIES (Trending categories)
  // {
  //   id: 'category-running',
  //   name: 'Performance Running',
  //   type: 'category',
  //   accent: 'from-sky-500/80 via-blue-600/70 to-indigo-600/80',
  //   href: '/products?category=running',
  //   label: 'Trending category',
  //   image: 'https://images.unsplash.com/photo-1542293787938-4d2226c6bd03?auto=format&fit=crop&w=800&q=80',
  //   size: 'tall',
  // },
  {
    id: 'category-lifestyle',
    name: 'Lifestyle Sneakers',
    type: 'category',
    accent: 'from-purple-500/80 via-indigo-500/70 to-blue-500/80',
    href: '/products?category=lifestyle',
    label: 'Trending category',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    size: 'base',
  },
  // {
  //   id: 'category-trail',
  //   name: 'Trail & Outdoor',
  //   type: 'category',
  //   accent: 'from-emerald-500/80 via-teal-500/70 to-lime-500/80',
  //   href: '/products?category=trail',
  //   label: 'Trending category',
  //   image: 'https://images.unsplash.com/photo-1612810806695-30ba0a82ccb4?auto=format&fit=crop&w=800&q=80',
  //   size: 'wide',
  // },
  // {
  //   id: 'category-court',
  //   name: 'Court Classics',
  //   type: 'category',
  //   accent: 'from-pink-500/80 via-rose-500/70 to-red-500/80',
  //   href: '/products?category=court',
  //   label: 'Trending category',
  //   image: 'https://images.unsplash.com/photo-1615423760021-9d871f23a0cf?auto=format&fit=crop&w=800&q=80',
  //   size: 'base',
  // },
  // {
  //   id: 'category-training',
  //   name: 'High-Intensity Training',
  //   type: 'category',
  //   accent: 'from-amber-500/80 via-orange-500/70 to-yellow-500/80',
  //   href: '/products?category=training',
  //   label: 'Trending category',
  //   image: 'https://images.unsplash.com/photo-1600180758890-6d3a3a7e3c5d?auto=format&fit=crop&w=800&q=80',
  //   size: 'hero',
  // },
  // {
  //   id: 'category-kids',
  //   name: 'Kids Collection',
  //   type: 'category',
  //   accent: 'from-cyan-500/80 via-sky-500/70 to-blue-400/80',
  //   href: '/products?category=kids',
  //   label: 'Trending category',
  //   image: 'https://images.unsplash.com/photo-1600180758171-1c685402a3cc?auto=format&fit=crop&w=800&q=80',
  //   size: 'base',
  // },
  // {
  //   id: 'category-basketball',
  //   name: 'Basketball Performance',
  //   type: 'category',
  //   accent: 'from-orange-600/80 via-red-600/70 to-amber-600/80',
  //   href: '/products?category=basketball',
  //   label: 'Trending category',
  //   image: 'https://images.unsplash.com/photo-1546438311-4c2db6f31b8b?auto=format&fit=crop&w=800&q=80',
  //   size: 'tall',
  // },
  {
    id: 'category-skateboarding',
    name: 'Skateboarding',
    type: 'category',
    accent: 'from-gray-600/80 via-slate-600/70 to-zinc-600/80',
    href: '/products?category=skateboarding',
    label: 'Trending category',
    image: 'https://images.unsplash.com/photo-1547447134-cd3f5c716030?auto=format&fit=crop&w=800&q=80',
    size: 'base',
  },
  {
    id: 'category-walking',
    name: 'Walking & Comfort',
    type: 'category',
    accent: 'from-teal-500/80 via-cyan-500/70 to-blue-400/80',
    href: '/products?category=walking',
    label: 'Trending category',
    image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80',
    size: 'wide',
  },
  {
    id: 'category-slip-on',
    name: 'Slip-On Ease',
    type: 'category',
    accent: 'from-indigo-500/80 via-violet-500/70 to-purple-500/80',
    href: '/products?category=slip-on',
    label: 'Trending category',
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',
    size: 'base',
  },
  {
    id: 'category-boots',
    name: 'Premium Boots',
    type: 'category',
    accent: 'from-brown-600/80 via-amber-700/70 to-orange-700/80',
    href: '/products?category=boots',
    label: 'Trending category',
    image: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=800&q=80',
    size: 'tall',
  },
  {
    id: 'category-retro',
    name: 'Retro Classics',
    type: 'category',
    accent: 'from-rose-500/80 via-pink-500/70 to-fuchsia-500/80',
    href: '/products?category=retro',
    label: 'Trending category',
    image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=800&q=80',
    size: 'base',
  },
  {
    id: 'category-womens',
    name: "Women's Collection",
    type: 'category',
    accent: 'from-fuchsia-500/80 via-pink-500/70 to-rose-500/80',
    href: '/products?category=womens',
    label: 'Trending category',
    image: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80',
    size: 'wide',
  },
  {
    id: 'category-high-tops',
    name: 'High-Top Classics',
    type: 'category',
    accent: 'from-red-600/80 via-rose-600/70 to-pink-600/80',
    href: '/products?category=high-tops',
    label: 'Trending category',
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
    size: 'base',
  },
  {
    id: 'category-limited-edition',
    name: 'Limited Edition Drops',
    type: 'category',
    accent: 'from-yellow-500/80 via-amber-500/70 to-orange-500/80',
    href: '/products?category=limited-edition',
    label: 'Trending category',
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=800&q=80',
    size: 'hero',
  },
];


const CARD_LOOKUP = new Map(CARD_CONTENT.map((card) => [card.id, card]));
const BASE_SIZE_SEQUENCE = CARD_CONTENT.map((card) => card.size);

const SIZE_VARIANTS = {
  base: 'md:col-span-1 md:row-span-1 xl:col-span-1 xl:row-span-1',
  wide: 'md:col-span-2 md:row-span-1 xl:col-span-2 xl:row-span-1',
  tall: 'md:col-span-1 md:row-span-2 xl:col-span-2 xl:row-span-2',
  hero: 'md:col-span-2 md:row-span-2 xl:col-span-3 xl:row-span-2',
};

const CATEGORY_SHUFFLE_INTERVAL = 3600;

const spring = {
  type: 'spring',
  damping: 20,
  stiffness: 300,
};

const shuffleOrder = (source) => {
  const array = [...source];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const CardSection = () => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const enableAnimations = !prefersReducedMotion;

  const [layout, setLayout] = useState(() =>
    CARD_CONTENT.map((card) => ({ id: card.id, size: card.size })),
  );

  const orderedCards = useMemo(
    () =>
      layout
        .map(({ id, size }) => {
          const card = CARD_LOOKUP.get(id);
          if (!card) {
            return null;
          }
          return { ...card, size };
        })
        .filter(Boolean),
    [layout],
  );

  useEffect(() => {
    if (!enableAnimations || layout.length < 2) {
      return undefined;
    }

    // Periodically reshuffle the layout to trigger the motion reordering effect.
    const timeoutId = setTimeout(() => {
      setLayout((previous) => {
        const shuffled = shuffleOrder(previous);
        const sizeAssignments = shuffleOrder(BASE_SIZE_SEQUENCE);
        return shuffled.map((entry, index) => ({
          id: entry.id,
          size: sizeAssignments[index] || entry.size,
        }));
      });
    }, CATEGORY_SHUFFLE_INTERVAL);

    return () => clearTimeout(timeoutId);
  }, [layout, enableAnimations]);

  return (
    <section
      id="brands"
      className="relative overflow-hidden py-20 md:py-24 bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-950 dark:to-black"
      aria-labelledby="brand-showcase-heading"
    >
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className={`absolute -top-20 left-1/4 h-60 w-60 rounded-full bg-gradient-to-br from-emerald-300/30 via-teal-300/40 to-sky-300/30 dark:from-emerald-500/20 dark:via-teal-500/30 dark:to-sky-500/20 blur-3xl ${
            enableAnimations ? 'animate-pulse' : ''
          }`}
        />
        <div
          className={`absolute bottom-[-6rem] right-1/5 h-72 w-72 rounded-full bg-gradient-to-br from-violet-300/30 via-purple-300/30 to-pink-300/30 dark:from-violet-600/20 dark:via-purple-600/30 dark:to-pink-600/20 blur-[180px] ${
            enableAnimations ? 'animate-pulse' : ''
          }`}
          style={{ animationDelay: '1s' }}
        />
      </div>

  <div className="relative z-10 mx-auto sm:w-11/12 w-4/5 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-white/10 bg-blue-100 dark:bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-blue-700 dark:text-teal-200 mb-6">
            <Sparkles size={14} aria-hidden="true" className={enableAnimations ? 'animate-pulse' : ''} />
            Spotlight brands & categories
          </div>
          <h2
            id="brand-showcase-heading"
            className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-gray-900 dark:text-white"
          >
            Discover premium{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-teal-300 dark:via-cyan-300 dark:to-blue-300 bg-clip-text text-transparent">
              footwear stories
            </span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-gray-700 dark:text-slate-200/80">
            Explore our curated selection of top brands and trending categories, handpicked to elevate your sneaker game.
          </p>
        </div>

        <div className="space-y-10">
          <motion.ul
            layout
            className="grid grid-flow-dense grid-cols-2 gap-5 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7 auto-rows-[220px] sm:auto-rows-[240px] md:auto-rows-[220px] xl:auto-rows-[200px]"
          >
            {orderedCards.map((item) => {
              const sizeClass = SIZE_VARIANTS[item?.size] || SIZE_VARIANTS.base;
              return (
                <motion.li
                  key={item.id}
                  layout
                  transition={spring}
                  initial={enableAnimations ? { opacity: 0, y: 24 } : undefined}
                  animate={enableAnimations ? { opacity: 1, y: 0 } : undefined}
                  whileHover={enableAnimations ? { y: -8, scale: 1.01 } : undefined}
                  className={`h-full ${sizeClass}`}
                >
                  <Link
                    to={item.href}
                    className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-blue-200/60 bg-white/70 shadow-lg transition-all duration-300 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-white/10 dark:bg-white/10 dark:focus:ring-teal-400 dark:focus:ring-offset-slate-900"
                    aria-label={`Browse ${item.name}`}
                  >
                    <div className="relative flex-1 overflow-hidden">
                      <img
                        src={item.image}
                        alt={`${item.name} spotlight`}
                        loading="lazy"
                        className={`h-full w-full object-cover transition-transform duration-700 ${
                          enableAnimations ? 'group-hover:scale-105' : ''
                        }`}
                      />
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${item.accent} opacity-70 mix-blend-multiply transition-opacity duration-500 ${
                          enableAnimations ? 'group-hover:opacity-90' : ''
                        }`}
                        aria-hidden="true"
                      />
                      <div className="absolute inset-x-6 bottom-6 space-y-3 text-white">
                        <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest backdrop-blur-sm">
                          {item.label}
                        </span>
                        <h4 className="text-2xl font-bold leading-tight drop-shadow-lg">
                          {item.name}
                        </h4>
                      </div>
                    </div>
                  </Link>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-teal-400 dark:to-blue-400 px-8 py-3 text-white dark:text-gray-900 font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-teal-400 dark:focus:ring-offset-slate-900"
          >
            View All Products
            <ArrowRight size={18} className="ml-1" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
};

CardSection.displayName = 'CardSection';

export default CardSection;