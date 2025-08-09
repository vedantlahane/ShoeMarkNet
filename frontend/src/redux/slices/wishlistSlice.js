// src/redux/slices/wishlistSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import wishlistService from "../../services/wishlistService";
import { toast } from "react-toastify";

// Get wishlist from localStorage
const wishlistItems = localStorage.getItem("wishlist")
  ? JSON.parse(localStorage.getItem("wishlist"))
  : [];

const initialState = {
  items: wishlistItems,
  totalItems: wishlistItems.length,
  pagination: null,
  loading: false,
  error: null,
};

// Fetch wishlist
export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const response = await wishlistService.getWishlist(page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch wishlist"
      );
    }
  }
);

// Add to wishlist
export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await wishlistService.addToWishlist(productId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add to wishlist"
      );
    }
  }
);

// Remove from wishlist thunk
export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await wishlistService.removeFromWishlist(productId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to remove from wishlist'
      );
    }
  }
);

// Clear wishlist thunk
export const clearWishlistAsync = createAsyncThunk(
  'wishlist/clearWishlistAsync',
  async (_, { rejectWithValue }) => {
    try {
      const response = await wishlistService.clearWishlist();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to clear wishlist'
      );
    }
  }
);
const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearWishlistLocal: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.pagination = null;
      localStorage.removeItem("wishlist");
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products || [];
        state.totalItems = action.payload.pagination?.total || 0;
        state.pagination = action.payload.pagination;
        localStorage.setItem("wishlist", JSON.stringify(state.items));
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Add to wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products || [];
        state.totalItems = action.payload.productCount || action.payload.products?.length || 0;
        localStorage.setItem("wishlist", JSON.stringify(state.items));
        toast.success("Item added to wishlist");
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Remove from wishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products || [];
        state.totalItems = action.payload.productCount || action.payload.products?.length || 0;
        localStorage.setItem("wishlist", JSON.stringify(state.items));
        toast.success("Item removed from wishlist");
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Clear wishlist
      .addCase(clearWishlistAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearWishlistAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [];
        state.totalItems = 0;
        state.pagination = null;
        localStorage.removeItem("wishlist");
        toast.success("Wishlist cleared");
      })
      .addCase(clearWishlistAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { clearWishlistLocal } = wishlistSlice.actions;
export default wishlistSlice.reducer;
