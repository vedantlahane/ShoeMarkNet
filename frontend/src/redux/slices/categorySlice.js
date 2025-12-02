import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import categoryService from '../../services/categoryService';

const normalizeCategories = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.categories)) return response.categories;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const normalizeProductsResponse = (response) => {
  const products = Array.isArray(response?.products)
    ? response.products
    : Array.isArray(response?.data?.products)
      ? response.data.products
      : Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

  return {
    products,
    pagination: response?.pagination || response?.data?.pagination || null,
    totalProducts: response?.totalProducts || response?.data?.totalProducts || response?.total || response?.count || products.length,
  };
};

// Async thunks
export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoryService.getAllCategories();
      return normalizeCategories(response);
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to load categories';
      return rejectWithValue(message);
    }
  }
);

export const fetchCategoryTree = createAsyncThunk(
  'category/fetchCategoryTree',
  async (options = {}, { rejectWithValue }) => {
    try {
      const response = await categoryService.getCategoryTree(options);
      return normalizeCategories(response);
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to load category tree';
      return rejectWithValue(message);
    }
  }
);

export const getCategoryById = createAsyncThunk(
  'category/getCategoryById',
  async (categoryId, { rejectWithValue }) => {
    try {
      return await categoryService.getCategoryById(categoryId);
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to load category';
      return rejectWithValue(message);
    }
  }
);

export const getCategoryBreadcrumb = createAsyncThunk(
  'category/getCategoryBreadcrumb',
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await categoryService.getCategoryBreadcrumb(categoryId);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to load breadcrumb';
      return rejectWithValue(message);
    }
  }
);

export const getProductsByCategory = createAsyncThunk(
  'category/getProductsByCategory',
  async ({ categoryId, filters = {}, includeTree = false }, { rejectWithValue }) => {
    try {
      const response = includeTree
        ? await categoryService.getProductsByCategoryTree(categoryId, filters)
        : await categoryService.getProductsByCategory(categoryId, filters);

      return {
        categoryId,
        ...normalizeProductsResponse(response),
        categoryInfo: response?.categoryInfo || null,
      };
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to load category products';
      return rejectWithValue(message);
    }
  }
);

export const createCategory = createAsyncThunk(
  'category/createCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      return await categoryService.createCategory(categoryData);
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to create category';
      return rejectWithValue(message);
    }
  }
);

export const updateCategory = createAsyncThunk(
  'category/updateCategory',
  async ({ categoryId, categoryData }, { rejectWithValue }) => {
    try {
      return await categoryService.updateCategory(categoryId, categoryData);
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to update category';
      return rejectWithValue(message);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'category/deleteCategory',
  async (categoryId, { rejectWithValue }) => {
    try {
      await categoryService.deleteCategory(categoryId);
      return categoryId;
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to delete category';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  categories: [],
  categoryTree: [],
  currentCategory: null,
  breadcrumb: [],
  products: [],
  pagination: null,
  totalProducts: 0,
  categoryInfo: null,
  isLoading: false,
  error: null,
  saving: false,
};

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    clearCategory: (state) => {
      state.currentCategory = null;
      state.breadcrumb = [];
      state.products = [];
      state.pagination = null;
      state.totalProducts = 0;
      state.categoryInfo = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchCategoryTree.fulfilled, (state, action) => {
        state.categoryTree = action.payload;
      })
      .addCase(getCategoryById.fulfilled, (state, action) => {
        state.currentCategory = action.payload;
      })
      .addCase(getCategoryById.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(getCategoryBreadcrumb.fulfilled, (state, action) => {
        state.breadcrumb = action.payload;
      })
      .addCase(getCategoryBreadcrumb.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(getProductsByCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProductsByCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
        state.totalProducts = action.payload.totalProducts;
        state.categoryInfo = action.payload.categoryInfo;
      })
      .addCase(getProductsByCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createCategory.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.saving = false;
        state.categories.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.categories = state.categories.map((category) =>
          category._id === action.payload._id ? action.payload : category
        );
        if (state.currentCategory?._id === action.payload._id) {
          state.currentCategory = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter((category) => category._id !== action.payload);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearCategory } = categorySlice.actions;
export default categorySlice.reducer;
