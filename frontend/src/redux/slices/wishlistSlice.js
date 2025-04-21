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

// Initial state with localStorage persistence
const getInitialState = () => {
  const items = localStorage.getItem('wishlist') 
    ? JSON.parse(localStorage.getItem('wishlist')) 
    : [];
  
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
        state.items = action.payload;
        localStorage.setItem('wishlist', JSON.stringify(action.payload));
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
        state.items = action.payload;
        localStorage.setItem('wishlist', JSON.stringify(action.payload));
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
        state.items = action.payload;
        localStorage.setItem('wishlist', JSON.stringify(action.payload));
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
