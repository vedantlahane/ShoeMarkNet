import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaArrowLeft, FaMinus, FaPlus, FaCreditCard, FaPaypal } from 'react-icons/fa';
import { fetchCart, updateCartItem, removeFromCart, clearCartError } from '../redux/slices/cartSlice';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify'; // Assuming you use react-toastify

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, error } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const [isRemoving, setIsRemoving] = useState(null);

  // Calculate cart totals
  const subtotal = Array.isArray(items) 
    ? items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    : 0;
  const shipping = subtotal > 100 ? 0 : 10; // Free shipping for orders over $100
  const tax = subtotal * 0.07; // 7% tax
  const total = subtotal + shipping + tax;

  useEffect(() => {
    // Fetch cart data when component mounts
    if (user) {
      dispatch(fetchCart());
    }
    
    // Clear any existing errors
    return () => {
      dispatch(clearCartError());
    };
  }, [dispatch, user]);

  // Handle error with toast notification
  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Failed to load cart');
      dispatch(clearCartError());
    }
  }, [error, dispatch]);

  const handleQuantityChange = (itemId, newQuantity, maxStock) => {
    // Validate quantity
    if (newQuantity < 1) {
      newQuantity = 1;
    } else if (maxStock && newQuantity > maxStock) {
      toast.warning(`Only ${maxStock} items available in stock`);
      newQuantity = maxStock;
    } else if (newQuantity > 10) {
      toast.info('Maximum 10 items per product allowed');
      newQuantity = 10;
    }
    
    dispatch(updateCartItem({ itemId, quantity: parseInt(newQuantity) }))
      .unwrap()
      .then(() => {
        toast.success('Cart updated successfully');
      })
      .catch((err) => {
        toast.error(err.message || 'Failed to update cart');
      });
  };

  const handleRemoveItem = async (itemId) => {
    if (window.confirm('Are you sure you want to remove this item?')) {
      setIsRemoving(itemId);
      try {
        await dispatch(removeFromCart(itemId)).unwrap();
        toast.success('Item removed from cart');
      } catch (err) {
        toast.error(err.message || 'Failed to remove item');
      } finally {
        setIsRemoving(null);
      }
    }
  };

  const handleCheckout = () => {
    // Redirect to checkout page if user is logged in, otherwise to login
    if (user) {
      navigate('/checkout');
    } else {
      navigate(`/login?redirect=${encodeURIComponent('/checkout')}`);
    }
  };

  if (loading && items.length === 0) {
    return <Loader />;
  }

  // Ensure items is an array
  const cartItems = Array.isArray(items) ? items : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
      >
        <FaArrowLeft className="mr-2" /> Back
      </button>
      
      <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-xl text-gray-600 mb-6">Your cart is empty</p>
          <Link to="/products" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
            Discover Products
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md p-6 mb-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Product</th>
                      <th className="text-center py-2">Quantity</th>
                      <th className="text-right py-2">Price</th>
                      <th className="text-right py-2">Total</th>
                      <th className="text-right py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item._id} className="border-b">
                        <td className="py-4">
                          <div className="flex items-center">
                            <img 
                              src={item.images && item.images.length > 0 
                                ? item.images[0] 
                                : item.image || 'https://via.placeholder.com/150'} 
                              alt={item.name} 
                              className="w-16 h-16 object-cover rounded mr-4"
                            />
                            <div>
                              <Link to={`/products/${item.productId}`} className="text-blue-600 hover:text-blue-800 font-medium">
                                {item.name}
                              </Link>
                              {item.size && (
                                <p className="text-sm text-gray-500">Size: {item.size}</p>
                              )}
                              {item.color && (
                                <p className="text-sm text-gray-500">Color: {item.color}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center justify-center">
                            <button 
                              onClick={() => handleQuantityChange(item._id, item.quantity - 1, item.maxStock)}
                              className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-l px-2 py-1"
                              aria-label="Decrease quantity"
                            >
                              <FaMinus size={12} />
                            </button>
                            <input 
                              type="number" 
                              min="1" 
                              max={item.maxStock || 10} 
                              value={item.quantity} 
                              onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value), item.maxStock)}
                              className="border-t border-b text-center w-12 py-1"
                            />
                            <button 
                              onClick={() => handleQuantityChange(item._id, item.quantity + 1, item.maxStock)}
                              className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-r px-2 py-1"
                              aria-label="Increase quantity"
                            >
                              <FaPlus size={12} />
                            </button>
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          ${typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'}
                        </td>
                        <td className="py-4 text-right">
                          ${typeof item.price === 'number' ? (item.price * item.quantity).toFixed(2) : '0.00'}
                        </td>
                        <td className="py-4 text-right">
                          <button 
                            onClick={() => handleRemoveItem(item._id)}
                            disabled={isRemoving === item._id}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            aria-label="Remove item"
                          >
                            {isRemoving === item._id ? (
                              <div className="w-4 h-4 border-2 border-t-red-500 rounded-full animate-spin"></div>
                            ) : (
                              <FaTrash />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-6">
              <Link to="/products" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                <FaArrowLeft className="mr-2" />
                Continue Shopping
              </Link>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="border-t border-b py-2">
                <div className="flex justify-between py-2">
                  <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Tax (7%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex justify-between font-bold text-lg mt-4">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              
              {shipping === 0 && (
                <div className="bg-green-100 text-green-800 text-sm p-2 rounded mt-4">
                  You qualify for free shipping!
                </div>
              )}
              
              {shipping > 0 && (
                <div className="text-sm text-gray-600 mt-2">
                  Add ${(100 - subtotal).toFixed(2)} more to qualify for free shipping
                </div>
              )}
              
              <button 
                onClick={handleCheckout}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-6 transition-colors"
              >
                Proceed to Checkout
              </button>
              
              <div className="mt-4 text-sm text-gray-600">
                <p>We accept:</p>
                <div className="flex space-x-2 mt-2">
                  <div className="flex items-center justify-center w-10 h-6 bg-gray-100 rounded">
                    <FaCreditCard className="text-gray-600" />
                  </div>
                  <div className="flex items-center justify-center w-10 h-6 bg-gray-100 rounded">
                    <FaPaypal className="text-gray-600" />
                  </div>
                  <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-600">VISA</div>
                  <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-600">MC</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
