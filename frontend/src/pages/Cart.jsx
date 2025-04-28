import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaArrowLeft, FaMinus, FaPlus, FaCreditCard, FaPaypal } from 'react-icons/fa';
import { fetchCart, updateCartItem, removeFromCart, clearCartError } from '../redux/slices/cartSlice';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, error } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const [isRemoving, setIsRemoving] = useState(null);
  const [isUpdating, setIsUpdating] = useState(null);

  // Calculate cart totals
  const subtotal = Array.isArray(items)
    ? items.reduce((sum, item) => {
        const price = item.product?.price || item.price || 0;
        return sum + (price * item.quantity);
      }, 0)
    : 0;
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.07;
  const total = subtotal + shipping + tax;

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
    return () => {
      dispatch(clearCartError());
    };
  }, [dispatch, user]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Failed to load cart');
      dispatch(clearCartError());
    }
  }, [error, dispatch]);

  const handleQuantityChange = (itemId, newQuantity, maxStock) => {
    let validatedQuantity = newQuantity;
    if (newQuantity < 1) {
      validatedQuantity = 1;
      toast.warning('Quantity cannot be less than 1');
    } else if (maxStock && newQuantity > maxStock) {
      validatedQuantity = maxStock;
      toast.warning(`Only ${maxStock} items available in stock`);
    } else if (newQuantity > 10) {
      validatedQuantity = 10;
      toast.info('Maximum 10 items per product allowed');
    }

    setIsUpdating(itemId);
    dispatch(updateCartItem({ itemId, quantity: parseInt(validatedQuantity) }))
      .unwrap()
      .then(() => {
        toast.success('Cart updated successfully');
      })
      .catch((err) => {
        toast.error(err.message || 'Failed to update cart');
      })
      .finally(() => {
        setIsUpdating(null);
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
    if (user) {
      navigate('/checkout');
    } else {
      navigate(`/login?redirect=${encodeURIComponent('/checkout')}`);
    }
  };

  if (loading && items.length === 0) {
    return <Loader />;
  }

  const cartItems = Array.isArray(items) ? items : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors duration-300"
      >
        <FaArrowLeft className="mr-2" /> Back
      </button>

      <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-xl text-gray-600 mb-6">Your cart is empty</p>
          <Link to="/products" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300 shadow">
            Discover Products
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md p-6 mb-4">
              <div className="overflow-x-auto">
                
                <table className="w-full min-w-[600px]">
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
                    {cartItems.map((item) => {
                      const product = item.product || {};
                      const price = product.price || item.price || 0;
                      const image =
                        (product.images && product.images.length > 0 && product.images[0]) ||
                        product.image ||
                        item.image ||
                        'https://via.placeholder.com/150';
                      const name = product.name || item.name || 'Product';
                      const productId = product._id || item.productId;

                      return (
                        <tr key={item._id} className="border-b hover:bg-gray-50 transition-colors duration-200">
                          <td className="py-4">
                            <div className="flex items-center">
                              <img
                                src={image}
                                alt={name}
                                className="w-16 h-16 object-cover rounded mr-4 shadow-sm"
                              />
                              <div>
                                <Link to={`/products/${productId}`} className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300">
                                  {name}
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
                                onClick={() => handleQuantityChange(item._id, item.quantity - 1, product.countInStock || item.maxStock)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-l px-2 py-1 transition-colors duration-300"
                                aria-label="Decrease quantity"
                                disabled={isUpdating === item._id || item.quantity <= 1}
                              >
                                {isUpdating === item._id ? (
                                  <div className="w-3 h-3 border-2 border-t-gray-700 rounded-full animate-spin"></div>
                                ) : (
                                  <FaMinus size={12} />
                                )}
                              </button>
                              <input
                                type="number"
                                min="1"
                                max={product.countInStock || item.maxStock || 10}
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value) || 1, product.countInStock || item.maxStock)}
                                className="border-t border-b text-center w-12 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="Item quantity"
                                disabled={isUpdating === item._id}
                              />
                              <button
                                onClick={() => handleQuantityChange(item._id, item.quantity + 1, product.countInStock || item.maxStock)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-r px-2 py-1 transition-colors duration-300"
                                aria-label="Increase quantity"
                                disabled={isUpdating === item._id || item.quantity >= (product.countInStock || item.maxStock || 10)}
                              >
                                {isUpdating === item._id ? (
                                  <div className="w-3 h-3 border-2 border-t-gray-700 rounded-full animate-spin"></div>
                                ) : (
                                  <FaPlus size={12} />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="py-4 text-right">
                            ${typeof price === 'number' ? price.toFixed(2) : '0.00'}
                          </td>
                          <td className="py-4 text-right font-medium">
                            ${typeof price === 'number' ? (price * item.quantity).toFixed(2) : '0.00'}
                          </td>
                          <td className="py-4 text-right">
                            <button
                              onClick={() => handleRemoveItem(item._id)}
                              disabled={isRemoving === item._id}
                              className="text-red-500 hover:text-red-700 transition-colors duration-300"
                              aria-label="Remove item from cart"
                            >
                              {isRemoving === item._id ? (
                                <div className="w-4 h-4 border-2 border-t-red-500 rounded-full animate-spin"></div>
                              ) : (
                                <FaTrash size={16} />
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6">
              <Link to="/products" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-300">
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-6 transition-colors duration-300 shadow hover:shadow-lg"
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
