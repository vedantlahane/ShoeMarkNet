import api from '../utils/api';

/**
 * Get the current user's cart
 * @returns {Promise<Object>} - Promise resolving to cart object with items array
 */
const getCart = async () => {
  try {
    const response = await api.get('/cart');
    
    // Backend returns consistent structure: { user, items, totalPrice } or full cart object
    if (response.data) {
      return response.data;
    }
    
    // Default to empty cart if response structure is unexpected
    console.warn('Unexpected cart response structure:', response.data);
    return { user: null, items: [], totalPrice: 0 };
  } catch (error) {
    console.error('Error fetching cart:', error.message || error);
    throw new Error(error.response?.data?.message || 'Failed to fetch cart data. Please try again.');
  }
};

/**
 * Add an item to the cart
 * @param {string} productId - The ID of the product to add
 * @param {number} quantity - The quantity to add
 * @param {string} size - Optional size parameter
 * @param {string} color - Optional color parameter
 * @returns {Promise<Object>} - Promise resolving to the updated cart object
 */
const addToCart = async (productId, quantity, size = null, color = null) => {
  try {
    const payload = { productId, quantity };
    
    // Add variant object if size or color provided
    if (size || color) {
      payload.variant = {};
      if (size) payload.variant.size = size;
      if (color) payload.variant.color = color;
    }
    
    const response = await api.post('/cart', payload);
    
    // Backend returns { message, cart }
    if (response.data && response.data.cart) {
      return response.data.cart;
    }
    
    // Fallback
    console.warn('Unexpected addToCart response structure:', response.data);
    return { items: [], totalPrice: 0 };
  } catch (error) {
    console.error('Error adding to cart:', error.message || error);
    throw new Error(error.response?.data?.message || 'Failed to add item to cart. Please try again.');
  }
};

/**
 * Update the quantity of a cart item
 * @param {string} itemId - The ID of the cart item to update
 * @param {number} quantity - The new quantity
 * @returns {Promise<Object>} - Promise resolving to the updated cart object
 */
const updateCartItem = async (itemId, quantity) => {
  try {
    // Validate quantity
    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }
    
    const response = await api.put(`/cart/${itemId}`, { quantity });
    
    // Backend returns { message, cart }
    if (response.data && response.data.cart) {
      return response.data.cart;
    }
    
    // Fallback
    console.warn('Unexpected updateCartItem response structure:', response.data);
    return { items: [], totalPrice: 0 };
  } catch (error) {
    console.error('Error updating cart item:', error.message || error);
    throw new Error(error.response?.data?.message || 'Failed to update cart item. Please try again.');
  }
};

/**
 * Remove an item from the cart
 * @param {string} itemId - The ID of the cart item to remove
 * @returns {Promise<Object>} - Promise resolving to the updated cart object
 */
const removeFromCart = async (itemId) => {
  try {
    const response = await api.delete(`/cart/${itemId}`);
    
    // Backend returns { message, cart }
    if (response.data && response.data.cart) {
      return response.data.cart;
    }
    
    // Fallback
    console.warn('Unexpected removeFromCart response structure:', response.data);
    return { items: [], totalPrice: 0 };
  } catch (error) {
    console.error('Error removing from cart:', error.message || error);
    throw new Error(error.response?.data?.message || 'Failed to remove item from cart. Please try again.');
  }
};

/**
 * Clear the entire cart
 * @returns {Promise<Object>} - Promise resolving to success message
 */
const clearCart = async () => {
  try {
    const response = await api.delete('/cart');
    // Backend returns { message: 'Cart cleared successfully' }
    return response.data;
  } catch (error) {
    console.error('Error clearing cart:', error.message || error);
    throw new Error(error.response?.data?.message || 'Failed to clear cart. Please try again.');
  }
};

/**
 * Get cart item count
 * @returns {Promise<number>} - Promise resolving to total number of items in cart
 */
const getCartItemCount = async () => {
  try {
    const cart = await getCart();
    return cart.items ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0;
  } catch (error) {
    console.error('Error getting cart item count:', error);
    return 0;
  }
};

/**
 * Check if product is in cart
 * @param {string} productId - The ID of the product to check
 * @param {string} size - Optional size to match
 * @param {string} color - Optional color to match
 * @returns {Promise<boolean>} - Promise resolving to true if product is in cart
 */
const isProductInCart = async (productId, size = null, color = null) => {
  try {
    const cart = await getCart();
    if (!cart.items) return false;
    
    return cart.items.some(item => {
      if (item.product._id !== productId && item.product !== productId) return false;
      if (size && item.variant?.size !== size) return false;
      if (color && item.variant?.color !== color) return false;
      return true;
    });
  } catch (error) {
    console.error('Error checking if product is in cart:', error);
    return false;
  }
};

const cartService = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartItemCount,
  isProductInCart
};

export default cartService;
