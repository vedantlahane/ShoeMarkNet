import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import wishlistService from "../../services/wishlistService";
import { toast } from "react-toastify";

// Helper to get wishlist from localStorage with error handling
const getWishlistFromStorage = () => {
  try {
    const wishlistItems = localStorage.getItem("wishlist");
    return wishlistItems ? JSON.parse(wishlistItems) : [];
  } catch (error) {
    console.error('Error parsing wishlist from localStorage:', error);
    localStorage.removeItem("wishlist");
    return [];
  }
};

// Helper to save wishlist to localStorage
const saveWishlistToStorage = (items) => {
  try {
    localStorage.setItem("wishlist", JSON.stringify(items));
  } catch (error) {
    console.error('Error saving wishlist to localStorage:', error);
  }
};

// Helper to extract products from response
const normalizeWishlistItems = (items = []) => {
  return items
    .map((item) => {
      if (!item) return null;

      const baseProduct = item.product && typeof item.product === 'object'
        ? { ...item.product }
        : { ...item };

      return {
        ...baseProduct,
        wishlistAddedAt: item.wishlistAddedAt ?? item.addedAt ?? baseProduct?.wishlistAddedAt ?? null,
      };
    })
    .filter(Boolean);
};

const extractWishlistProducts = (response) => {
  if (!response) return [];
  if (Array.isArray(response)) return normalizeWishlistItems(response);
  if (Array.isArray(response?.products)) return normalizeWishlistItems(response.products);
  if (Array.isArray(response?.items)) return normalizeWishlistItems(response.items);
  return [];
};

const initialState = {
  items: getWishlistFromStorage(),
  totalItems: 0,
  pagination: null,
  loading: false,
  error: null,
  addLoading: false,
  removeLoading: false,
};

// Calculate initial total
initialState.totalItems = initialState.items.length;

// Fetch wishlist
export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const response = await wishlistService.getWishlist(page, limit);
      const products = Array.isArray(response?.products)
        ? response.products
        : extractWishlistProducts(response);
      
      saveWishlistToStorage(products);
      
      return {
        products,
        pagination: response?.pagination || null,
        totalItems: response?.productCount ?? response?.pagination?.total ?? products.length,
      };
    } catch (error) {
      const message = error?.userMessage || error.response?.data?.message || "Failed to fetch wishlist";
      return rejectWithValue({ message });
    }
  }
);

// Add to wishlist
export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async ({ productId, product }, { rejectWithValue, getState }) => {
    try {
      // Check if product is already in wishlist
      const currentItems = getState().wishlist.items;
      const existingItem = currentItems.find(item => 
        (item._id || item.id) === productId || 
        (item.product?._id || item.product?.id) === productId
      );
      
      if (existingItem) {
        toast.info("Product is already in your wishlist");
        return rejectWithValue({ message: "Product already in wishlist" });
      }

      // Optimistic update
      let optimisticItem;
      if (product) {
        optimisticItem = { 
          _id: productId, 
          ...product,
          addedAt: new Date().toISOString()
        };
      } else {
        optimisticItem = { 
          _id: productId,
          addedAt: new Date().toISOString()
        };
      }
      
      const updatedItems = [optimisticItem, ...currentItems];
      saveWishlistToStorage(updatedItems);

      const response = await wishlistService.addToWishlist(productId);
      const products = Array.isArray(response?.products)
        ? response.products
        : extractWishlistProducts(response);
      
      saveWishlistToStorage(products);
      
      return {
        products,
        totalItems: response?.productCount ?? products.length,
        addedProduct: optimisticItem,
      };
    } catch (error) {
      // Revert optimistic update
      const currentItems = getState().wishlist.items;
      saveWishlistToStorage(currentItems);
      
      const message = error?.userMessage || error.response?.data?.message || "Failed to add to wishlist";
      return rejectWithValue({ message });
    }
  }
);

// Remove from wishlist
export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async ({ productId, productName }, { rejectWithValue, getState }) => {
    try {
      // Optimistic update
      const currentItems = getState().wishlist.items;
      const updatedItems = currentItems.filter(item => 
        (item._id || item.id) !== productId && 
        (item.product?._id || item.product?.id) !== productId
      );
      saveWishlistToStorage(updatedItems);

      const response = await wishlistService.removeFromWishlist(productId);
      const products = Array.isArray(response?.products)
        ? response.products
        : extractWishlistProducts(response);
      
      saveWishlistToStorage(products);
      
      return {
        products,
        totalItems: response?.productCount ?? products.length,
        removedProductId: productId,
        productName,
      };
    } catch (error) {
      // Revert optimistic update
      const currentItems = getState().wishlist.items;
      saveWishlistToStorage(currentItems);
      
      const message = error?.userMessage || error.response?.data?.message || "Failed to remove from wishlist";
      return rejectWithValue({ message });
    }
  }
);

// Toggle wishlist item
export const toggleWishlistItem = createAsyncThunk(
  "wishlist/toggleWishlistItem",
  async ({ productId, product }, { rejectWithValue, getState, dispatch }) => {
    try {
      const currentItems = getState().wishlist.items;
      const isInWishlist = currentItems.some(item => 
        (item._id || item.id) === productId || 
        (item.product?._id || item.product?.id) === productId
      );
      
      if (isInWishlist) {
        return dispatch(removeFromWishlist({ productId, productName: product?.name })).unwrap();
      } else {
        return dispatch(addToWishlist({ productId, product })).unwrap();
      }
    } catch (error) {
      return rejectWithValue({ message: error.message || "Failed to toggle wishlist item" });
    }
  }
);

// Clear wishlist
export const clearWishlistAsync = createAsyncThunk(
  "wishlist/clearWishlistAsync",
  async (_, { rejectWithValue }) => {
    try {
  await wishlistService.clearWishlist();
      localStorage.removeItem("wishlist");
      return { products: [], totalItems: 0 };
    } catch (error) {
      const message = error?.userMessage || error.response?.data?.message || "Failed to clear wishlist";
      return rejectWithValue({ message });
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
      state.error = null;
      localStorage.removeItem("wishlist");
    },
    
    clearWishlistError: (state) => {
      state.error = null;
    },
    
    addItemLocally: (state, action) => {
      const { productId, product } = action.payload;
      
      // Check if product is already in wishlist
      const existingItem = state.items.find(item => 
        (item._id || item.id) === productId
      );
      
      if (!existingItem) {
        const newItem = {
          _id: productId,
          ...product,
          addedAt: new Date().toISOString(),
          isLocal: true,
        };
        
        state.items.unshift(newItem);
        state.totalItems = state.items.length;
        saveWishlistToStorage(state.items);
        toast.success("Added to wishlist!");
      } else {
        toast.info("Product is already in your wishlist");
      }
    },
    
    removeItemLocally: (state, action) => {
      const productId = action.payload;
      const removedItem = state.items.find(item => (item._id || item.id) === productId);
      
      state.items = state.items.filter(item => (item._id || item.id) !== productId);
      state.totalItems = state.items.length;
      saveWishlistToStorage(state.items);
      
      if (removedItem) {
        toast.success(`${removedItem.name || 'Item'} removed from wishlist`);
      }
    },
    
    syncWishlistFromStorage: (state) => {
      state.items = getWishlistFromStorage();
      state.totalItems = state.items.length;
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
        state.items = action.payload.products;
        state.totalItems = action.payload.totalItems;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add to wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.addLoading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.addLoading = false;
        state.items = action.payload.products;
        state.totalItems = action.payload.totalItems;
        state.error = null;
        
        // Show success toast
        const productName = action.payload.addedProduct?.name || 'Item';
        toast.success(`${productName} added to wishlist!`);
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.addLoading = false;
        state.error = action.payload;
        
        // Only show error if it's not "already in wishlist"
        if (!action.payload?.message?.includes('already in wishlist')) {
          toast.error(action.payload?.message || 'Failed to add to wishlist');
        }
      })

      // Remove from wishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.removeLoading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.removeLoading = false;
        state.items = action.payload.products;
        state.totalItems = action.payload.totalItems;
        state.error = null;
        
        // Show success toast
        const productName = action.payload.productName || 'Item';
        toast.success(`${productName} removed from wishlist`);
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.removeLoading = false;
        state.error = action.payload;
        toast.error(action.payload?.message || 'Failed to remove from wishlist');
      })

      // Toggle wishlist item
      .addCase(toggleWishlistItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleWishlistItem.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.products) {
          state.items = action.payload.products;
          state.totalItems = action.payload.totalItems || action.payload.products.length;
        }
        state.error = null;
      })
      .addCase(toggleWishlistItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Clear wishlist
      .addCase(clearWishlistAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearWishlistAsync.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.totalItems = 0;
        state.pagination = null;
        state.error = null;
        toast.success("Wishlist cleared successfully!");
      })
      .addCase(clearWishlistAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload?.message || 'Failed to clear wishlist');
      });
  },
});

// Enhanced selectors
export const selectWishlistItems = (state) => state.wishlist.items;
export const selectWishlistLoading = (state) => state.wishlist.loading;
export const selectWishlistError = (state) => state.wishlist.error;
export const selectWishlistTotalItems = (state) => state.wishlist.totalItems;
export const selectWishlistPagination = (state) => state.wishlist.pagination;
export const selectIsInWishlist = (productId) => (state) => 
  state.wishlist.items.some(item => 
    (item._id || item.id) === productId || 
    (item.product?._id || item.product?.id) === productId
  );
export const selectWishlistIsEmpty = (state) => state.wishlist.items.length === 0;

export const {
  clearWishlistLocal,
  clearWishlistError,
  addItemLocally,
  removeItemLocally,
  syncWishlistFromStorage,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
