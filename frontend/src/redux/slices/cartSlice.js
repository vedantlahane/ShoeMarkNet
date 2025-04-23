import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cartService from '../../services/cartService';
import { toast } from 'react-toastify'; // Assuming you use react-toastify

// Helper function to ensure items is always an array
const ensureArray = (items) => {
  if (Array.isArray(items)) {
    return items;
  }
  if (items && typeof items === 'object' && Array.isArray(items.items)) {
    return items.items;
  }
  return [];
};

// Get cart items from localStorage
const cartItemsFromStorage = localStorage.getItem('cartItems')
  ? JSON.parse(localStorage.getItem('cartItems'))
  : [];

// Fetch cart items
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getCart();
      // Store cart items in localStorage for persistence
      const items = ensureArray(response);
      localStorage.setItem('cartItems', JSON.stringify(items));
      return items;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch cart' });
    }
  }
);

// Add item to cart
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (cartItem, { rejectWithValue, getState }) => {
    try {
      // Extract required fields
      const { productId, quantity, size, color } = cartItem;
      
      // Perform optimistic update
      const currentItems = [...getState().cart.items];
      
      const response = await cartService.addToCart(productId, quantity, size, color);
      const items = ensureArray(response);
      localStorage.setItem('cartItems', JSON.stringify(items));
      return items;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to add to cart' });
    }
  }
);

// Update cart item quantity
export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }, { rejectWithValue, getState }) => {
    try {
      // Perform optimistic update
      const currentItems = [...getState().cart.items];
      const updatedItems = currentItems.map(item => 
        item._id === itemId ? { ...item, quantity } : item
      );
      
      // Store optimistic update
      localStorage.setItem('cartItems', JSON.stringify(updatedItems));
      
      const response = await cartService.updateCartItem(itemId, quantity);
      const items = ensureArray(response);
      localStorage.setItem('cartItems', JSON.stringify(items));
      return items;
    } catch (error) {
      // Revert optimistic update on error
      const currentItems = [...getState().cart.items];
      localStorage.setItem('cartItems', JSON.stringify(currentItems));
      
      return rejectWithValue(error.response?.data || { message: 'Failed to update cart item' });
    }
  }
);

// Remove item from cart
export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId, { rejectWithValue, getState }) => {
    try {
      // Perform optimistic update
      const currentItems = [...getState().cart.items];
      const updatedItems = currentItems.filter(item => item._id !== itemId);
      
      // Store optimistic update
      localStorage.setItem('cartItems', JSON.stringify(updatedItems));
      
      const response = await cartService.removeFromCart(itemId);
      const items = ensureArray(response);
      localStorage.setItem('cartItems', JSON.stringify(items));
      return items;
    } catch (error) {
      // Revert optimistic update on error
      const currentItems = [...getState().cart.items];
      localStorage.setItem('cartItems', JSON.stringify(currentItems));
      
      return rejectWithValue(error.response?.data || { message: 'Failed to remove item from cart' });
    }
  }
);

// Clear cart
export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.clearCart();
      localStorage.removeItem('cartItems');
      return [];
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to clear cart' });
    }
  }
);

const initialState = {
  items: cartItemsFromStorage,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartError: (state) => {
      state.error = null;
    },
    // For guest checkout - manage cart locally
    addItemLocally: (state, action) => {
      const { productId, name, price, image, quantity, size, color } = action.payload;
      const existingItem = state.items.find(
        item => item.productId === productId && item.size === size && item.color === color
      );
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          _id: Date.now().toString(), // Temporary ID
          productId,
          name,
          price,
          image,
          quantity,
          size,
          color
        });
      }
      
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    removeItemLocally: (state, action) => {
      state.items = state.items.filter(item => item._id !== action.payload);
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    updateItemLocally: (state, action) => {
      const { itemId, quantity } = action.payload;
      const item = state.items.find(item => item._id === itemId);
      
      if (item) {
        item.quantity = quantity;
      }
      
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    clearCartLocally: (state) => {
      state.items = [];
      localStorage.removeItem('cartItems');
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Cart Item
      .addCase(updateCartItem.pending, (state) => {
        // Don't set loading=true for better UX with optimistic updates
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Remove from Cart
      .addCase(removeFromCart.pending, (state) => {
        // Don't set loading=true for better UX with optimistic updates
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Clear Cart
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;
export const selectCartTotal = (state) => {
  const items = state.cart.items;
  return Array.isArray(items) 
    ? items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    : 0;
};

export const { 
  clearCartError, 
  addItemLocally, 
  removeItemLocally, 
  updateItemLocally, 
  clearCartLocally 
} = cartSlice.actions;

export default cartSlice.reducer;
