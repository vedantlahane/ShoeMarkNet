import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import productService from "../../services/productService";
import { toast } from "react-toastify";

// Helper function to extract products array from different response formats
const extractProducts = (response) => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.products)) return response.products;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.results)) return response.results;
  if (response?.data) return extractProducts(response.data);

  if (response && typeof response === 'object') {
    const keys = Object.keys(response);
    if (keys.length > 0 && keys.every((key) => /^\d+$/.test(key))) {
      return keys
        .sort((a, b) => Number(a) - Number(b))
        .map((key) => response[key]);
    }
  }

  return [];
};

// Async thunks
export const fetchFeaturedProducts = createAsyncThunk(
  "product/fetchFeatured",
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getFeaturedProducts();
      return extractProducts(response);
    } catch (error) {
      const message = error?.userMessage || error.response?.data?.message || "Failed to fetch featured products";
      return rejectWithValue({ message });
    }
  }
);

export const fetchNewArrivals = createAsyncThunk(
  "product/fetchNewArrivals",
  async (options = {}, { rejectWithValue }) => {
    try {
      const response = await productService.getNewArrivals(options);
      return extractProducts(response);
    } catch (error) {
      const message = error?.userMessage || error.response?.data?.message || "Failed to fetch new arrivals";
      return rejectWithValue({ message });
    }
  }
);

export const fetchCategories = createAsyncThunk(
  "product/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getCategories();
      return Array.isArray(response) ? response : response?.categories || [];
    } catch (error) {
      const message = error?.userMessage || error.response?.data?.message || "Failed to fetch categories";
      return rejectWithValue({ message });
    }
  }
);

export const fetchProducts = createAsyncThunk(
  "product/fetchProducts",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await productService.getProducts(filters);
      
      return {
        products: extractProducts(response),
        pagination: response?.pagination || null,
        totalProducts: response?.totalProducts || response?.total || 0,
      };
    } catch (error) {
      const message = error?.userMessage || error.response?.data?.message || "Failed to fetch products";
      return rejectWithValue({ message });
    }
  }
);

export const searchProducts = createAsyncThunk(
  "product/searchProducts",
  async ({ query, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await productService.searchProducts(query, filters);
      
      return {
        products: extractProducts(response),
        pagination: response?.pagination || null,
        totalProducts: response?.totalProducts || response?.total || 0,
        query,
      };
    } catch (error) {
      const message = error?.userMessage || error.response?.data?.message || "Search failed";
      return rejectWithValue({ message });
    }
  }
);

export const fetchProductById = createAsyncThunk(
  "product/fetchProductById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await productService.getProductById(id);
      return response;
    } catch (error) {
      const message = error?.userMessage || error.response?.data?.message || "Failed to fetch product details";
      return rejectWithValue({ message });
    }
  }
);

export const fetchProductBySlug = createAsyncThunk(
  "product/fetchProductBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      const response = await productService.getProductBySlug(slug);
      return response;
    } catch (error) {
      const message = error?.userMessage || error.response?.data?.message || "Failed to fetch product details";
      return rejectWithValue({ message });
    }
  }
);

export const fetchRelatedProducts = createAsyncThunk(
  "product/fetchRelatedProducts",
  async ({ productId, options = {} }, { rejectWithValue }) => {
    try {
      const response = await productService.getRelatedProducts(productId, options);
      return extractProducts(response);
    } catch (error) {
      const message = error?.userMessage || error.response?.data?.message || "Failed to fetch related products";
      return rejectWithValue({ message });
    }
  }
);

// Admin functions
export const createProduct = createAsyncThunk(
  "product/createProduct",
  async (productData, { rejectWithValue }) => {
    try {
      const response = await productService.createProduct(productData);
      toast.success("Product created successfully!");
      return response;
    } catch (error) {
      const message = error?.userMessage || error.response?.data?.message || "Failed to create product";
      toast.error(message);
      return rejectWithValue({ message });
    }
  }
);

export const updateProduct = createAsyncThunk(
  "product/updateProduct",
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const response = await productService.updateProduct(id, productData);
      toast.success("Product updated successfully!");
      return response;
    } catch (error) {
      const message = error?.userMessage || error.response?.data?.message || "Failed to update product";
      toast.error(message);
      return rejectWithValue({ message });
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "product/deleteProduct",
  async ({ id, name }, { rejectWithValue }) => {
    try {
      await productService.deleteProduct(id);
      toast.success(`Product "${name || 'Unknown'}" deleted successfully!`);
      return id;
    } catch (error) {
      const message = error?.userMessage || error.response?.data?.message || "Failed to delete product";
      toast.error(message);
      return rejectWithValue({ message });
    }
  }
);

export const bulkUpdateProducts = createAsyncThunk(
  "product/bulkUpdateProducts",
  async ({ productIds, updates }, { rejectWithValue }) => {
    try {
      const response = await productService.bulkUpdateProducts({ productIds, updates });
      toast.success(`${response.modifiedCount} product(s) updated successfully!`);
      return response;
    } catch (error) {
      const message = error?.userMessage || error.response?.data?.message || "Failed to bulk update products";
      toast.error(message);
      return rejectWithValue({ message });
    }
  }
);

// Review functions
export const createReview = createAsyncThunk(
  "product/createReview",
  async ({ productId, reviewData }, { rejectWithValue }) => {
    try {
      const response = await productService.createReview(productId, reviewData);
      toast.success("Review submitted successfully!");
      return { productId, review: response };
    } catch (error) {
      const message = error?.userMessage || error.response?.data?.message || "Failed to submit review";
      toast.error(message);
      return rejectWithValue({ message });
    }
  }
);

const initialState = {
  // Product lists
  featuredProducts: [],
  newArrivals: [],
  products: [],
  searchResults: [],
  relatedProducts: [],
  
  // Single product
  product: null,
  
  // Categories
  categories: [],
  
  // Pagination
  pagination: null,
  totalProducts: 0,
  
  // Search
  lastSearchQuery: "",
  
  // Loading states
  loading: false,
  featuredLoading: false,
  searchLoading: false,
  productLoading: false,
  categoriesLoading: false,
  
  // Error states
  error: null,
  searchError: null,
  
  // Success states
  createSuccess: false,
  updateSuccess: false,
  deleteSuccess: false,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    clearProductError: (state) => {
      state.error = null;
      state.searchError = null;
    },
    
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.lastSearchQuery = "";
      state.searchError = null;
    },
    
    clearProductDetails: (state) => {
      state.product = null;
      state.relatedProducts = [];
    },
    
    clearSuccessFlags: (state) => {
      state.createSuccess = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
    },
    
    setProducts: (state, action) => {
      state.products = action.payload;
    },

    hydrateFeaturedProducts: (state, action) => {
      const cached = Array.isArray(action.payload) ? action.payload : [];
      if (cached.length > 0) {
        state.featuredProducts = cached;
        state.featuredLoading = false;
        state.error = null;
      }
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Featured Products
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.featuredLoading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featuredLoading = false;
        state.featuredProducts = action.payload;
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.featuredLoading = false;
        state.error = action.payload;
      })
      
      // New Arrivals
      .addCase(fetchNewArrivals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNewArrivals.fulfilled, (state, action) => {
        state.loading = false;
        state.newArrivals = action.payload;
        state.error = null;
      })
      .addCase(fetchNewArrivals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Categories
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.error = action.payload;
      })
      
      // Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
        state.totalProducts = action.payload.totalProducts;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Search Products
      .addCase(searchProducts.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.products;
        state.pagination = action.payload.pagination;
        state.totalProducts = action.payload.totalProducts;
        state.lastSearchQuery = action.payload.query;
        state.searchError = null;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload;
      })
      
      // Single Product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.productLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.productLoading = false;
        state.product = action.payload;
        state.error = null;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.productLoading = false;
        state.error = action.payload;
      })
      
      // Single Product by Slug
      .addCase(fetchProductBySlug.pending, (state) => {
        state.productLoading = true;
        state.error = null;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.productLoading = false;
        state.product = action.payload;
        state.error = null;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.productLoading = false;
        state.error = action.payload;
      })
      
      // Related Products
      .addCase(fetchRelatedProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRelatedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.relatedProducts = action.payload;
      })
      .addCase(fetchRelatedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.createSuccess = false;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = [action.payload, ...state.products];
        state.createSuccess = true;
        state.error = null;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.createSuccess = false;
      })
      
      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        if (state.product && state.product._id === action.payload._id) {
          state.product = action.payload;
        }
        state.updateSuccess = true;
        state.error = null;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.updateSuccess = false;
      })
      
      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.deleteSuccess = false;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(
          (product) => product._id !== action.payload
        );
        if (state.product && state.product._id === action.payload) {
          state.product = null;
        }
        state.deleteSuccess = true;
        state.error = null;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.deleteSuccess = false;
      })
      
      // Bulk Update Products
      .addCase(bulkUpdateProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkUpdateProducts.fulfilled, (state, action) => {
        state.loading = false;
        // Update products in the state that were modified
        if (action.payload.modifiedCount > 0) {
          // Note: We don't update the local state here as the bulk update
          // might affect products not currently loaded. A refetch would be needed
          // to get the updated data, but we'll just clear success flags for now.
        }
        state.error = null;
      })
      .addCase(bulkUpdateProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Review
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        // Update the current product's reviews if it's the same product
        if (state.product && state.product._id === action.payload.productId) {
          if (action.payload.review.product) {
            state.product = action.payload.review.product;
          }
        }
        state.error = null;
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Enhanced selectors
export const selectFeaturedProducts = (state) => state.product.featuredProducts;
export const selectNewArrivals = (state) => state.product.newArrivals;
export const selectProducts = (state) => state.product.products;
export const selectSearchResults = (state) => state.product.searchResults;
export const selectRelatedProducts = (state) => state.product.relatedProducts;
export const selectProduct = (state) => state.product.product;
export const selectCategories = (state) => state.product.categories;
export const selectProductLoading = (state) => state.product.loading;
export const selectProductError = (state) => state.product.error;
export const selectPagination = (state) => state.product.pagination;
export const selectLastSearchQuery = (state) => state.product.lastSearchQuery;

export const {
  clearProductError,
  clearSearchResults,
  clearProductDetails,
  clearSuccessFlags,
  setProducts,
  hydrateFeaturedProducts,
} = productSlice.actions;

export default productSlice.reducer;
