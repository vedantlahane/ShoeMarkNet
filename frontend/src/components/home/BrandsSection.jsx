import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Globe,
  Rocket,
  Star,
} from 'lucide-react';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

const metricIcons = [Sparkles, ShieldCheck, Globe, Rocket];

const ACCENT_GRADIENTS = [
  'from-orange-400 via-pink-500 to-rose-500',
  'from-amber-400 via-yellow-500 to-lime-500',
  'from-blue-500 via-indigo-500 to-violet-500',
  'from-emerald-500 via-teal-500 to-cyan-500',
  'from-purple-500 via-fuchsia-500 to-pink-500',
  'from-sky-500 via-cyan-500 to-blue-400'
];

const FALLBACK_PARTNERS = [
  {
    name: 'StrideForge',
    slug: 'strideforge',
    categoryLabel: 'High-performance drops',
    tagline: 'Performance engineered footwear crafted with carbon-fiber precision.',
    highlights: ['68 signature styles', '4.9★ avg rating', 'Elite athlete collabs'],
    accent: ACCENT_GRADIENTS[0],
    badge: 'Premium partner',
  },
  {
    name: 'AuroraKicks',
    slug: 'aurorakicks',
    categoryLabel: 'Luxury comfort reimagined',
    tagline: 'Hand-finished uppers and ethical sourcing for elevated daily wear.',
    highlights: ['Curated capsule edits', 'Sustainable materials', 'Iconic silhouettes'],
    accent: ACCENT_GRADIENTS[1],
    badge: 'Signature label',
  },
  {
    name: 'PulseRunner',
    slug: 'pulserunner',
    categoryLabel: 'Adaptive smart wearables',
    tagline: 'Real-time gait tracking and AI-powered cushioning adapt to your pace.',
    highlights: ['Performance analytics', 'Carbon weave uppers', '46 pro-approved styles'],
    accent: ACCENT_GRADIENTS[2],
    badge: 'Tech innovation',
  },
  {
    name: 'TerraTrail',
    slug: 'terratrail',
    categoryLabel: 'Sustainable trail essentials',
    tagline: 'Recycled mesh blends meet weatherproof grip for every ascent.',
    highlights: ['Verified climate-neutral', 'Trail-tested outsole', '36 terrain-ready fits'],
    accent: ACCENT_GRADIENTS[3],
    badge: 'Outdoor specialist',
  },
  {
    name: 'MetroFlex',
    slug: 'metroflex',
    categoryLabel: 'Streetwear icons',
    tagline: 'Artist-driven collaborations merging culture, comfort, and motion.',
    highlights: ['Drop alerts weekly', 'Limited artist collabs', '58 urban staples'],
    accent: ACCENT_GRADIENTS[4],
    badge: 'Limited run',
  },
  {
    name: 'NimbusStep',
    slug: 'nimbusstep',
    categoryLabel: 'Everyday essentials',
    tagline: 'Featherweight foams with moisture-wicking liners for cloudlike comfort.',
    highlights: ['Breathable knit uppers', 'Daily wear essential', '32 lifestyle picks'],
    accent: ACCENT_GRADIENTS[5],
    badge: 'Community favorite',
  },
];

const FALLBACK_METRICS = [
  { label: 'Global brand partners', value: '120+' },
  { label: 'Exclusive collaborations', value: '38' },
  { label: 'Sustainable collections', value: '65%' },
  { label: 'Avg. customer rating', value: '4.9' },
];

const numberFormatter = new Intl.NumberFormat('en-US');

const formatPriceRange = (range) => {
  if (!range || (typeof range.min !== 'number' && typeof range.max !== 'number')) {
    return null;
  }

  const min = typeof range.min === 'number' ? range.min : null;
  const max = typeof range.max === 'number' ? range.max : null;

  if (min !== null && max !== null) {
    return `$${Math.round(min)} – $${Math.round(max)}`;
  }

  if (min !== null) {
    return `From $${Math.round(min)}`;
  }

  if (max !== null) {
    return `Up to $${Math.round(max)}`;
  }

  return null;
};

const toSlug = (value, fallback = 'brand') => {
  if (!value || typeof value !== 'string') return fallback;
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || fallback;
};

const buildPartnerCard = (partner, index) => {
  const accent = ACCENT_GRADIENTS[index % ACCENT_GRADIENTS.length];
  const name = partner?.name || 'Featured brand';
  const slug = partner?.slug || toSlug(name, `brand-${index}`);
  const topCategories = Array.isArray(partner?.topCategories)
    ? partner.topCategories.map((category) => category?.name).filter(Boolean)
    : [];
  const priceText = formatPriceRange(partner?.priceRange);
  const ratingValue = typeof partner?.averageRating === 'number' ? partner.averageRating : null;
  const productCount = typeof partner?.productCount === 'number' ? partner.productCount : null;
  const highlightProduct = partner?.highlightProduct;

  const highlights = [
    ratingValue ? `${ratingValue.toFixed(1)}★ avg rating` : null,
    productCount ? `${numberFormatter.format(productCount)} styles in rotation` : null,
    priceText,
    topCategories[0] ? `${topCategories[0]} focus` : null,
    highlightProduct?.discountPercentage
      ? `${highlightProduct.discountPercentage}% hero drop`
      : null,
  ]
    .filter(Boolean)
    .slice(0, 4);

  const primaryCategory = topCategories.slice(0, 2).join(' • ');
  const tagline = highlightProduct?.name
    ? `${highlightProduct.name}${highlightProduct.price ? ` · $${Math.round(highlightProduct.price)}` : ''}`
    : primaryCategory || 'Discover signature collaborations and best sellers curated for ShoeMarkNet.';

  return {
    name,
    slug,
    accent,
    badge: partner?.badge || 'Premium partner',
    categoryLabel: primaryCategory || partner?.categoryLabel || 'Featured collection',
    tagline,
    highlights: highlights.length ? highlights : ['Premium materials', 'Performance tuned'],
  };
};

const BrandsSection = memo(({ partners = [], metrics = [], isLoading = false }) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const enableAnimations = !prefersReducedMotion && !isLoading;

  const partnerMetrics = useMemo(() => {
    if (Array.isArray(metrics) && metrics.length > 0) {
      return metrics.slice(0, metricIcons.length);
    }
    return FALLBACK_METRICS;
  }, [metrics]);

  const brandPartners = useMemo(() => {
    if (Array.isArray(partners) && partners.length > 0) {
      return partners.map((partner, index) => buildPartnerCard(partner, index));
    }
    return FALLBACK_PARTNERS;
  }, [partners]);

  const headlineBadgeText = useMemo(() => {
    const primaryMetric = partnerMetrics?.[0];
    if (primaryMetric?.value) {
      return `${primaryMetric.value} partner brands`;
    }
    return 'Trusted by global footwear innovators';
  }, [partnerMetrics]);

  return (
    <section
      id="brands"
      className="relative overflow-hidden py-16 md:py-20 bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-950 dark:to-black text-gray-900 dark:text-white"
      aria-labelledby="brand-showcase-heading"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className={`absolute -top-20 left-1/4 h-60 w-60 rounded-full bg-gradient-to-br from-emerald-300/30 via-teal-300/40 to-sky-300/30 dark:from-emerald-500/30 dark:via-teal-500/40 dark:to-sky-500/30 blur-3xl ${
            enableAnimations ? 'animate-pulse-slow' : ''
          }`}
        ></div>
        <div
          className={`absolute bottom-[-6rem] right-1/5 h-72 w-72 rounded-full bg-gradient-to-br from-violet-300/30 via-purple-300/30 to-pink-300/30 dark:from-violet-600/30 dark:via-purple-600/30 dark:to-pink-600/30 blur-[180px] ${
            enableAnimations ? 'animate-pulse-slow' : ''
          }`}
        ></div>
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.1),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%)]"
        ></div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-white/10 bg-blue-100 dark:bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-blue-700 dark:text-teal-200">
            <Sparkles size={14} aria-hidden="true" />
            {headlineBadgeText}
          </div>
          <h2
            id="brand-showcase-heading"
            className="mt-6 text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"
          >
            Elevating the future of <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-teal-300 dark:via-cyan-300 dark:to-blue-300 bg-clip-text text-transparent">footwear brands</span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-gray-700 dark:text-slate-200/80">
            Explore our curated roster of partner labels delivering craftsmanship, sustainable materials, and smart performance built exclusively for ShoeMarkNet customers.
            Currently spotlighting {brandPartners.length} {brandPartners.length === 1 ? 'brand' : 'brands'}.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {partnerMetrics.map((metric, index) => {
            const Icon = metricIcons[index % metricIcons.length];
            return (
              <div
                key={metric.label}
                className="group relative overflow-hidden rounded-3xl border border-blue-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 backdrop-blur transition transform-gpu hover:-translate-y-1 hover:border-blue-300/40 dark:hover:border-teal-300/40 focus-within:border-blue-300/40 dark:focus-within:border-teal-300/40 focus-within:ring-2 focus-within:ring-blue-300/40 dark:focus-within:ring-teal-300/40"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400/30 to-indigo-400/30 dark:from-teal-500/40 dark:to-blue-500/40 text-blue-700 dark:text-teal-200 shadow-inner ${
                      enableAnimations ? 'animate-bounce-slow' : ''
                    }`}
                    aria-hidden="true"
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</div>
                    <p className="text-sm text-gray-600 dark:text-slate-300">{metric.label}</p>
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      'radial-gradient(100% 100% at 50% 0%, rgba(59,130,246,0.35), transparent)',
                  }}
                ></div>
              </div>
            );
          })}
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {brandPartners.map((brand) => (
            <article
              key={brand.name}
              className="group relative overflow-hidden rounded-3xl border border-blue-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 lg:p-8 shadow-[0_25px_60px_-35px_rgba(59,130,246,0.55)] dark:shadow-[0_25px_60px_-35px_rgba(56,189,248,0.55)] transition-all duration-500 focus-within:ring-2 focus-within:ring-blue-300/40 dark:focus-within:ring-teal-300/40 focus-within:ring-offset-2 focus-within:ring-offset-white dark:focus-within:ring-offset-slate-900 hover:border-blue-300/40 dark:hover:border-teal-200/40 hover:shadow-[0_30px_70px_-40px_rgba(59,130,246,0.55)] dark:hover:shadow-[0_30px_70px_-40px_rgba(45,212,191,0.55)]"
              aria-label={`${brand.name} brand spotlight`}
            >
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${brand.accent} text-white font-semibold text-lg shadow-lg`}
                      aria-hidden="true"
                    >
                      {brand.name
                        .split(' ')
                        .map((token) => token?.[0])
                        .filter(Boolean)
                        .join('')
                        .slice(0, 3)
                        .toUpperCase() || 'SB'}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{brand.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-slate-300">{brand.categoryLabel}</p>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-2 rounded-full border border-blue-200 dark:border-white/10 bg-blue-50 dark:bg-white/10 px-3 py-1 text-xs font-medium text-blue-800 dark:text-slate-100">
                    <Star size={14} className="text-amber-500 dark:text-amber-300" aria-hidden="true" />
                    {brand.badge}
                  </div>
                </div>

                <p className="text-base text-gray-800 dark:text-slate-200/85">{brand.tagline}</p>

                <ul className="flex flex-wrap gap-2 text-sm text-gray-700 dark:text-slate-200/90">
                  {brand.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-white/10 bg-blue-50 dark:bg-white/10 px-3 py-1"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-teal-300" aria-hidden="true"></span>
                      {highlight}
                    </li>
                  ))}
                </ul>

                <Link
                  to={`/brands/${brand.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-teal-200 transition-colors hover:text-blue-800 dark:hover:text-teal-100 focus-visible:text-blue-800 dark:focus-visible:text-teal-100"
                >
                  Explore collection
                  <span aria-hidden="true" className="text-base">→</span>
                </Link>
              </div>

              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(99,102,241,0.15) 45%, rgba(79,70,229,0.15) 100%)',
                  mixBlendMode: 'screen',
                }}
              ></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
});

BrandsSection.displayName = 'BrandsSection';

export default BrandsSection;
