import React, { memo, useMemo, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Tag, Sparkles } from "lucide-react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
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

    const previous = typeof scrollXProgress.getPrevious === "function" ? scrollXProgress.getPrevious() : null;
    if (previous === 0 || previous === 1) {
      animate(maskImage, CENTER_MASK);
    }
  });

  return maskImage;
};

const OffersSection = memo(({ promotions = [], isLoading = false }) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const enableAnimations = !prefersReducedMotion && !isLoading;
  const shimmerClass = enableAnimations ? "animate-gradient" : "";
  const pulseClass = enableAnimations ? "animate-pulse-slow" : "";
  const floatClass = enableAnimations ? "animate-bounce-slow" : "";
  const underlineClass = enableAnimations
    ? "after:w-full after:opacity-100"
    : "after:w-full after:opacity-40";
  const scrollContainerRef = useRef(null);
  const { scrollXProgress } = useScroll({ container: scrollContainerRef, axis: "x" });
  const maskImage = useScrollOverflowMask(scrollXProgress, enableAnimations);
  const scrollMaskStyle = enableAnimations
    ? { maskImage, WebkitMaskImage: maskImage }
    : { maskImage: CENTER_MASK, WebkitMaskImage: CENTER_MASK };
  const [hoveredOffer, setHoveredOffer] = useState(null);
  const usingFallback = !Array.isArray(promotions) || promotions.length === 0;
  const cardWidthClass = usingFallback
    ? "w-[82vw] sm:w-[60vw] lg:w-auto xl:w-[50rem]"
    : "w-[68vw] sm:w-[18rem] lg:w-[22rem] xl:w-[24rem]";
  const cardFlexBasis = usingFallback
    ? "min(36rem, calc(50vw - 2.75rem))"
    : "min(22rem, calc(45vw - 2.5rem))";
  const baseImageHeightClass = usingFallback
    ? "h-60 sm:h-72 lg:h-[22rem]"
    : "h-48 sm:h-52 lg:h-56";

  const offers = useMemo(() => {
    if (!usingFallback) {
      return promotions.map((promotion, index) => normalisePromotion(promotion, index));
    }
    return FALLBACK_PROMOTIONS.map((promotion, index) => normalisePromotion(promotion, index));
  }, [promotions, usingFallback]);

  const handlePointerMove = useCallback(
    (event, offerId) => {
      if (!enableAnimations) {
        return;
      }

      setHoveredOffer((prev) => (prev === offerId ? prev : offerId));
      const card = event.currentTarget;
      const rect = card.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        return;
      }

      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--hover-x", `${x}%`);
      card.style.setProperty("--hover-y", `${y}%`);
    },
    [enableAnimations]
  );

  const handlePointerLeave = useCallback(
    (event) => {
      setHoveredOffer(null);
      if (!enableAnimations) {
        return;
      }

      const card = event.currentTarget;
      card.style.removeProperty("--hover-x");
      card.style.removeProperty("--hover-y");
    },
    [enableAnimations]
  );

  const handleFocus = useCallback(
    (event, offerId) => {
      setHoveredOffer(offerId);
      if (!enableAnimations) {
        return;
      }

      const card = event.currentTarget;
      card.style.setProperty("--hover-x", "50%");
      card.style.setProperty("--hover-y", "50%");
    },
    [enableAnimations]
  );

  return (
    <section
      id="offers"
      className="relative overflow-hidden py-16 md:py-20 bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950"
      aria-label="Special offers and deals"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className={`absolute -top-24 left-10 h-60 w-60 rounded-full bg-gradient-to-br from-blue-400/20 via-indigo-400/20 to-purple-400/20 blur-3xl ${pulseClass}`}
        ></div>
        <div
          className={`absolute bottom-[-5rem] right-16 h-64 w-64 rounded-full bg-gradient-to-br from-violet-500/15 via-purple-500/10 to-pink-500/10 blur-3xl ${pulseClass}`}
          style={{ animationDelay: "1.4s" }}
        ></div>
        
        <div className="absolute inset-0 mix-blend-soft-light">
          <div
            className={`absolute left-1/2 top-12 h-px w-48 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent ${shimmerClass}`}
          ></div>
        </div>
      </div>
      <div className="mx-auto w-full  px-4 sm:px-5 lg:px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-blue-100/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full px-6 py-3 mb-6">
            <Tag
              size={16}
              className={enableAnimations ? "animate-pulse" : ""}
              aria-hidden="true"
            />
            <span className="text-sm font-semibold">Exclusive Deals</span>
            <Sparkles
              size={14}
              className={enableAnimations ? "animate-spin-slow" : ""}
              aria-hidden="true"
            />
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Special{" "}
            <span
              className={`bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent ${shimmerClass}`}
            >
              Offers
            </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            Don't miss out on curated bundles and seasonal steals tailored to
            elevate your rotation.
          </p>
          
        </div>

        <div className="relative pt-4">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

          <motion.ul
            ref={scrollContainerRef}
            style={scrollMaskStyle}
            className="offers-scroll mx-auto flex  snap-x snap-mandatory gap-6 overflow-x-auto pb-10 pl-1 pr-10 pt-4 sm:gap-10"
          >
            {offers.map((offer, index) => {
              const isActive = enableAnimations && hoveredOffer === offer.id;
              const tallVariant = usingFallback ? index % 2 === 0 : index % 3 === 0;
              const imageHeightClass = tallVariant
                ? `${baseImageHeightClass} lg:h-[24rem]`
                : baseImageHeightClass;
              return (
                <motion.li
                  key={offer.id}
                  className={`flex-none ${cardWidthClass} snap-start ${
                    tallVariant ? "lg:mt-0" : "lg:mt-10"
                  } transition-[margin] duration-500`}
                  style={{ flexBasis: cardFlexBasis }}
                  layout
                >
                  <Link
                    to={offer.link}
                    className={`group relative block overflow-hidden rounded-3xl border ${
                      isActive
                        ? "border-blue-400/50 shadow-[0_25px_55px_-25px_rgba(37,99,235,0.6)]"
                        : "border-blue-100/50 shadow-[0_18px_45px_-30px_rgba(30,64,175,0.4)] dark:border-slate-800/60"
                    } bg-gradient-to-br from-white/95 via-blue-50/55 to-purple-100/45 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_-28px_rgba(30,64,175,0.65)] focus:outline-none focus:ring-4 focus:ring-blue-500/40 focus:ring-offset-2 focus:ring-offset-white dark:from-slate-900/85 dark:via-slate-900/70 dark:to-slate-900/60 dark:hover:from-slate-900/95 dark:hover:to-slate-800/70 dark:focus:ring-offset-slate-900`}
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
                        className={`${imageHeightClass} w-full object-cover transition-transform duration-700 group-hover:scale-110`}
                        onError={(e) => {
                          e.target.src = "/api/placeholder/600/300";
                        }}
                      />

                      {/* Discount Badge */}
                      <div className="absolute top-4 right-4 rounded-full bg-gradient-to-r from-rose-500 to-orange-400 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-rose-500/30">
                        {offer.discount} OFF
                      </div>

                      {/* Limited Time Badge */}
                      <div className="absolute top-4 left-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-3 py-1 text-xs font-semibold text-white shadow-md shadow-blue-500/30">
                        {offer.badge}
                      </div>

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                    </div>

                    <div className="p-6 sm:p-7">
                      <h3 className="relative mb-4 text-xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                        <span
                          className={`relative inline-block after:absolute after:left-0 after:bottom-[-6px] after:h-[2px] after:w-0 after:bg-gradient-to-r from-blue-500 to-purple-500 after:opacity-0 after:transition-all after:duration-300 ${underlineClass}`}
                        >
                          {offer.title}
                        </span>
                      </h3>
                      <p className="mb-8 text-base text-gray-600 dark:text-gray-300">
                        {offer.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-lg font-semibold text-blue-600 transition-all duration-300 group-hover:gap-4 dark:text-blue-400">
                          Shop Now
                          <ArrowRight
                            size={20}
                            className="transition-transform duration-300 group-hover:translate-x-2"
                            aria-hidden="true"
                          />
                        </span>

                        <div className="text-sm font-medium text-gray-500 transition-colors duration-300 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300">
                          Limited time offer
                        </div>
                      </div>
                    </div>

                    {/* Shine Effect */}
                    <div
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        background:
                          "radial-gradient(240px circle at var(--hover-x, 50%) var(--hover-y, 50%), rgba(59,130,246,0.25), transparent 65%)",
                        mixBlendMode: "screen",
                      }}
                    ></div>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 transition-transform duration-1000 ease-out group-hover:translate-x-full group-hover:opacity-100"></div>
                  </Link>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>
      </div>
      <StyleSheet />
    </section>
  );
});

OffersSection.displayName = "OffersSection";

const StyleSheet = () => (
  <style>{`
    #offers .progress-circle circle {
      stroke-dashoffset: 0;
    }

    #offers .offers-scroll {
      scrollbar-width: thin;
      scrollbar-color: rgba(59,130,246,0.5) rgba(255,255,255,0.15);
    }

    #offers .offers-scroll::-webkit-scrollbar {
      height: 6px;
    }

    #offers .offers-scroll::-webkit-scrollbar-track {
      background: rgba(255,255,255,0.15);
    }

    #offers .offers-scroll::-webkit-scrollbar-thumb {
      background: rgba(59,130,246,0.6);
      border-radius: 9999px;
    }
  `}</style>
);

export default OffersSection;
