// src/components/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
// import { addToCart } from '../redux/slices/cartSlice';
import { addToWishlist } from '../redux/slices/wishlistSlice';
// import { FaShoppingCart } from 'react-icons/fa';
import { CiHeart } from 'react-icons/ci';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.wishlist);
  const isInWishlist = items.some(item => item._id === product._id);

  // Calculate sale price based on discountPercentage if available
  const salePrice = product.discountPercentage > 0 
    ? product.price - (product.price * product.discountPercentage / 100)
    : null;
  
  // Safely format price with fallback for non-numeric values
  const formatPrice = (price) => {
    // Check if price is a number
    const numPrice = Number(price);
    return !isNaN(numPrice) ? numPrice.toFixed(2) : '0.00';
  };

  // const handleAddToCart = () => {
  //   dispatch(addToCart({ productId: product._id, quantity: 1 }));
  // };

  const handleAddToWishlist = () => {
    dispatch(addToWishlist(product._id));
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* Product Image with Link to Detail */}
      <Link to={`/products/${product._id}`}>
        <div className="relative h-64 overflow-hidden">
          <img
            src={product.images && product.images.length > 0 
              ? product.images[0] 
              : 'https://via.placeholder.com/300'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          
          {/* Sale Badge */}
          {salePrice && salePrice < product.price && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              Sale
            </div>
          )}
          
          {/* Low Stock Badge */}
          {product.countInStock <= 5 && product.countInStock > 0 && (
            <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">
              Only {product.countInStock} left
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link to={`/products/${product._id}`}>
          <h3 className="font-semibold text-lg mb-1 hover:text-blue-500 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
        
        {/* Price Display */}
        <div className="flex items-center mb-4">
          {salePrice ? (
            <>
              <span className="text-blue-500 font-bold text-lg mr-2">
                ${formatPrice(salePrice)}
              </span>
              <span className="text-gray-400 line-through text-sm">
                ${formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="text-blue-500 font-bold text-lg">
              ${formatPrice(product.price)}
            </span>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-2">
          {/* <button 
            onClick={handleAddToCart} 
            disabled={product.countInStock === 0}
            className={`flex-1 flex items-center justify-center py-2 px-4 rounded ${
              product.countInStock === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-700 text-white'
            }`}
          >
            <FaShoppingCart className="mr-2" />
            {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
           */}
          <button 
            onClick={handleAddToWishlist}
            disabled={isInWishlist}
            className={`p-2 rounded ${
              isInWishlist 
                ? 'bg-pink-100 text-pink-500' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
            aria-label={isInWishlist ? 'Already in wishlist' : 'Add to wishlist'}
          >
            <CiHeart size={20} className={isInWishlist ? 'fill-pink-500' : ''} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
