import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cartService from '../../services/cartService';
import { toast } from 'react-toastify';

// Helper to ensure items is always an array
const ensureArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray(data.items)) return data.items;
  if (data && typeof data === 'object' && data.cart && Array.isArray(data.cart.items)) return data.cart.items;
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
      const { productId, quantity, size, color } = cartItem;
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
      const currentItems = [...getState().cart.items];
      const updatedItems = currentItems.map(item =>
        item._id === itemId ? { ...item, quantity } : item
      );
      localStorage.setItem('cartItems', JSON.stringify(updatedItems));
      const response = await cartService.updateCartItem(itemId, quantity);
      const items = ensureArray(response);
      localStorage.setItem('cartItems', JSON.stringify(items));
      return items;
    } catch (error) {
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
      const currentItems = [...getState().cart.items];
      const updatedItems = currentItems.filter(item => item._id !== itemId);
      localStorage.setItem('cartItems', JSON.stringify(updatedItems));
      const response = await cartService.removeFromCart(itemId);
      const items = ensureArray(response);
      localStorage.setItem('cartItems', JSON.stringify(items));
      return items;
    } catch (error) {
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
      await cartService.clearCart();
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
          _id: Date.now().toString(),
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
      .addCase(updateCartItem.pending, (state) => {
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
      .addCase(removeFromCart.pending, (state) => {
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
    ? items.reduce((sum, item) => {
        const price = item.product?.price || item.price || 0;
        return sum + (price * item.quantity);
      }, 0)
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
