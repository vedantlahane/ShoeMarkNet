import api from '../utils/api';

/**
 * Get the current user's cart
 * @returns {Promise<Array>} - Promise resolving to an array of cart items
 */
const getCart = async () => {
  try {
    const response = await api.get('/cart');
    
    // Handle different response structures from backend
    if (response.data && Array.isArray(response.data.items)) {
      return response.data.items;
    } else if (response.data && typeof response.data === 'object' && Array.isArray(response.data.cart?.items)) {
      return response.data.cart.items;
    } else if (response.data && typeof response.data === 'object' && Array.isArray(response.data.items)) {
      return response.data.items;
    } else if (response.data && typeof response.data === 'object' && response.data.cart) {
      return response.data.cart.items || [];
    } else if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    // Default to empty array if response structure is unexpected
    console.warn('Unexpected cart response structure:', response.data);
    return [];
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
 * @returns {Promise<Array>} - Promise resolving to the updated cart items
 */
const addToCart = async (productId, quantity, size = null, color = null) => {
  try {
    const payload = { productId, quantity };
    
    // Add optional parameters if provided
    if (size) payload.size = size;
    if (color) payload.color = color;
    
    const response = await api.post('/cart', payload);
    
    // Handle different response structures
    if (response.data && response.data.cart && Array.isArray(response.data.cart.items)) {
      return response.data.cart.items;
    } else if (response.data && Array.isArray(response.data.items)) {
      return response.data.items;
    } else if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    // Default to empty array if response structure is unexpected
    console.warn('Unexpected addToCart response structure:', response.data);
    return [];
  } catch (error) {
    console.error('Error adding to cart:', error.message || error);
    throw new Error(error.response?.data?.message || 'Failed to add item to cart. Please try again.');
  }
};

/**
 * Update the quantity of a cart item
 * @param {string} itemId - The ID of the cart item to update
 * @param {number} quantity - The new quantity
 * @returns {Promise<Array>} - Promise resolving to the updated cart items
 */
const updateCartItem = async (itemId, quantity) => {
  try {
    // Validate quantity
    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }
    
    const response = await api.put(`/cart/${itemId}`, { quantity });
    
    // Handle different response structures
    if (response.data && response.data.cart && Array.isArray(response.data.cart.items)) {
      return response.data.cart.items;
    } else if (response.data && Array.isArray(response.data.items)) {
      return response.data.items;
    } else if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    // Default to empty array if response structure is unexpected
    console.warn('Unexpected updateCartItem response structure:', response.data);
    return [];
  } catch (error) {
    console.error('Error updating cart item:', error.message || error);
    throw new Error(error.response?.data?.message || 'Failed to update cart item. Please try again.');
  }
};

/**
 * Remove an item from the cart
 * @param {string} itemId - The ID of the cart item to remove
 * @returns {Promise<Array>} - Promise resolving to the updated cart items
 */
const removeFromCart = async (itemId) => {
  try {
    const response = await api.delete(`/cart/${itemId}`);
    
    // Handle different response structures
    if (response.data && response.data.cart && Array.isArray(response.data.cart.items)) {
      return response.data.cart.items;
    } else if (response.data && Array.isArray(response.data.items)) {
      return response.data.items;
    } else if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    // Default to empty array if response structure is unexpected
    console.warn('Unexpected removeFromCart response structure:', response.data);
    return [];
  } catch (error) {
    console.error('Error removing from cart:', error.message || error);
    throw new Error(error.response?.data?.message || 'Failed to remove item from cart. Please try again.');
  }
};

/**
 * Clear the entire cart
 * @returns {Promise<Array>} - Promise resolving to an empty array
 */
const clearCart = async () => {
  try {
    await api.delete('/cart');
    // Backend returns a message, not cart data, so return empty array
    return [];
  } catch (error) {
    console.error('Error clearing cart:', error.message || error);
    throw new Error(error.response?.data?.message || 'Failed to clear cart. Please try again.');
  }
};

const cartService = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};

export default cartService;
