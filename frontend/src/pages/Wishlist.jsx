import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaShoppingCart, FaArrowLeft } from "react-icons/fa";
import { toast } from 'react-toastify';

const Wishlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, error } = useSelector((state) => state.wishlist);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [isRemoving, setIsRemoving] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/wishlist');
      return;
    }
    if (user) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, user, isAuthenticated, navigate]);

  const calculateDiscountPrice = (price, discountPercentage) => {
    if (discountPercentage && discountPercentage > 0) {
      return price - (price * discountPercentage / 100);
    }
    return null;
  };

  const handleRemoveFromWishlist = async (productId) => {
    setIsRemoving(productId);
    try {
      await dispatch(removeFromWishlist(productId)).unwrap();
      toast.success("Item removed from wishlist");
    } catch (err) {
      toast.error(typeof err === 'string' ? err : "Failed to remove item from wishlist");
    } finally {
      setIsRemoving(null);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await dispatch(addToCart({ 
        productId: product._id, 
        quantity: 1,
        name: product.name,
        price: product.price,
        image: product.images && product.images.length > 0 ? product.images[0] : null
      })).unwrap();
      toast.success(`${product.name} added to cart`);
    } catch (err) {
      toast.error(typeof err === 'string' ? err : "Failed to add item to cart");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error || 'Failed to load wishlist'}</span>
          <button 
            onClick={() => dispatch(fetchWishlist())}
            className="mt-2 bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Ensure items is always an array
  const wishlistItems = Array.isArray(items) ? items : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
      >
        <FaArrowLeft className="mr-2" /> Back
      </button>
      
      <h1 className="text-3xl font-bold mb-6">Your Wishlist</h1>
      
      {wishlistItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p className="text-xl text-gray-600 mb-6">Your wishlist is empty</p>
          <Link to="/products">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
              Discover Products
            </button>
          </Link>
        </div>
      ) : (
        <div>
          <p className="text-gray-600 mb-6">{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} in your wishlist</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => {
              const salePrice = calculateDiscountPrice(item.price, item.discountPercentage);
              
              return (
                <div key={item._id} className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl">
                  <div className="relative h-64 overflow-hidden">
                    <Link to={`/products/${item._id}`}>
                      <img 
                        src={item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/300'} 
                        alt={item.name} 
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      
                      {item.discountPercentage > 0 && (
                        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                          {item.discountPercentage}% OFF
                        </span>
                      )}
                    </Link>
                    <button 
                      onClick={() => handleRemoveFromWishlist(item._id)}
                      disabled={isRemoving === item._id}
                      className="absolute top-2 left-2 bg-white p-2 rounded-full shadow-md hover:bg-red-100 transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      {isRemoving === item._id ? (
                        <div className="animate-spin h-5 w-5 border-t-2 border-red-500 rounded-full"></div>
                      ) : (
                        <RiDeleteBin6Line size={20} className="text-red-500" />
                      )}
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <Link to={`/products/${item._id}`}>
                      <h3 className="font-semibold text-lg mb-1 hover:text-blue-500 transition-colors">
                        {item.name}
                      </h3>
                    </Link>
                    
                    <p className="text-sm text-gray-500 mb-2">{item.brand}</p>
                    
                    <div className="flex items-center mb-4">
                      {salePrice ? (
                        <>
                          <span className="text-blue-500 font-bold text-lg mr-2">
                            ${salePrice.toFixed(2)}
                          </span>
                          <span className="text-gray-400 line-through text-sm">
                            ${item.price.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="text-blue-500 font-bold text-lg">
                          ${item.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleAddToCart(item)}
                        disabled={item.countInStock === 0}
                        className={`flex-1 flex items-center justify-center py-2 px-4 rounded ${
                          item.countInStock === 0 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        } transition-colors`}
                      >
                        <FaShoppingCart className="mr-2" />
                        {item.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                      
                      <Link 
                        to={`/products/${item._id}`}
                        className="py-2 px-4 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
