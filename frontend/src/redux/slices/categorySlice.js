import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks
export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      // This would normally make an API call
      return [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getCategoryById = createAsyncThunk(
  'category/getCategoryById',
  async (categoryId, { rejectWithValue }) => {
    try {
      // This would normally make an API call
      return { id: categoryId, name: 'Category', products: [] };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getCategoryBreadcrumb = createAsyncThunk(
  'category/getCategoryBreadcrumb',
  async (categoryId, { rejectWithValue }) => {
    try {
      // This would normally make an API call
      return [{ id: categoryId, name: 'Category' }];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getProductsByCategory = createAsyncThunk(
  'category/getProductsByCategory',
  async (categoryId, { rejectWithValue }) => {
    try {
      // This would normally make an API call
      return [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const categorySlice = createSlice({
  name: 'category',
  initialState: {
    categories: [],
    currentCategory: null,
    breadcrumb: [],
    products: [],
    isLoading: false,
    error: null
  },
  reducers: {
    clearCategory: (state) => {
      state.currentCategory = null;
      state.breadcrumb = [];
      state.products = [];
    }
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
      .addCase(getCategoryById.fulfilled, (state, action) => {
        state.currentCategory = action.payload;
      })
      .addCase(getCategoryBreadcrumb.fulfilled, (state, action) => {
        state.breadcrumb = action.payload;
      })
      .addCase(getProductsByCategory.fulfilled, (state, action) => {
        state.products = action.payload;
      });
  }
});

export const { clearCategory } = categorySlice.actions;
export default categorySlice.reducer;
