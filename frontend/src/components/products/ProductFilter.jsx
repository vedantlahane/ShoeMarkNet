import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { debounce } from 'lodash';

const GENDER_OPTIONS = [
  { value: 'men', label: 'Men', icon: 'fa-mars' },
  { value: 'women', label: 'Women', icon: 'fa-venus' },
  { value: 'unisex', label: 'Unisex', icon: 'fa-venus-mars' }
];

const DEFAULT_PRICE = { min: 0, max: 1000 };

const ProductFilter = ({ currentFilters, onFilterChange }) => {
  const { categories, products } = useSelector((state) => state.product);
  
  const [priceRange, setPriceRange] = useState({
    min: currentFilters.priceRange?.min || DEFAULT_PRICE.min,
    max: currentFilters.priceRange?.max || DEFAULT_PRICE.max
  });

  // Memoized brands list
  const brands = useMemo(
    () => [...new Set(products?.map(p => p.brand).filter(Boolean))].sort(),
    [products]
  );

  // Debounced price change
  const debouncedPriceChange = useMemo(
    () => debounce((range) => {
      if (Number(range.min) <= Number(range.max)) {
        onFilterChange({ priceRange: range });
      }
    }, 500),
    [onFilterChange]
  );

  useEffect(() => {
    return () => debouncedPriceChange.cancel?.();
  }, [debouncedPriceChange]);

  useEffect(() => {
    const newMin = currentFilters.priceRange?.min ?? DEFAULT_PRICE.min;
    const newMax = currentFilters.priceRange?.max ?? DEFAULT_PRICE.max;

    setPriceRange(prev => {
      if (Number(prev.min) === Number(newMin) && Number(prev.max) === Number(newMax)) {
        return prev;
      }
      return { min: newMin, max: newMax };
    });
  }, [currentFilters.priceRange?.min, currentFilters.priceRange?.max]);

  const handleFilterToggle = useCallback((filterKey, value) => {
    onFilterChange({
      [filterKey]: currentFilters[filterKey] === value ? '' : value
    });
  }, [currentFilters, onFilterChange]);

  const handlePriceChange = useCallback((event) => {
    const { name, value } = event.target;
    const updatedRange = {
      ...priceRange,
      [name]: Number(value) || 0
    };

    setPriceRange(updatedRange);
    debouncedPriceChange(updatedRange);
  }, [priceRange, debouncedPriceChange]);

  return (
    <div className="space-y-5">
      {/* Categories */}
      <section className="rounded-2xl border border-slate-200/70 bg-white/60 p-5 shadow-sm backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-900/40">
        <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
          Categories
        </h3>
        <div className="flex flex-wrap gap-2">
          {categories?.map((category) => {
            const isSelected = currentFilters.category === (category._id || category.name);
            return (
              <button
                key={category._id || category.name}
                onClick={() => handleFilterToggle('category', category._id || category.name)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  isSelected
                    ? 'border-blue-500/70 bg-blue-500/80 text-white shadow-sm dark:border-blue-400/70 dark:bg-blue-500/80'
                    : 'border-transparent bg-white/70 text-slate-700 hover:border-slate-300 hover:bg-white/90 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-900/70'
                }`}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* Price Range */}
      <section className="rounded-2xl border border-slate-200/70 bg-white/60 p-5 shadow-sm backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-900/40">
        <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
          Price Range
        </h3>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
            <input
              type="number"
              name="min"
              value={priceRange.min}
              onChange={handlePriceChange}
              min="0"
              placeholder="Min"
              className="w-full rounded-xl border border-slate-200/70 bg-white/70 py-2.5 pl-7 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700/60 dark:bg-slate-900/40 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
            />
          </div>
          <span className="text-slate-400">—</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
            <input
              type="number"
              name="max"
              value={priceRange.max}
              onChange={handlePriceChange}
              min="0"
              placeholder="Max"
              className="w-full rounded-xl border border-slate-200/70 bg-white/70 py-2.5 pl-7 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700/60 dark:bg-slate-900/40 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
            />
          </div>
        </div>
      </section>

      {/* Brands */}
      {brands.length > 0 && (
        <section className="rounded-2xl border border-slate-200/70 bg-white/60 p-5 shadow-sm backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-900/40">
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
            Brands
          </h3>
          <div className="max-h-56 space-y-2 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent dark:scrollbar-thumb-slate-700">
            {brands.map((brand) => {
              const isSelected = currentFilters.brand === brand;
              return (
                <label
                  key={brand}
                  className={`group flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 transition-colors backdrop-blur-sm ${
                    isSelected
                      ? 'border-blue-500/60 bg-blue-500/10 text-blue-600 dark:border-blue-400/60 dark:bg-blue-500/10 dark:text-blue-300'
                      : 'border-slate-200/50 bg-white/50 text-slate-600 hover:border-slate-300/70 hover:bg-white/70 dark:border-slate-700/50 dark:bg-slate-900/30 dark:text-slate-400 dark:hover:border-slate-600/60 dark:hover:bg-slate-900/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleFilterToggle('brand', brand)}
                    className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900/40 dark:text-blue-400 dark:focus:ring-blue-400"
                  />
                  <span className={`text-sm ${
                    isSelected
                      ? 'font-medium'
                      : 'font-normal'
                  }`}>
                    {brand}
                  </span>
                </label>
              );
            })}
          </div>
        </section>
      )}

      {/* Gender */}
      <section className="rounded-2xl border border-slate-200/70 bg-white/60 p-5 shadow-sm backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-900/40">
        <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
          Gender
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {GENDER_OPTIONS.map((option) => {
            const isSelected = currentFilters.gender === option.value;
            return (
              <button
                key={option.value}
                onClick={() => handleFilterToggle('gender', option.value)}
                className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-xs font-medium transition-all backdrop-blur-sm ${
                  isSelected
                    ? 'border-blue-500/70 bg-blue-500/10 text-blue-600 shadow-sm dark:border-blue-400/70 dark:bg-blue-500/15 dark:text-blue-300'
                    : 'border-slate-200/70 bg-white/60 text-slate-600 hover:border-slate-300 hover:bg-white/80 dark:border-slate-700/60 dark:bg-slate-900/40 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-900/60'
                }`}
              >
                <i className={`fas ${option.icon} text-lg`} />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default ProductFilter;
