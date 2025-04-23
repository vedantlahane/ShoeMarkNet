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
  "product/fetchProducts",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await productService.getProducts(filters);

      // Check if response is an object but not an array
      if (
        response &&
        typeof response === "object" &&
        !Array.isArray(response)
      ) {
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
          return Object.keys(response).map((key) => ({
            _id: key,
            ...response[key],
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
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch products" }
      );
    }
  }
);

// Add these async thunks to your productSlice.js file

export const createProduct = createAsyncThunk(
  "product/createProduct",
  async (productData, { rejectWithValue }) => {
    try {
      return await productService.createProduct(productData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to create product" }
      );
    }
  }
);

export const updateProduct = createAsyncThunk(
  "product/updateProduct",
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      return await productService.updateProduct(id, productData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to update product" }
      );
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "product/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      const result = await productService.deleteProduct(id);
      // Return both the result and the id for the reducer to use
      return { result, id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to delete product" }
      );
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
      // Add these cases to your extraReducers builder in productSlice.js

      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
      })
      // Update the createProduct.fulfilled case in your productSlice.js
.addCase(createProduct.fulfilled, (state, action) => {
  state.loading = false;
  // The backend returns { message, product }, so we need to extract the product
  const newProduct = action.payload.product || action.payload;
  state.products.push(newProduct);
})

      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        // Find and update the product in the array
        const index = state.products.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        // If the updated product is the currently selected product, update it too
        if (state.product && state.product._id === action.payload._id) {
          state.product = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the deleted product from the array
        state.products = state.products.filter(
          (product) => product._id !== action.payload.id
        );
        // If the deleted product is the currently selected product, clear it
        if (state.product && state.product._id === action.payload.id) {
          state.product = null;
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
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
