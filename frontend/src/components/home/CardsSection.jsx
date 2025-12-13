"use client";

import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import * as motion from "motion/react-client";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";

const BRAND_ACCENT_PALETTE = [
  "from-orange-500/80 via-rose-500/70 to-red-500/80",
  "from-green-500/80 via-emerald-500/70 to-teal-500/80",
  "from-amber-500/80 via-orange-500/70 to-red-400/80",
  "from-blue-500/80 via-indigo-500/70 to-cyan-500/80",
  "from-cyan-500/80 via-sky-500/70 to-blue-500/80",
  "from-red-500/80 via-orange-500/70 to-yellow-500/80",
  "from-slate-500/80 via-gray-500/70 to-zinc-500/80",
  "from-lime-500/80 via-green-500/70 to-emerald-500/80",
];

const CATEGORY_ACCENT_MAP = {
  primary: "from-purple-500/80 via-indigo-500/70 to-blue-500/80",
  secondary: "from-teal-500/80 via-cyan-500/70 to-blue-400/80",
  accent: "from-rose-500/80 via-pink-500/70 to-fuchsia-500/80",
  neutral: "from-slate-500/80 via-gray-500/70 to-zinc-500/80",
  default: "from-blue-600/80 via-indigo-600/70 to-purple-600/80",
};

const SIZE_PATTERN = [
  "hero",
  "tall",
  "base",
  "wide",
  "base",
  "tall",
  "base",
  "wide",
  "base",
  "hero",
  "base",
  "wide",
];

const SIZE_VARIANTS = {
  base: "md:col-span-1 md:row-span-1 xl:col-span-1 xl:row-span-1",
  wide: "md:col-span-2 md:row-span-1 xl:col-span-2 xl:row-span-1",
  tall: "md:col-span-1 md:row-span-2 xl:col-span-1 xl:row-span-1",
  hero: "md:col-span-2 md:row-span-2 xl:col-span-3 xl:row-span-2",
};

const CATEGORY_SHUFFLE_INTERVAL = 3600;

const spring = {
  type: "spring",
  damping: 20,
  stiffness: 300,
};

const numberFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
});

const shuffleOrder = (source) => {
  const array = [...source];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const normaliseKey = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const createCardId = (prefix, value, index) => {
  const key = normaliseKey(value);
  if (key) {
    return `${prefix}-${key}`;
  }
  return `${prefix}-${index}`;
};

const formatCurrency = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }
  return `$${Math.round(value).toLocaleString()}`;
};

const formatBrandMeta = (partner) => {
  if (!partner) return null;

  const details = [];

  if (typeof partner.productCount === "number" && partner.productCount > 0) {
    details.push(`${numberFormatter.format(partner.productCount)} styles`);
  }

  if (typeof partner.averageRating === "number" && partner.averageRating > 0) {
    details.push(`${partner.averageRating.toFixed(1)} rating`);
  }

  const priceRange = partner.priceRange || {};
  const min = formatCurrency(priceRange.min);
  const max = formatCurrency(priceRange.max);

  if (min && max) {
    details.push(`${min}-${max}`);
  } else if (min) {
    details.push(`From ${min}`);
  } else if (max) {
    details.push(`Up to ${max}`);
  }

  return details.length ? details.join(" | ") : null;
};

const formatCategoryMeta = (category) => {
  if (!category) return null;

  const parts = [];

  if (typeof category.productCount === "number" && category.productCount > 0) {
    parts.push(`${numberFormatter.format(category.productCount)} styles`);
  }

  if (category.level) {
    parts.push(`Level ${category.level}`);
  }

  return parts.length ? parts.join(" | ") : null;
};

const truncate = (value, length = 80) => {
  if (typeof value !== "string" || value.length === 0) {
    return null;
  }

  if (value.length <= length) {
    return value;
  }

  return `${value.slice(0, Math.max(0, length - 3))}...`;
};

const interleave = (first, second) => {
  const result = [];
  const max = Math.max(first.length, second.length);
  for (let i = 0; i < max; i += 1) {
    if (first[i]) {
      result.push(first[i]);
    }
    if (second[i]) {
      result.push(second[i]);
    }
  }
  return result;
};

const CardSection = ({
  partners = [],
  categories = [],
  isLoading = false,
  error = null,
  onRetry,
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const enableAnimations = !prefersReducedMotion;

  const brandCards = useMemo(() => {
    if (!Array.isArray(partners)) {
      return [];
    }

    return partners
      .map((partner, index) => {
        const name = partner?.name || partner?._id || `Partner ${index + 1}`;
        const highlightName = partner?.highlightProduct?.name
          ? `Top pick: ${partner.highlightProduct.name}`
          : null;

        return {
          id: createCardId("brand", name, index),
          name,
          type: "brand",
          accent: BRAND_ACCENT_PALETTE[index % BRAND_ACCENT_PALETTE.length],
          href: name ? `/products?brand=${encodeURIComponent(name)}` : "/products",
          label: "Partner brand",
          image: partner?.highlightProduct?.image || null,
          meta: formatBrandMeta(partner),
          subtext: highlightName,
        };
      })
      .filter((card, index, arr) => card && arr.findIndex((item) => item.id === card.id) === index);
  }, [partners]);

  const categoryCards = useMemo(() => {
    if (!Array.isArray(categories)) {
      return [];
    }

    return categories
      .map((category, index) => {
        const slugOrName = category?.slug || category?.name || `category-${index + 1}`;
        const accentKey = category?.accent && CATEGORY_ACCENT_MAP[category.accent]
          ? category.accent
          : "default";

        return {
          id: createCardId("category", slugOrName, index),
          name: category?.name || `Category ${index + 1}`,
          type: "category",
          accent: CATEGORY_ACCENT_MAP[accentKey],
          href: category?.slug
            ? `/products?category=${encodeURIComponent(category.slug)}`
            : "/products",
          label: "Trending category",
          image: category?.image || null,
          meta: formatCategoryMeta(category),
          subtext: truncate(category?.description, 80),
        };
      })
      .filter((card, index, arr) => card && arr.findIndex((item) => item.id === card.id) === index);
  }, [categories]);

  const cards = useMemo(() => {
    const combined = interleave(brandCards, categoryCards);
    if (combined.length === 0) {
      return [];
    }

    return combined.map((card, index) => ({
      ...card,
      size: SIZE_PATTERN[index % SIZE_PATTERN.length] || "base",
    }));
  }, [brandCards, categoryCards]);

  const cardLookup = useMemo(() => new Map(cards.map((card) => [card.id, card])), [cards]);
  const sizeSequence = useMemo(() => cards.map((card) => card.size), [cards]);

  const [layout, setLayout] = useState(() =>
    cards.map(({ id, size }) => ({ id, size }))
  );

  useEffect(() => {
    if (cards.length === 0) {
      setLayout([]);
      return;
    }

    setLayout((previous) => {
      const nextEntries = cards.map(({ id, size }) => ({ id, size }));
      const isSame =
        previous.length === nextEntries.length &&
        previous.every(
          (entry, index) =>
            entry.id === nextEntries[index].id && entry.size === nextEntries[index].size
        );

      if (isSame) {
        return previous;
      }

      const previousLookup = new Map(previous.map((entry) => [entry.id, entry]));

      return nextEntries.map((entry) => {
        const prior = previousLookup.get(entry.id);
        if (prior) {
          return { ...prior, size: entry.size };
        }
        return entry;
      });
    });
  }, [cards]);

  useEffect(() => {
    if (!enableAnimations || layout.length < 2 || sizeSequence.length === 0) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setLayout((previous) => {
        if (previous.length < 2) {
          return previous;
        }

        const shuffled = shuffleOrder(previous);
        const sizeAssignments = shuffleOrder(sizeSequence);

        return shuffled.map((entry, index) => ({
          id: entry.id,
          size: sizeAssignments[index] || entry.size,
        }));
      });
    }, CATEGORY_SHUFFLE_INTERVAL);

    return () => clearTimeout(timeoutId);
  }, [layout, enableAnimations, sizeSequence]);

  const orderedCards = useMemo(
    () =>
      layout
        .map(({ id, size }) => {
          const card = cardLookup.get(id);
          if (!card) {
            return null;
          }
          return { ...card, size };
        })
        .filter(Boolean),
    [layout, cardLookup]
  );

  const showSkeleton = isLoading && orderedCards.length === 0;
  const showError = Boolean(error) && !isLoading && orderedCards.length === 0;

  const renderSkeletonItems = () => {
    const count = Math.min(6, SIZE_PATTERN.length);
    return Array.from({ length: count }).map((_, index) => {
      const sizeKey = SIZE_PATTERN[index % SIZE_PATTERN.length];
      const sizeClass = SIZE_VARIANTS[sizeKey] || SIZE_VARIANTS.base;
      return (
        <li key={`skeleton-${index}`} className={`h-full ${sizeClass}`}>
          <div className="h-full w-full rounded-3xl border border-blue-200/40 bg-white/60 shadow-md shadow-slate-900/5 backdrop-blur dark:border-white/10 dark:bg-white/10" />
        </li>
      );
    });
  };

  return (
    <section
      id="brands"
      className="relative overflow-hidden py-20 md:py-24 bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-950/100 dark:via-slate-950 dark:to-black"
      aria-labelledby="brand-showcase-heading"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className={`absolute -top-20 left-1/4 h-60 w-60 rounded-full bg-gradient-to-br from-emerald-300/30 via-teal-300/40 to-sky-300/30 dark:from-emerald-500/20 dark:via-teal-500/30 dark:to-sky-500/20 blur-3xl ${
            enableAnimations ? "animate-pulse" : ""
          }`}
        />
        <div
          className={`absolute bottom-[-6rem] right-1/5 h-72 w-72 rounded-full bg-gradient-to-br from-violet-300/30 via-purple-300/30 to-pink-300/30 dark:from-violet-600/20 dark:via-purple-600/30 dark:to-pink-600/20 blur-[180px] ${
            enableAnimations ? "animate-pulse" : ""
          }`}
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="container-app relative z-10">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-100 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-blue-700 dark:border-white/10 dark:bg-white/5 dark:text-teal-200">
            <Sparkles
              size={14}
              aria-hidden="true"
              className={enableAnimations ? "animate-pulse" : ""}
            />
            Spotlight brands & categories
          </div>
          <h2
            id="brand-showcase-heading"
            className="text-3xl font-bold leading-tight text-gray-900 md:text-4xl lg:text-5xl dark:text-white"
          >
            Discover premium{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-teal-300 dark:via-cyan-300 dark:to-blue-300">
              footwear stories
            </span>
          </h2>
          <p className="mt-4 text-base text-gray-700 md:text-lg dark:text-slate-200/80">
            Explore our curated selection of top brands and trending categories,
            each sourced directly from the live catalogue.
          </p>
        </div>

        <div className="space-y-10">
          {showError ? (
            <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-white/70 px-6 py-10 text-center shadow-md dark:border-red-400/30 dark:bg-white/5">
              <p className="text-base font-semibold text-red-600 dark:text-red-300">
                We could not load the spotlight collections right now.
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Please refresh the page or try again in a few moments.
              </p>
              {typeof onRetry === "function" ? (
                <button
                  type="button"
                  onClick={onRetry}
                  className="mt-4 inline-flex items-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400 dark:focus:ring-teal-300 dark:focus:ring-offset-slate-900"
                >
                  Try again
                </button>
              ) : null}
            </div>
          ) : (
            <div className="relative h-[600px] md:h-[650px] lg:h-[900px] overflow-hidden rounded-2xl">
              <motion.ul
                layout
                className="grid grid-flow-dense grid-cols-2 gap-5 auto-rows-[220px] sm:grid-cols-2 sm:auto-rows-[240px] md:grid-cols-4 md:auto-rows-[220px] xl:grid-cols-7 xl:auto-rows-[200px]"
              >
              {showSkeleton
                ? renderSkeletonItems()
                : orderedCards.map((item) => {
                    const sizeClass = SIZE_VARIANTS[item?.size] || SIZE_VARIANTS.base;

                    return (
                      <motion.li
                        key={item.id}
                        layout
                        transition={spring}
                        initial={
                          enableAnimations ? { opacity: 0, y: 24 } : undefined
                        }
                        animate={enableAnimations ? { opacity: 1, y: 0 } : undefined}
                        whileHover={
                          enableAnimations ? { y: -8, scale: 1.01 } : undefined
                        }
                        className={`h-full ${sizeClass}`}
                      >
                        <Link
                          to={item.href}
                          className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-blue-200/60 bg-white/70 shadow-lg transition-all duration-300 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-white/10 dark:bg-white/10 dark:focus:ring-teal-400 dark:focus:ring-offset-slate-900"
                          aria-label={`Browse ${item.name}`}
                        >
                          <div className="relative flex-1 overflow-hidden">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={`${item.name} spotlight`}
                                loading="lazy"
                                className={`h-full w-full object-cover transition-transform duration-700 ${
                                  enableAnimations ? "group-hover:scale-105" : ""
                                }`}
                              />
                            ) : (
                              <div
                                className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${item.accent} opacity-90`}
                              >
                                <span className="text-sm font-semibold uppercase tracking-widest text-white/80">
                                  Spotlight
                                </span>
                              </div>
                            )}
                            <div
                              className={`absolute inset-0 bg-gradient-to-br ${item.accent} ${
                                item.image
                                  ? "opacity-70 mix-blend-multiply"
                                  : "opacity-90"
                              } transition-opacity duration-500 ${
                                enableAnimations ? "group-hover:opacity-90" : ""
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
                              {item.meta ? (
                                <p className="text-sm font-medium text-white/80 drop-shadow">
                                  {item.meta}
                                </p>
                              ) : null}
                              {item.subtext ? (
                                <p className="text-xs text-white/75 drop-shadow-sm">
                                  {item.subtext}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </Link>
                      </motion.li>
                    );
                  })}
              </motion.ul>
              {/* Bottom fade gradient overlay */}
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent dark:from-black dark:via-slate-900/80" />
            </div>
          )}
        </div>

        <div className="mt-16 text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:from-teal-400 dark:to-blue-400 dark:text-gray-900 dark:focus:ring-teal-400 dark:focus:ring-offset-slate-900"
          >
            View All Products
            <ArrowRight size={18} className="ml-1" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
};

CardSection.displayName = "CardSection";

CardSection.propTypes = {
  partners: PropTypes.arrayOf(PropTypes.object),
  categories: PropTypes.arrayOf(PropTypes.object),
  isLoading: PropTypes.bool,
  error: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object,
    PropTypes.string,
    PropTypes.number,
  ]),
  onRetry: PropTypes.func,
};

export default CardSection;
