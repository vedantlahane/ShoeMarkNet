// src/pages/Wishlist.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaShoppingCart } from "react-icons/fa";

const Wishlist = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.wishlist);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, user]);

  const handleRemoveFromWishlist = (productId) => {
    dispatch(removeFromWishlist(productId));
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
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
          <span className="block sm:inline">{error.message || 'Failed to load wishlist'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Wishlist</h1>
      
      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 mb-6">Your wishlist is empty</p>
          <Link to="/products">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Continue Shopping
            </button>
          </Link>
        </div>
      ) : (
        <div>
          <p className="text-gray-600 mb-6">{items.length} {items.length === 1 ? 'item' : 'items'} in your wishlist</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item._id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="relative">
                  <Link to={`/products/${item._id}`}>
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-64 object-cover"
                    />
                  </Link>
                  <button 
                    onClick={() => handleRemoveFromWishlist(item._id)}
                    className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-red-100 transition-colors"
                    aria-label="Remove from wishlist"
                  >
                    <RiDeleteBin6Line size={20} className="text-red-500" />
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
                    {item.salePrice && item.salePrice < item.price ? (
                      <>
                        <span className="text-blue-500 font-bold text-lg mr-2">
                          ${item.salePrice.toFixed(2)}
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
                  
                  <button 
                    onClick={() => handleAddToCart(item)}
                    disabled={item.stock === 0}
                    className={`w-full flex items-center justify-center py-2 px-4 rounded ${
                      item.stock === 0 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-500 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <FaShoppingCart className="mr-2" />
                    {item.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
