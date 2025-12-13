import React, { memo, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Tag, Sparkles } from "lucide-react";
import { animate, motion, useMotionValue, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";

const FALLBACK_PROMOTIONS = [
  {
    id: "summer-sale",
    title: "Summer Sale",
    description: "Up to 50% off on all summer footwear",
    discount: "50%",
    image:
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=600&auto=format&fit=crop",
    link: "/sale",
    badge: "Limited Time",
  },
  {
    id: "new-arrivals",
    title: "New Arrivals",
    description: "Latest collection of premium shoes",
    discount: "25%",
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop",
    link: "/new-arrivals",
    badge: "Fresh Stock",
  },
  {
    id: "premium-bundles",
    title: "Premium Bundles",
    description: "Curated multi-pair packs crafted for everyday versatility.",
    discount: "35%",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop",
    link: "/collections/bundles",
    badge: "Editor’s Pick",
  },
  {
    id: "members-only",
    title: "Members Only Drop",
    description: "Unlock limited releases with exclusive loyalty perks inside.",
    discount: "Loyalty",
    image:
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1200&auto=format&fit=crop",
    link: "/rewards",
    badge: "Early Access",
  },
];

const normaliseDiscount = (discount) => {
  if (discount === null || discount === undefined) return null;
  if (typeof discount === "number") {
    return `${Math.round(discount)}%`;
  }
  if (typeof discount === "string") {
    return discount.trim();
  }
  return null;
};

const normalisePromotion = (promotion, index) => {
  const discountValue = normaliseDiscount(promotion?.discount);
  return {
    id: promotion?.id || `promotion-${index}`,
    title: promotion?.title || "Exclusive offer",
    description:
      promotion?.description ||
      "Handpicked deals on the most sought-after footwear labels.",
    discount: discountValue || "New",
    image: promotion?.image || "/api/placeholder/600/300",
    link: promotion?.link || "/products",
    badge: promotion?.badge || (discountValue ? "Limited Time" : "Featured"),
    startsAt: promotion?.startDate || promotion?.startsAt || null,
    endsAt: promotion?.endDate || promotion?.endsAt || null,
  };
};

const MASK_LEFT = "0%";
const MASK_RIGHT = "100%";
const MASK_LEFT_INSET = "20%";
const MASK_RIGHT_INSET = "80%";
const MASK_TRANSPARENT = "#0000";
const MASK_OPAQUE = "#000";
const EDGE_MASK = `linear-gradient(90deg, ${MASK_OPAQUE}, ${MASK_OPAQUE} ${MASK_LEFT}, ${MASK_OPAQUE} ${MASK_RIGHT_INSET}, ${MASK_TRANSPARENT})`;
const REVERSE_EDGE_MASK = `linear-gradient(90deg, ${MASK_TRANSPARENT}, ${MASK_OPAQUE} ${MASK_LEFT_INSET}, ${MASK_OPAQUE} ${MASK_RIGHT}, ${MASK_OPAQUE})`;
const CENTER_MASK = `linear-gradient(90deg, ${MASK_TRANSPARENT}, ${MASK_OPAQUE} ${MASK_LEFT_INSET}, ${MASK_OPAQUE} ${MASK_RIGHT_INSET}, ${MASK_TRANSPARENT})`;

const useScrollOverflowMask = (scrollXProgress, isActive) => {
  const maskImage = useMotionValue(EDGE_MASK);

  useMotionValueEvent(scrollXProgress, "change", (value) => {
    if (!isActive) {
      maskImage.set(CENTER_MASK);
      return;
    }

    if (value === 0) {
      animate(maskImage, EDGE_MASK);
      return;
    }

    if (value === 1) {
      animate(maskImage, REVERSE_EDGE_MASK);
      return;
    }

    const previous =
      typeof scrollXProgress.getPrevious === "function" ? scrollXProgress.getPrevious() : null;

    if (previous === 0 || previous === 1) {
      animate(maskImage, CENTER_MASK);
    }
  });

  return maskImage;
};

const CARD_WIDTH_CLAMP = "clamp(22rem, 75vw, 28rem)";

const OffersSection = memo(({ promotions = [], isLoading = false }) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const enableAnimations = !prefersReducedMotion && !isLoading;
  const shimmerClass = enableAnimations ? "animate-gradient" : "";
  const pulseClass = enableAnimations ? "animate-pulse" : "";
  const spinClass = enableAnimations ? "animate-spin-slow" : "";
  const scrollContainerRef = useRef(null);
  const { scrollXProgress } = useScroll({ container: scrollContainerRef, axis: "x" });
  const maskImage = useScrollOverflowMask(scrollXProgress, enableAnimations);
  const scrollMaskStyle = enableAnimations
    ? { maskImage, WebkitMaskImage: maskImage }
    : { maskImage: CENTER_MASK, WebkitMaskImage: CENTER_MASK };
  const leftFadeOpacityMotion = useTransform(scrollXProgress, [0, 0.05], [0, 1]);
  const rightFadeOpacityMotion = useTransform(scrollXProgress, [0.95, 1], [1, 0]);
  const zeroOpacity = useMotionValue(0);
  const fullOpacity = useMotionValue(1);
  const leftFadeOpacity = enableAnimations ? leftFadeOpacityMotion : zeroOpacity;
  const rightFadeOpacity = enableAnimations ? rightFadeOpacityMotion : fullOpacity;
  const usingFallback = !Array.isArray(promotions) || promotions.length === 0;
  const cardWidth = usingFallback ? "clamp(24rem, 88vw, 30rem)" : CARD_WIDTH_CLAMP;
  const cardInitial = enableAnimations ? { opacity: 0, y: 28 } : { opacity: 1, y: 0 };
  const cardWhileInView = enableAnimations ? { opacity: 1, y: 0 } : undefined;
  const cardViewport = enableAnimations ? { once: true, amount: 0.45 } : undefined;
  const cardTransition = enableAnimations
    ? { type: "spring", stiffness: 220, damping: 28, mass: 0.85 }
    : undefined;
  const hoverMotionProps = enableAnimations
    ? { whileHover: { y: -12, scale: 1.01 }, whileTap: { scale: 0.995 } }
    : {};

  const offers = useMemo(() => {
    if (!usingFallback) {
      return promotions.map((promotion, index) => normalisePromotion(promotion, index));
    }
    return FALLBACK_PROMOTIONS.map((promotion, index) => normalisePromotion(promotion, index));
  }, [promotions, usingFallback]);

  return (
    <section
      id="offers"
      className="relative overflow-hidden bg-slate-50 py-14 dark:bg-slate-950"
      aria-label="Special offers and deals"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.22),_transparent_55%)]" />
      <div className="container-app relative">
        <div className="mb-12 text-center">
          <div className="mb-6 inline-flex items-center space-x-2 rounded-full bg-blue-100/80 px-6 py-3 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <Tag size={16} className={pulseClass} aria-hidden="true" />
            <span className="text-sm font-semibold">Exclusive Deals</span>
            <Sparkles size={14} className={spinClass} aria-hidden="true" />
          </div>
          <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Special {" "}
            <span
              className={`bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent ${shimmerClass}`}
            >
              Offers
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-300">
            Don't miss out on curated bundles and seasonal steals tailored to elevate your rotation.
          </p>
        </div>

        <div className="relative">
          <motion.ul
            ref={scrollContainerRef}
            style={scrollMaskStyle}
            className="offers-track flex snap-x snap-mandatory gap-6 overflow-x-auto px-3 py-6 "
          >
            {offers.map((offer) => {
              const discountText = offer.discount ?? "";
              const hasPercentValue = typeof discountText === "string" && discountText.includes("%");
              const discountBadgeLabel = hasPercentValue ? `${discountText} OFF` : discountText;
              const discountPillLabel = hasPercentValue ? `Save ${discountText}` : discountText;

              return (
                <motion.li
                  key={offer.id}
                  className="offers-card flex-none snap-start"
                  style={{ flexBasis: cardWidth, minWidth: cardWidth, maxWidth: usingFallback ? "30rem" : "26rem" }}
                  layout
                  initial={cardInitial}
                  whileInView={cardWhileInView}
                  viewport={cardViewport}
                  transition={cardTransition}
                  {...hoverMotionProps}
                >
                  <Link
                    to={offer.link}
                    className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white/85 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.65)] backdrop-blur-lg transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/40 focus:ring-offset-2 focus:ring-offset-white dark:border-slate-800/60 dark:bg-slate-900/75 dark:shadow-black/40 dark:focus:ring-offset-slate-950"
                    aria-label={`${offer.title} - ${offer.description} - ${offer.discount} off`}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={offer.image}
                        alt={`${offer.title} promotion`}
                        className={`h-full w-full object-cover transition-transform duration-700 ${enableAnimations ? "group-hover:scale-[1.08]" : ""}`}
                        onError={(e) => {
                          e.target.src = "/api/placeholder/600/300";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/15 to-transparent" aria-hidden="true" />
                      <motion.div
                        aria-hidden="true"
                        className="absolute inset-x-6 bottom-6 flex items-center justify-between text-xs font-semibold text-white"
                        initial={enableAnimations ? { opacity: 0, y: 12 } : { opacity: 1, y: 0 }}
                        animate={enableAnimations ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
                      >
                        <span className="rounded-full bg-slate-900/70 px-3 py-1 backdrop-blur">
                          {offer.badge}
                        </span>
                        <span className="rounded-full bg-blue-500 px-3 py-1 shadow-lg shadow-blue-500/30">
                          {discountBadgeLabel}
                        </span>
                      </motion.div>
                      <div
                        aria-hidden="true"
                        className={`pointer-events-none absolute inset-0 opacity-0 transition duration-700 ${enableAnimations ? "group-hover:opacity-100" : ""}`}
                      >
                        <div
                          className={`absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-[900ms] ease-out ${
                            enableAnimations ? "group-hover:translate-x-full" : ""
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col justify-between px-6 pb-7 pt-6">
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-600 shadow-sm shadow-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
                            {discountPillLabel}
                          </span>
                          <span className="text-slate-500 dark:text-slate-300">{offer.badge}</span>
                        </div>
                        <h3 className="text-2xl font-semibold text-slate-900 transition-colors duration-300 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                          {offer.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                          {offer.description}
                        </p>
                      </div>
                      <div className="mt-8 flex items-center justify-between text-sm font-medium">
                        <span
                          className={`flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-300 ${
                            enableAnimations
                              ? "bg-blue-600/10 text-blue-600 group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-500/10 dark:text-blue-300 dark:group-hover:bg-blue-500/60"
                              : "bg-blue-600/10 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300"
                          }`}
                        >
                          Shop now
                          <ArrowRight
                            size={18}
                            aria-hidden="true"
                            className={`transition-transform duration-300 ${enableAnimations ? "group-hover:translate-x-1.5" : ""}`}
                          />
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">Limited window</span>
                      </div>
                    </div>

                    <div className="pointer-events-none absolute inset-x-6 top-6 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent opacity-60" aria-hidden="true" />
                  </Link>
                </motion.li>
              );
            })}
          </motion.ul>

          <motion.div
            className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-50 via-slate-50/95 to-transparent dark:from-slate-950/95 dark:via-slate-950/85 sm:w-32 lg:w-40"
            aria-hidden="true"
            style={{ opacity: leftFadeOpacity }}
          />
          <motion.div
            className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-50 via-slate-50/95 to-transparent dark:from-slate-950/95 dark:via-slate-950/85 sm:w-32 lg:w-40"
            aria-hidden="true"
            style={{ opacity: rightFadeOpacity }}
          />
        </div>
      </div>
      <StyleSheet />
    </section>
  );
});

OffersSection.displayName = "OffersSection";

const StyleSheet = () => (
  <style>{`
    #offers .offers-track {
      scrollbar-width: thin;
      scrollbar-color: rgba(59,130,246,0.45) transparent;
      mask-repeat: no-repeat;
      -webkit-mask-repeat: no-repeat;
    }

    #offers .offers-track::-webkit-scrollbar {
      height: 6px;
    }

    #offers .offers-track::-webkit-scrollbar-track {
      background: transparent;
    }

    #offers .offers-track::-webkit-scrollbar-thumb {
      background: rgba(59,130,246,0.55);
      border-radius: 9999px;
    }
  `}</style>
);

export default OffersSection;
