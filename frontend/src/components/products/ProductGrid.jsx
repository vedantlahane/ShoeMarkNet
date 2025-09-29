import React from 'react';
import ProductCard from '../ProductCard';

const ProductGrid = ({ products, onAddToCart, onToggleWishlist, className = '' }) => {
  return (
  <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {products.map((product, index) => (
        <ProductCard 
          key={product._id || `product-${index}`} 
          product={product}
          onAddToCart={() => onAddToCart(product)}
          onToggleWishlist={() => onToggleWishlist(product)}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
