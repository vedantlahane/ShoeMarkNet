/**
 * Redux slice for managing shopping cart state in the ShoeMarkNet application.
 * Handles both server-side cart operations (for authenticated users) and local cart management (for guest users).
 * Includes optimistic updates, error handling, and persistence to localStorage.
 *
 * @module cartSlice
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cartService from '../../services/cartService';
import { toast } from 'react-toastify';

// Helper to safely get cart items from response
const extractCartItems = (response) => {
  if (Array.isArray(response)) return response;
  if (response?.items && Array.isArray(response.items)) return response.items;
  if (response?.cart?.items && Array.isArray(response.cart.items)) return response.cart.items;
  return [];
};

// Helper to safely get total price
const extractTotalPrice = (response) => {
  if (typeof response?.totalPrice === 'number') return response.totalPrice;
  if (typeof response?.cart?.totalPrice === 'number') return response.cart.totalPrice;
  return 0;
};

// Get cart items from localStorage with error handling
const getCartFromStorage = () => {
  try {
    const cartItems = localStorage.getItem('cartItems');
    return cartItems ? JSON.parse(cartItems) : [];
  } catch (error) {
    console.error('Error parsing cart from localStorage:', error);
    localStorage.removeItem('cartItems');
    return [];
  }
};

// Save cart to localStorage with error handling
const saveCartToStorage = (items) => {
  try {
    localStorage.setItem('cartItems', JSON.stringify(items));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

/**
 * Async thunk to fetch cart items from the server.
 * Updates localStorage with the fetched items.
 * @returns {Promise<{items: Array, totalPrice: number}>} Cart data
 */
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getCart();
      const items = extractCartItems(response);
      const totalPrice = extractTotalPrice(response);
      
      saveCartToStorage(items);
      return { items, totalPrice };
    } catch (error) {
      const message = error?.userMessage || error.response?.data?.message || 'Failed to fetch cart';
      return rejectWithValue({ message });
    }
  }
);

/**
 * Async thunk to add an item to the cart.
 * Performs optimistic update and handles product variants (size/color).
 * @param {Object} cartItem - The item to add
 * @param {string} cartItem.productId - Product ID
 * @param {number} cartItem.quantity - Quantity to add
 * @param {string} [cartItem.size] - Product size variant
 * @param {string} [cartItem.color] - Product color variant
 * @returns {Promise<{items: Array, totalPrice: number}>} Updated cart data
 */
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (cartItem, { rejectWithValue, getState }) => {
    try {
      const { productId, quantity, size, color } = cartItem;
      
      // Optimistic update
      const currentItems = [...getState().cart.items];
      const existingItemIndex = currentItems.findIndex(item => 
        (item.product._id || item.product) === productId &&
        item.variant?.size === size &&
        item.variant?.color === color
      );

      let updatedItems;
      if (existingItemIndex >= 0) {
        updatedItems = currentItems.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // For optimistic update, we need basic item structure
        const newItem = {
          _id: `temp-${Date.now()}`,
          product: { _id: productId, ...cartItem.product },
          quantity,
          variant: size || color ? { size, color } : null,
        };
        updatedItems = [...currentItems, newItem];
      }

      saveCartToStorage(updatedItems);

      const response = await cartService.addToCart(productId, quantity, size, color);
      const items = extractCartItems(response);
      const totalPrice = extractTotalPrice(response);
      
      saveCartToStorage(items);
      toast.success('Item added to cart!');
      
      return { items, totalPrice };
    } catch (error) {
      // Revert optimistic update
      const currentItems = getState().cart.items;
      saveCartToStorage(currentItems);
      
      const message = error?.userMessage || error.response?.data?.message || 'Failed to add item to cart';
      toast.error(message);
      return rejectWithValue({ message });
    }
  }
);

/**
 * Async thunk to update the quantity of a cart item.
 * @param {Object} params - Update parameters
 * @param {string} params.itemId - Cart item ID
 * @param {number} params.quantity - New quantity
 * @returns {Promise<{items: Array, totalPrice: number}>} Updated cart data
 */
export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }, { rejectWithValue, getState }) => {
    try {
      // Optimistic update
      const currentItems = [...getState().cart.items];
      const updatedItems = currentItems.map(item =>
        item._id === itemId ? { ...item, quantity } : item
      );
      saveCartToStorage(updatedItems);

      const response = await cartService.updateCartItem(itemId, quantity);
      const items = extractCartItems(response);
      const totalPrice = extractTotalPrice(response);
      
      saveCartToStorage(items);
      return { items, totalPrice };
    } catch (error) {
      // Revert optimistic update
      const currentItems = getState().cart.items;
      saveCartToStorage(currentItems);
      
      const message = error?.userMessage || error.response?.data?.message || 'Failed to update cart item';
      toast.error(message);
      return rejectWithValue({ message });
    }
  }
);

/**
 * Async thunk to remove an item from the cart.
 * @param {string} itemId - Cart item ID to remove
 * @returns {Promise<{items: Array, totalPrice: number}>} Updated cart data
 */
export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId, { rejectWithValue, getState }) => {
    try {
      // Optimistic update
      const currentItems = [...getState().cart.items];
      const updatedItems = currentItems.filter(item => item._id !== itemId);
      saveCartToStorage(updatedItems);

      const response = await cartService.removeFromCart(itemId);
      const items = extractCartItems(response);
      const totalPrice = extractTotalPrice(response);
      
      saveCartToStorage(items);
      toast.success('Item removed from cart');
      
      return { items, totalPrice };
    } catch (error) {
      // Revert optimistic update
      const currentItems = getState().cart.items;
      saveCartToStorage(currentItems);
      
      const message = error?.userMessage || error.response?.data?.message || 'Failed to remove item from cart';
      toast.error(message);
      return rejectWithValue({ message });
    }
  }
);

/**
 * Async thunk to clear the entire cart.
 * @returns {Promise<{items: Array, totalPrice: number}>} Empty cart data
 */
export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      await cartService.clearCart();
      localStorage.removeItem('cartItems');
      toast.success('Cart cleared');
      return { items: [], totalPrice: 0 };
    } catch (error) {
      const message = error?.userMessage || error.response?.data?.message || 'Failed to clear cart';
      toast.error(message);
      return rejectWithValue({ message });
    }
  }
);

// Initial state for the cart slice
const initialState = {
  items: getCartFromStorage(),
  totalPrice: 0,
  loading: false,
  error: null,
  itemCount: 0,
};

// Calculate initial values
initialState.itemCount = initialState.items.reduce((total, item) => total + item.quantity, 0);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartError: (state) => {
      state.error = null;
    },
    
    // Local cart management for guest users
    addItemLocally: (state, action) => {
      const { productId, name, price, image, quantity = 1, size, color } = action.payload;
      
      const existingItemIndex = state.items.findIndex(
        item => item.productId === productId && 
                 item.size === size && 
                 item.color === color
      );
      
      if (existingItemIndex >= 0) {
        state.items[existingItemIndex].quantity += quantity;
      } else {
        state.items.push({
          _id: `local-${Date.now()}-${Math.random()}`,
          productId,
          name,
          price,
          image,
          quantity,
          size,
          color,
          isLocal: true
        });
      }
      
      state.itemCount = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalPrice = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      saveCartToStorage(state.items);
      toast.success('Item added to cart!');
    },
    
    removeItemLocally: (state, action) => {
      state.items = state.items.filter(item => item._id !== action.payload);
      state.itemCount = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalPrice = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      saveCartToStorage(state.items);
      toast.success('Item removed from cart');
    },
    
    updateItemLocally: (state, action) => {
      const { itemId, quantity } = action.payload;
      const item = state.items.find(item => item._id === itemId);
      if (item && quantity > 0) {
        item.quantity = quantity;
        state.itemCount = state.items.reduce((total, item) => total + item.quantity, 0);
        state.totalPrice = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        saveCartToStorage(state.items);
      }
    },
    
    clearCartLocally: (state) => {
      state.items = [];
      state.totalPrice = 0;
      state.itemCount = 0;
      localStorage.removeItem('cartItems');
      toast.success('Cart cleared');
    },
    
    syncCartFromStorage: (state) => {
      state.items = getCartFromStorage();
      state.itemCount = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalPrice = state.items.reduce((total, item) => {
        const price = item.product?.price || item.price || 0;
        return total + (price * item.quantity);
      }, 0);
    },
  },
  
  // Handle async thunk states
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.totalPrice = action.payload.totalPrice;
        state.itemCount = action.payload.items.reduce((total, item) => total + item.quantity, 0);
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.totalPrice = action.payload.totalPrice;
        state.itemCount = action.payload.items.reduce((total, item) => total + item.quantity, 0);
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(updateCartItem.pending, (state) => {
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.totalPrice = action.payload.totalPrice;
        state.itemCount = action.payload.items.reduce((total, item) => total + item.quantity, 0);
        state.error = null;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      .addCase(removeFromCart.pending, (state) => {
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.totalPrice = action.payload.totalPrice;
        state.itemCount = action.payload.items.reduce((total, item) => total + item.quantity, 0);
        state.error = null;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [];
        state.totalPrice = 0;
        state.itemCount = 0;
        state.error = null;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Enhanced selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;
export const selectCartTotal = (state) => state.cart.totalPrice;
export const selectCartItemCount = (state) => state.cart.itemCount;
export const selectCartIsEmpty = (state) => state.cart.items.length === 0;

export const {
  clearCartError,
  addItemLocally,
  removeItemLocally,
  updateItemLocally,
  clearCartLocally,
  syncCartFromStorage
} = cartSlice.actions;

export default cartSlice.reducer;
