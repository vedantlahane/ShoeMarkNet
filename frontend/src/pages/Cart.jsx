import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaArrowLeft } from 'react-icons/fa';
import { fetchCart, updateCartItem, removeFromCart } from '../redux/slices/cartSlice';
import Loader from '../components/common/Loader';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, error } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

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
  }, [dispatch, user]);

  const handleQuantityChange = (itemId, quantity) => {
    dispatch(updateCartItem({ itemId, quantity: parseInt(quantity) }));
  };

  const handleRemoveItem = (itemId) => {
    dispatch(removeFromCart(itemId));
  };

  const handleCheckout = () => {
    // Redirect to checkout page if user is logged in, otherwise to login
    if (user) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=checkout');
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error.message || 'Failed to load cart'}</span>
        </div>
      </div>
    );
  }

  // Ensure items is an array
  const cartItems = Array.isArray(items) ? items : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 mb-6">Your cart is empty</p>
          <Link to="/products" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md p-6 mb-4">
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
                            src={item.image} 
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
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex justify-center">
                          <select 
                            value={item.quantity} 
                            onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                            className="border rounded px-2 py-1"
                          >
                            {[...Array(10).keys()].map(x => (
                              <option key={x + 1} value={x + 1}>
                                {x + 1}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="py-4 text-right">
                        ${(item.price * item.quantity).toFixed(2)}
                      </td>
                      <td className="py-4 text-right">
                        <button 
                          onClick={() => handleRemoveItem(item._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-between items-center mt-6">
              <Link to="/products" className="flex items-center text-blue-500 hover:text-blue-700">
                <FaArrowLeft className="mr-2" />
                Continue Shopping
              </Link>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="border-t border-b py-2">
                <div className="flex justify-between py-2">
                  <span>Subtotal</span>
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
              
              <button 
                onClick={handleCheckout}
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-6"
              >
                Proceed to Checkout
              </button>
              
              <div className="mt-4 text-sm text-gray-500">
                <p>We accept:</p>
                <div className="flex space-x-2 mt-2">
                  <div className="w-10 h-6 bg-gray-200 rounded"></div>
                  <div className="w-10 h-6 bg-gray-200 rounded"></div>
                  <div className="w-10 h-6 bg-gray-200 rounded"></div>
                  <div className="w-10 h-6 bg-gray-200 rounded"></div>
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
