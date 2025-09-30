import React, { useMemo } from 'react';
import ProductCard from '../ProductCard';
import { AnimatePresence } from 'framer-motion';

const ProductGrid = ({ products, onAddToCart, onToggleWishlist, wishlistProductIds = [], className = '' }) => {
  const wishlistSet = useMemo(() => {
    if (wishlistProductIds instanceof Set) {
      return wishlistProductIds;
    }
    return new Set(Array.isArray(wishlistProductIds) ? wishlistProductIds : []);
  }, [wishlistProductIds]);

  return (
    <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 ${className}`}>
      <AnimatePresence>
        {products.map((product, index) => {
          const productId = product?._id || product?.id || product?.productId;

          return (
            <ProductCard 
              key={productId || `product-${index}`} 
              product={product}
              onAddToCart={() => onAddToCart?.(product)}
              onToggleWishlist={() => onToggleWishlist?.(product)}
              isWishlisted={productId ? wishlistSet.has(productId) : false}
              index={index}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ProductGrid;
