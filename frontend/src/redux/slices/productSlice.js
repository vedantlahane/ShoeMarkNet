// src/redux/slices/productSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import productService from "../../services/productService";

// Async thunks
export const fetchFeaturedProducts = createAsyncThunk(
  "product/fetchFeatured",
  async (_, { rejectWithValue }) => {
    try {
      return await productService.getFeaturedProducts();
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch featured products" }
      );
    }
  }
);

export const fetchCategories = createAsyncThunk(
  "product/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      return await productService.getCategories();
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch categories" }
      );
    }
  }
);

export const fetchProductById = createAsyncThunk(
  "product/fetchProductById",
  async (id, { rejectWithValue }) => {
    try {
      return await productService.getProductById(id);
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch product details" }
      );
    }
  }
);

export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await productService.getProducts(filters);
      
      // Check if response is an object but not an array
      if (response && typeof response === 'object' && !Array.isArray(response)) {
        // If response has a products property that is an array, return that
        if (Array.isArray(response.products)) {
          return response.products;
        }
        
        // If response has a data property that is an array, return that
        if (response.data && Array.isArray(response.data)) {
          return response.data;
        }
        
        // If response is an object of products, convert to array
        if (Object.keys(response).length > 0) {
          return Object.keys(response).map(key => ({
            _id: key,
            ...response[key]
          }));
        }
      }
      
      // If response is already an array, return it
      if (Array.isArray(response)) {
        return response;
      }
      
      // Default to empty array if none of the above conditions are met
      return [];
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch products' });
    }
  }
);


export const createReview = createAsyncThunk(
  "product/createReview",
  async ({ productId, reviewData }, { rejectWithValue }) => {
    try {
      return await productService.createReview(productId, reviewData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to submit review" }
      );
    }
  }
);

const initialState = {
  featuredProducts: [],
  categories: [],
  products: [],
  product: null,
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    clearProductError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Featured Products
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredProducts = action.payload;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add these cases to your existing extraReducers builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Single Product
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Review
      .addCase(createReview.pending, (state) => {
        state.loading = true;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        // If the current product is being reviewed, update its reviews
        if (state.product && state.product._id === action.payload.productId) {
          state.product.reviews = action.payload.reviews;
          state.product.rating = action.payload.rating;
          state.product.numReviews = action.payload.numReviews;
        }
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProductError } = productSlice.actions;
export default productSlice.reducer;
