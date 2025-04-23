import api from '../utils/api';

/**
 * Get the current user's cart
 * @returns {Promise<Array>} - Promise resolving to an array of cart items
 */
const getCart = async () => {
  try {
    const response = await api.get('/cart');
    
    // Handle different response structures
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && typeof response.data === 'object' && Array.isArray(response.data.items)) {
      return response.data.items;
    }
    
    // Default to empty array if response structure is unexpected
    return [];
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

/**
 * Add an item to the cart
 * @param {string} productId - The ID of the product to add
 * @param {number} quantity - The quantity to add
 * @returns {Promise<Array>} - Promise resolving to the updated cart items
 */
const addToCart = async (productId, quantity) => {
  try {
    const response = await api.post('/cart', { productId, quantity });
    
    // Handle different response structures
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && typeof response.data === 'object' && Array.isArray(response.data.items)) {
      return response.data.items;
    }
    
    // Default to empty array if response structure is unexpected
    return [];
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
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
    const response = await api.put(`/cart/${itemId}`, { quantity });
    
    // Handle different response structures
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && typeof response.data === 'object' && Array.isArray(response.data.items)) {
      return response.data.items;
    }
    
    // Default to empty array if response structure is unexpected
    return [];
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
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
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && typeof response.data === 'object' && Array.isArray(response.data.items)) {
      return response.data.items;
    }
    
    // Default to empty array if response structure is unexpected
    return [];
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

const cartService = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
};

export default cartService;
