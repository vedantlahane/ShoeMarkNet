import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { debounce } from 'lodash';

const GENDER_OPTIONS = [
  { value: 'men', label: 'Men', icon: 'fa-mars' },
  { value: 'women', label: 'Women', icon: 'fa-venus' },
  { value: 'unisex', label: 'Unisex', icon: 'fa-venus-mars' }
];

const DEFAULT_PRICE = { min: 0, max: 1000 };

const normalizeToArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return [value];
};

const ProductFilter = ({ currentFilters, onFilterChange }) => {
  const { categories, products } = useSelector((state) => state.product);
  const allProducts = useSelector((state) => state.product.products || []);
  
  const [priceRange, setPriceRange] = useState({
    min: currentFilters.priceRange?.min || DEFAULT_PRICE.min,
    max: currentFilters.priceRange?.max || DEFAULT_PRICE.max
  });

  // Brands list should not collapse after applying brand filter.
  // Use a stable source (store's full products list) and cache the first non-empty set.
  const computedBrands = useMemo(
    () => [...new Set((allProducts || []).map((p) => p.brand).filter(Boolean))].sort(),
    [allProducts]
  );
  const [brands, setBrands] = useState([]);
  useEffect(() => {
    if (brands.length === 0 && computedBrands.length > 0) {
      setBrands(computedBrands);
    }
  }, [brands.length, computedBrands]);

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

  const handleSingleToggle = useCallback((filterKey, value) => {
    onFilterChange({
      [filterKey]: currentFilters[filterKey] === value ? '' : value
    });
  }, [currentFilters, onFilterChange]);

  const handleMultiToggle = useCallback((filterKey, value) => {
    const selected = normalizeToArray(currentFilters[filterKey]);
    const next = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onFilterChange({ [filterKey]: next });
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
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Left column */}
      <div className="space-y-4">
        {/* Categories */}
        <section className="pb-3">
          <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">
            Categories
          </h3>
          <div className="flex flex-wrap gap-2">
          {categories?.map((category) => {
            const isSelected = currentFilters.category === (category._id || category.name);
            return (
              <button
                key={category._id || category.name}
                onClick={() => handleSingleToggle('category', category._id || category.name)}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                  isSelected
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {category.name}
              </button>
            );
          })}
          </div>
        </section>

        <div className="border-t border-slate-200 dark:border-slate-800" />

        {/* Price Range */}
        <section className="pt-1 pb-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Price
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ${priceRange.min} – ${priceRange.max}
            </span>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
              <input
                type="number"
                name="min"
                value={priceRange.min}
                onChange={handlePriceChange}
                min="0"
                placeholder="Min"
                className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-7 pr-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm [appearance:textfield] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
              <input
                type="number"
                name="max"
                value={priceRange.max}
                onChange={handlePriceChange}
                min="0"
                placeholder="Max"
                className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-7 pr-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm [appearance:textfield] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Right column */}
      <div className="space-y-4">
        {/* Brands */}
        {brands.length > 0 && (
          <section className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Brands
              </h3>
              {normalizeToArray(currentFilters.brand).length > 0 ? (
                <button
                  type="button"
                  onClick={() => onFilterChange({ brand: [] })}
                  className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Clear
                </button>
              ) : null}
            </div>

            <div className="mt-2 max-h-40 overflow-auto pr-1 custom-scrollbar">
              <div className="flex flex-wrap gap-2">
              {brands.map((brand) => {
                const isSelected = normalizeToArray(currentFilters.brand).includes(brand);
                return (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => handleMultiToggle('brand', brand)}
                    className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
                    }`}
                    title={brand}
                  >
                    <span className="max-w-[10.5rem] truncate">{brand}</span>
                  </button>
                );
              })}
              </div>
            </div>
          </section>
        )}

        <div className="border-t border-slate-200 dark:border-slate-800" />

        {/* Gender */}
        <section className="pt-1 pb-3">
          <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">
            Gender
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {GENDER_OPTIONS.map((option) => {
              const isSelected = currentFilters.gender === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSingleToggle('gender', option.value)}
                  className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-2 text-xs font-medium transition-colors ${
                    isSelected
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <i className={`fas ${option.icon} text-sm`} />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductFilter;
