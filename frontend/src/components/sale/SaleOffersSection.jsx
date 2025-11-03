import React, { memo, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Tag, Sparkles, Flame } from "lucide-react";
import { animate, motion, useMotionValue, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";

const FALLBACK_SALE_OFFERS = [
  {
    id: "flash-sale",
    title: "Flash Sale",
    description: "Lightning-fast deals on trending sneakers",
    discount: "60%",
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop",
    link: "/sale",
    badge: "Limited Time",
    type: "flash",
  },
  {
    id: "clearance",
    title: "Clearance Sale",
    description: "Last chance to grab discontinued styles",
    discount: "70%",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop",
    link: "/categories/clearance",
    badge: "Final Call",
    type: "clearance",
  },
  {
    id: "bundle-deals",
    title: "Bundle Deals",
    description: "Buy more, save more with curated packs",
    discount: "40%",
    image:
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1200&auto=format&fit=crop",
    link: "/collections/bundles",
    badge: "Best Value",
    type: "bundle",
  },
  {
    id: "seasonal-sale",
    title: "Seasonal Sale",
    description: "End of season markdowns on premium brands",
    discount: "50%",
    image:
      "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?q=80&w=1200&auto=format&fit=crop",
    link: "/categories/seasonal",
    badge: "Season End",
    type: "seasonal",
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

const normaliseSaleOffer = (offer, index) => {
  const discountValue = normaliseDiscount(offer?.discount);
  return {
    id: offer?.id || `sale-offer-${index}`,
    title: offer?.title || "Exclusive sale offer",
    description:
      offer?.description ||
      "Limited-time deals on premium footwear and accessories.",
    discount: discountValue || "Sale",
    image: offer?.image || "/api/placeholder/600/300",
    link: offer?.link || "/sale",
    badge: offer?.badge || "On Sale",
    type: offer?.type || "general",
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

    maskImage.set(CENTER_MASK);
  });

  return maskImage;
};

const SaleOffersSection = memo(({ offers: propOffers }) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const scrollContainerRef = useRef(null);

  const { scrollXProgress } = useScroll({
    container: scrollContainerRef,
  });

  const scrollMaskStyle = useScrollOverflowMask(scrollXProgress, !prefersReducedMotion);

  const offers = useMemo(() => {
    if (propOffers && Array.isArray(propOffers) && propOffers.length > 0) {
      return propOffers.map((offer, index) => normaliseSaleOffer(offer, index));
    }
    return FALLBACK_SALE_OFFERS.map((offer, index) => normaliseSaleOffer(offer, index));
  }, [propOffers]);

  const pulseClass = prefersReducedMotion ? "" : "animate-pulse";
  const spinClass = prefersReducedMotion ? "" : "animate-spin";
  const shimmerClass = prefersReducedMotion ? "" : "animate-shimmer";

  return (
    <section
      id="sale-offers"
      className="relative overflow-hidden bg-gradient-to-r from-sky-50 via-indigo-50 to-rose-50 py-16 dark:from-sky-950/20 dark:via-indigo-950/20 dark:to-rose-950/20"
      aria-label="Special sale offers and deals"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.1),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.15),_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(168,85,247,0.1),_transparent_60%)] dark:bg-[radial-gradient(circle_at_bottom,_rgba(168,85,247,0.15),_transparent_60%)]" />

      <div className="relative mx-auto w-full max-w-4/5 px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mb-6 inline-flex items-center space-x-2 rounded-full bg-sky-100/80 px-6 py-3 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400">
            <Flame size={16} className={pulseClass} aria-hidden="true" />
            <span className="text-sm font-semibold">Limited Time Offers</span>
            <Sparkles size={14} className={spinClass} aria-hidden="true" />
          </div>
          <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Exclusive Sale {" "}
            <span
              className={`bg-gradient-to-r from-sky-600 via-indigo-500 to-rose-500 bg-clip-text text-transparent ${shimmerClass}`}
            >
              Collections
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-300">
            Don't miss these curated sale collections with massive discounts on premium footwear.
          </p>
        </div>

        <div className="relative">
          <motion.ul
            ref={scrollContainerRef}
            style={scrollMaskStyle}
            className="offers-track flex snap-x snap-mandatory gap-6 overflow-x-auto px-3 py-6"
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
                  style={{ flexBasis: "28rem", minWidth: "26rem", maxWidth: "30rem" }}
                >
                  <Link
                    to={offer.link}
                    className="group relative block h-full overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 shadow-lg shadow-slate-900/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-sky-500/10 dark:border-slate-700/60 dark:bg-slate-900/80 dark:shadow-slate-900/30"
                  >
                    {/* Background image */}
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={offer.image}
                        alt={offer.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>

                    {/* Content overlay */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                      {/* Badge */}
                      <div className="mb-3 self-start">
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                          <Tag size={12} />
                          {offer.badge}
                        </span>
                      </div>

                      {/* Title and description */}
                      <div className="mb-4">
                        <h3 className="mb-2 text-xl font-bold leading-tight">
                          {offer.title}
                        </h3>
                        <p className="text-sm text-white/90 leading-relaxed">
                          {offer.description}
                        </p>
                      </div>

                      {/* Discount and CTA */}
                      <div className="flex items-center justify-between">
                        <div className="rounded-full bg-white/20 backdrop-blur-sm px-4 py-2">
                          <span className="text-lg font-bold text-white">
                            {discountPillLabel}
                          </span>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all duration-200 group-hover:bg-white/30">
                          <ArrowRight size={20} className="text-white transition-transform duration-200 group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>

                    {/* Discount badge */}
                    <div className="absolute top-4 right-4 rounded-full bg-rose-500 px-3 py-1 text-sm font-bold text-white shadow-lg">
                      {discountBadgeLabel}
                    </div>
                  </Link>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>
      </div>
    </section>
  );
});

SaleOffersSection.displayName = "SaleOffersSection";

export default SaleOffersSection;