import React, { useMemo } from 'react';
import ProductCard from './ProductCard';
import { AnimatePresence } from 'framer-motion';

const ProductGrid = ({ products, onAddToCart, onToggleWishlist, wishlistProductIds = [] }) => {
  const wishlistSet = useMemo(() => {
    if (wishlistProductIds instanceof Set) {
      return wishlistProductIds;
    }
    return new Set(Array.isArray(wishlistProductIds) ? wishlistProductIds : []);
  }, [wishlistProductIds]);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <AnimatePresence>
        {products.map((product, index) => (
          <ProductCard
            key={product._id || product.id}
            product={product}
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
            wishlistProductIds={wishlistSet}
            index={index}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ProductGrid;
