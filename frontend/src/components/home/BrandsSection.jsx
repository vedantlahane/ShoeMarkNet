import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

const FALLBACK_PARTNERS = [
  {
    name: 'StrideForge',
    slug: 'strideforge',
    description: 'Performance meets innovation',
    accent: 'from-orange-500 to-red-500',
  },
  {
    name: 'AuroraKicks',
    slug: 'aurorakicks',
    description: 'Radiant style, endless comfort',
    accent: 'from-purple-500 to-pink-500',
  },
  {
    name: 'PulseRunner',
    slug: 'pulserunner',
    description: 'Energy in every step',
    accent: 'from-green-500 to-teal-500',
  },
  {
    name: 'TerraTrail',
    slug: 'terratrail',
    description: 'Built for the journey',
    accent: 'from-amber-500 to-orange-500',
  },
  {
    name: 'MetroFlex',
    slug: 'metroflex',
    description: 'Urban style redefined',
    accent: 'from-blue-500 to-indigo-500',
  },
  {
    name: 'NimbusStep',
    slug: 'nimbusstep',
    description: 'Walk on clouds',
    accent: 'from-cyan-500 to-blue-500',
  },
];

const BrandsSection = memo(({ partners = [] }) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const enableAnimations = !prefersReducedMotion;

  const brandPartners = useMemo(() => {
    if (Array.isArray(partners) && partners.length > 0) {
      return partners.map((partner, index) => ({
        ...partner,
        accent: partner.accent || FALLBACK_PARTNERS[index % FALLBACK_PARTNERS.length]?.accent || 'from-gray-500 to-gray-600',
        description: partner.description || FALLBACK_PARTNERS[index % FALLBACK_PARTNERS.length]?.description || 'Premium footwear',
      }));
    }
    return FALLBACK_PARTNERS;
  }, [partners]);

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

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-white/10 bg-blue-100 dark:bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-blue-700 dark:text-teal-200 mb-6">
            <Sparkles size={14} aria-hidden="true" className={enableAnimations ? 'animate-pulse' : ''} />
            Our Partner Brands
          </div>
          <h2
            id="brand-showcase-heading"
            className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-gray-900 dark:text-white"
          >
            Discover premium{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-teal-300 dark:via-cyan-300 dark:to-blue-300 bg-clip-text text-transparent">
              footwear brands
            </span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-gray-700 dark:text-slate-200/80">
            Explore our carefully curated collection from the world's finest footwear manufacturers
          </p>
        </div>

        {/* Brand Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {brandPartners.map((brand, index) => (
            <Link
              key={brand.slug || index}
              to="/products"
              className="group relative overflow-hidden rounded-3xl border border-blue-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-blue-300/60 dark:hover:border-teal-200/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-teal-400 dark:focus:ring-offset-slate-900"
              aria-label={`Explore ${brand.name} products`}
            >
              {/* Card Content */}
              <div className="relative z-10">
                {/* Brand Logo/Avatar */}
                <div className="mb-6">
                  <div
                    className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${brand.accent} text-white font-bold text-xl shadow-lg transition-transform duration-300 group-hover:scale-110`}
                    aria-hidden="true"
                  >
                    {brand.name
                      .split(' ')
                      .map((word) => word[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                </div>

                {/* Brand Info */}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {brand.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {brand.description}
                </p>

                {/* CTA */}
                <div className="flex items-center gap-2 text-blue-600 dark:text-teal-300 font-semibold">
                  <span>Explore Collection</span>
                  <ArrowRight 
                    size={16} 
                    className="transition-transform duration-300 group-hover:translate-x-1" 
                    aria-hidden="true" 
                  />
                </div>
              </div>

              {/* Hover Effect Overlay */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background: `linear-gradient(135deg, ${
                    brand.accent.includes('from-') 
                      ? brand.accent.replace('from-', '').replace(' to-', '20%, ').replace(/(\w+-\d+)/g, 'rgb(var(--tw-colors-$1))') + '20%'
                      : 'rgba(59,130,246,0.1) 0%, rgba(147,51,234,0.1) 100%'
                  })`,
                  mixBlendMode: 'overlay',
                }}
              />

              {/* Decorative Elements */}
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-blue-400/10 to-purple-400/10 dark:from-teal-400/10 dark:to-blue-400/10 blur-2xl transition-all duration-500 group-hover:scale-150" />
              <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-gradient-to-tr from-purple-400/10 to-pink-400/10 dark:from-blue-400/10 dark:to-cyan-400/10 blur-2xl transition-all duration-500 group-hover:scale-150" />
            </Link>
          ))}
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
});

BrandsSection.displayName = 'BrandsSection';

export default BrandsSection;