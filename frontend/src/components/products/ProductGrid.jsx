import { useMemo } from 'react';
import ProductCard from './ProductCard';
import { AnimatePresence } from 'framer-motion';

const ProductGrid = ({
  products,
  onAddToCart,
  onToggleWishlist,
  wishlistProductIds = [],
  viewMode = 'grid',
  showCompareButton,
  onAddToCompare,
  onQuickView,
  categoryContext
}) => {
  const wishlistSet = useMemo(() => {
    if (wishlistProductIds instanceof Set) {
      return wishlistProductIds;
    }
    return new Set(Array.isArray(wishlistProductIds) ? wishlistProductIds : []);
  }, [wishlistProductIds]);

  const gridClasses = useMemo(() => {
    switch (viewMode) {
      case 'list':
        return 'grid-cols-1 max-w-4xl mx-auto gap-4';
      case 'compact':
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-3';
      case 'grid':
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3';
    }
  }, [viewMode]);

  if (!Array.isArray(products)) {
    console.error('ProductGrid: products prop is not an array', products);
    return null;
  }

  return (
    <div className={`grid ${gridClasses}`}>
      <AnimatePresence mode="popLayout">
        {products.map((product, index) => (
          <div
            key={product._id || product.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <ProductCard
              product={product}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              wishlistProductIds={wishlistSet}
              index={index}
              variant={viewMode === 'compact' ? 'compact' : 'default'}
              showCompareButton={showCompareButton}
              onAddToCompare={onAddToCompare ? () => onAddToCompare(product) : undefined}
              onQuickView={onQuickView ? () => onQuickView(product) : undefined}
              categoryContext={categoryContext}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ProductGrid;
