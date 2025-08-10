import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks
export const searchProducts = createAsyncThunk(
  'search/searchProducts',
  async (searchQuery, { rejectWithValue }) => {
    try {
      // This would normally make an API call
      // For now, return mock data
      return {
        results: [],
        query: searchQuery,
        totalResults: 0
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const clearSearch = createAsyncThunk(
  'search/clearSearch',
  async () => {
    return null;
  }
);

export const updateSearchFilters = createAsyncThunk(
  'search/updateSearchFilters',
  async (filters) => {
    return filters;
  }
);

export const saveSearchQuery = createAsyncThunk(
  'search/saveSearchQuery',
  async (query) => {
    return query;
  }
);

export const addToRecentSearches = createAsyncThunk(
  'search/addToRecentSearches',
  async (query) => {
    return query;
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    query: '',
    results: [],
    recentSearches: [],
    filters: {},
    isLoading: false,
    error: null,
    totalResults: 0
  },
  reducers: {
    setQuery: (state, action) => {
      state.query = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearResults: (state) => {
      state.results = [];
      state.totalResults = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.results = action.payload.results;
        state.totalResults = action.payload.totalResults;
        state.query = action.payload.query;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(clearSearch.fulfilled, (state) => {
        state.query = '';
        state.results = [];
        state.totalResults = 0;
        state.filters = {};
      })
      .addCase(updateSearchFilters.fulfilled, (state, action) => {
        state.filters = action.payload;
      })
      .addCase(addToRecentSearches.fulfilled, (state, action) => {
        const query = action.payload;
        state.recentSearches = [
          query,
          ...state.recentSearches.filter(q => q !== query)
        ].slice(0, 10);
      });
  }
});

export const { setQuery, setFilters, clearResults } = searchSlice.actions;
export default searchSlice.reducer;
