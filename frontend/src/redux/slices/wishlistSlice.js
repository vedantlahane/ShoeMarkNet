// src/redux/slices/wishlistSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import wishlistService from '../../services/wishlistService';
import { toast } from 'react-hot-toast';

// Async thunks
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      return await wishlistService.getWishlist();
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch wishlist' });
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      return await wishlistService.addToWishlist(productId);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to add to wishlist' });
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      return await wishlistService.removeFromWishlist(productId);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to remove from wishlist' });
    }
  }
);

// Helper function to ensure items is an array
const ensureArray = (items) => {
  if (Array.isArray(items)) {
    return items;
  }
  if (items && typeof items === 'object' && items.items && Array.isArray(items.items)) {
    return items.items;
  }
  return [];
};

// Initial state with localStorage persistence
const getInitialState = () => {
  let items = [];
  try {
    const storedItems = localStorage.getItem('wishlist');
    if (storedItems) {
      const parsedItems = JSON.parse(storedItems);
      items = ensureArray(parsedItems);
    }
  } catch (error) {
    console.error('Error parsing wishlist from localStorage:', error);
  }
  
  return {
    items,
    loading: false,
    error: null,
  };
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: getInitialState(),
  reducers: {
    clearWishlistError: (state) => {
      state.error = null;
    },
    resetWishlist: (state) => {
      state.items = [];
      localStorage.removeItem('wishlist');
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = ensureArray(action.payload);
        localStorage.setItem('wishlist', JSON.stringify(state.items));
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add to Wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = ensureArray(action.payload);
        localStorage.setItem('wishlist', JSON.stringify(state.items));
        toast.success('Item added to wishlist');
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload?.message || 'Failed to add to wishlist');
      })
      
      // Remove from Wishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = ensureArray(action.payload);
        localStorage.setItem('wishlist', JSON.stringify(state.items));
        toast.success('Item removed from wishlist');
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload?.message || 'Failed to remove from wishlist');
      });
  },
});

export const { clearWishlistError, resetWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
