// src/pages/Cart.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
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
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  // Calculate cart totals with enhanced logic
  const subtotal = Array.isArray(items)
    ? items.reduce((sum, item) => {
        const price = item.product?.price || item.price || 0;
        return sum + (price * item.quantity);
      }, 0)
    : 0;

  const promoDiscount = promoApplied ? subtotal * 0.1 : 0; // 10% discount
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = (subtotal - promoDiscount) * 0.07;
  const total = subtotal - promoDiscount + shipping + tax;

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
      toast.warning('Quantity cannot be less than 1! 📦');
    } else if (maxStock && newQuantity > maxStock) {
      validatedQuantity = maxStock;
      toast.warning(`Only ${maxStock} items available in stock! 📦`);
    } else if (newQuantity > 10) {
      validatedQuantity = 10;
      toast.info('Maximum 10 items per product allowed! 🛒');
    }

    setIsUpdating(itemId);
    dispatch(updateCartItem({ itemId, quantity: parseInt(validatedQuantity) }))
      .unwrap()
      .then(() => {
        toast.success('Cart updated successfully! ✅');
      })
      .catch((err) => {
        toast.error(err.message || 'Failed to update cart');
      })
      .finally(() => {
        setIsUpdating(null);
      });
  };

  const handleRemoveItem = async (itemId) => {
    if (window.confirm('Are you sure you want to remove this item? 🗑️')) {
      setIsRemoving(itemId);
      try {
        await dispatch(removeFromCart(itemId)).unwrap();
        toast.success('Item removed from cart! 🗑️');
      } catch (err) {
        toast.error(err.message || 'Failed to remove item');
      } finally {
        setIsRemoving(null);
      }
    }
  };

  const handlePromoCode = () => {
    if (promoCode.toUpperCase() === 'SAVE10') {
      setPromoApplied(true);
      toast.success('🎉 Promo code applied! 10% discount activated!');
    } else {
      toast.error('❌ Invalid promo code');
    }
  };

  const handleCheckout = () => {
    if (user) {
      navigate('/checkout');
    } else {
      navigate(`/login?redirect=${encodeURIComponent('/checkout')}`);
    }
  };

  // Enhanced loading state
  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const cartItems = Array.isArray(items) ? items : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
  <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-5 lg:px-6 py-12">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition-colors hover:text-white"
            >
              <i className="fas fa-arrow-left text-xs"></i>
              Back
            </button>
            <div>
              <h1 className="text-3xl font-semibold text-white md:text-4xl">Shopping cart</h1>
              <p className="mt-1 max-w-xl text-sm text-slate-400 md:text-base">
                Review your items, adjust quantities, and move forward when you’re ready to check out.
              </p>
            </div>
          </div>

          {cartItems.length > 0 && (
            <div className="flex flex-wrap gap-3 text-sm text-slate-300">
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2">
                ${total.toFixed(2)} total
              </div>
            </div>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-12 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-800/80">
              <i className="fas fa-shopping-bag text-2xl text-slate-300"></i>
            </div>
            <h2 className="mt-6 text-2xl font-semibold text-white">Your cart is empty</h2>
            <p className="mt-3 text-sm text-slate-400 md:text-base">
              You haven’t added anything yet. Explore the catalog and find something you’ll love.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/products"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-slate-950 transition-colors hover:bg-slate-200"
              >
                Browse products
              </Link>
              <Link
                to="/categories"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-700 px-6 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-500 hover:text-white"
              >
                View categories
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <section className="space-y-6">
              {cartItems.map((item) => {
                const product = item.product || {};
                const price = product.price || item.price || 0;
                const image = (product.images?.length > 0 && product.images[0]) ||
                  product.image || item.image ||
                  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=150&auto=format&fit=crop';
                const name = product.name || item.name || 'Product';
                const productId = product._id || item.productId;

                return (
                  <div
                    key={item._id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-center">
                      <Link
                        to={`/products/${productId}`}
                        className="h-24 w-24 overflow-hidden rounded-2xl border border-slate-800 bg-slate-800/80"
                      >
                        <img src={image} alt={name} className="h-full w-full object-cover" />
                      </Link>

                      <div className="flex-1 space-y-3">
                        <div>
                          <Link
                            to={`/products/${productId}`}
                            className="text-lg font-semibold text-white transition-colors hover:text-slate-300"
                          >
                            {name}
                          </Link>
                          <div className="mt-2 flex flex-wrap gap-3 text-xs uppercase tracking-wide text-slate-400">
                            {item.size && <span>Size: {item.size}</span>}
                            {item.color && <span>Color: {item.color}</span>}
                            <span>${typeof price === 'number' ? price.toFixed(2) : '0.00'} each</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div className="inline-flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 px-2 py-2">
                            <button
                              onClick={() => handleQuantityChange(item._id, item.quantity - 1, product.countInStock || item.maxStock)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                              disabled={isUpdating === item._id || item.quantity <= 1}
                            >
                              {isUpdating === item._id ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                              ) : (
                                <i className="fas fa-minus"></i>
                              )}
                            </button>
                            <span className="w-12 text-center text-base font-semibold text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item._id, item.quantity + 1, product.countInStock || item.maxStock)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                              disabled={isUpdating === item._id || item.quantity >= (product.countInStock || item.maxStock || 10)}
                            >
                              {isUpdating === item._id ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                              ) : (
                                <i className="fas fa-plus"></i>
                              )}
                            </button>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right text-lg font-semibold text-white md:w-28">
                              ${typeof price === 'number' ? (price * item.quantity).toFixed(2) : '0.00'}
                              <p className="mt-1 text-xs font-normal text-slate-400">Item total</p>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item._id)}
                              disabled={isRemoving === item._id}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/40 text-red-400 transition-colors hover:border-red-400 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
                              title="Remove item"
                            >
                              {isRemoving === item._id ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                              ) : (
                                <i className="fas fa-trash"></i>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition-colors hover:text-white"
              >
                <i className="fas fa-arrow-left text-xs"></i>
                Continue shopping
              </Link>
            </section>

            <aside className="space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                <h2 className="text-lg font-semibold text-white">Promo code</h2>
                <p className="mt-1 text-sm text-slate-400">Enter SAVE10 for an extra 10% off.</p>
                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={promoApplied}
                    className="h-11 flex-1 rounded-xl border border-slate-800 bg-slate-900/80 px-4 text-sm text-white placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
                  />
                  <button
                    onClick={handlePromoCode}
                    disabled={promoApplied || !promoCode.trim()}
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
                  >
                    {promoApplied ? 'Applied' : 'Apply'}
                  </button>
                </div>
                {promoApplied && (
                  <p className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                    {`SAVE10 is active. You just saved $${promoDiscount.toFixed(2)}!`}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                <h2 className="text-lg font-semibold text-white">Order summary</h2>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                    <span className="font-medium text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  {promoApplied && (
                    <div className="flex justify-between text-emerald-300">
                      <span>Promo discount</span>
                      <span>- ${promoDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className={`font-medium ${shipping === 0 ? 'text-emerald-300' : 'text-white'}`}>
                      {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span className="font-medium text-white">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-slate-800 pt-3 text-base font-semibold text-white">
                    <div className="flex justify-between">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-slate-200"
                >
                  <i className="fas fa-lock text-xs"></i>
                  Secure checkout
                </button>

                {shipping === 0 ? (
                  <p className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                    Free shipping unlocked. Nice work!
                  </p>
                ) : (
                  <p className="mt-4 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
                    Spend ${(Math.max(100 - subtotal, 0)).toFixed(2)} more to unlock free shipping.
                  </p>
                )}
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
