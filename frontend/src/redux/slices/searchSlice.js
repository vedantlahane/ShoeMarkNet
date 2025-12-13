import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import searchService from '../../services/searchService';

// Normalize search responses that may include nested data/pagination shapes
const normalizeSearchResponse = (response) => {
  const results = Array.isArray(response)
    ? response
    : Array.isArray(response?.results)
      ? response.results
      : Array.isArray(response?.products)
        ? response.products
        : Array.isArray(response?.data)
          ? response.data
          : [];

  const pagination = response?.pagination || null;
  const totalResults = response?.totalResults ?? response?.total ?? pagination?.total ?? results.length;

  return {
    results,
    pagination,
    totalResults,
  };
};

// Async thunks
export const searchProducts = createAsyncThunk(
  'search/searchProducts',
  async ({ query, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await searchService.searchProducts(query, filters);
      const normalized = normalizeSearchResponse(response);
      return { ...normalized, query };
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Search failed';
      return rejectWithValue(message);
    }
  }
);

export const fetchSearchSuggestions = createAsyncThunk(
  'search/fetchSuggestions',
  async (query, { rejectWithValue }) => {
    try {
      const suggestions = await searchService.getSearchSuggestions(query);
      return Array.isArray(suggestions) ? suggestions : [];
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch suggestions';
      return rejectWithValue(message);
    }
  }
);

export const fetchPopularSearches = createAsyncThunk(
  'search/fetchPopular',
  async (_, { rejectWithValue }) => {
    try {
      const popular = await searchService.getPopularSearches();
      return Array.isArray(popular) ? popular : [];
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to load popular searches';
      return rejectWithValue(message);
    }
  }
);

export const fetchSearchHistory = createAsyncThunk(
  'search/fetchHistory',
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const history = await searchService.getUserSearchHistory(page, limit);

      return {
        items: Array.isArray(history?.items) ? history.items : Array.isArray(history) ? history : [],
        pagination: history?.pagination || null,
        total: history?.total || history?.totalItems || history?.count || 0,
      };
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to load search history';
      return rejectWithValue(message);
    }
  }
);

export const clearSearchHistory = createAsyncThunk(
  'search/clearHistory',
  async (_, { rejectWithValue }) => {
    try {
      await searchService.clearSearchHistory();
      return true;
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to clear history';
      return rejectWithValue(message);
    }
  }
);

export const clearSearch = createAsyncThunk('search/clearSearch', async () => null);

export const updateSearchFilters = createAsyncThunk('search/updateSearchFilters', async (filters) => filters);

export const saveSearchQuery = createAsyncThunk('search/saveSearchQuery', async (query) => query);

export const addToRecentSearches = createAsyncThunk('search/addToRecentSearches', async (query) => query);

const initialState = {
  query: '',
  results: [],
  pagination: null,
  totalResults: 0,
  recentSearches: [],
  filters: {},
  isLoading: false,
  error: null,
  suggestions: [],
  suggestionsLoading: false,
  popularSearches: [],
  history: {
    items: [],
    pagination: null,
    total: 0,
    loading: false,
    error: null,
  },
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
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
      state.pagination = null;
    },
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
        state.pagination = action.payload.pagination;
        state.totalResults = action.payload.totalResults;
        state.query = action.payload.query;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchSearchSuggestions.pending, (state) => {
        state.suggestionsLoading = true;
      })
      .addCase(fetchSearchSuggestions.fulfilled, (state, action) => {
        state.suggestionsLoading = false;
        state.suggestions = action.payload;
      })
      .addCase(fetchSearchSuggestions.rejected, (state) => {
        state.suggestionsLoading = false;
        state.suggestions = [];
      })
      .addCase(fetchPopularSearches.fulfilled, (state, action) => {
        state.popularSearches = action.payload;
      })
      .addCase(fetchPopularSearches.rejected, (state) => {
        state.popularSearches = [];
      })
      .addCase(fetchSearchHistory.pending, (state) => {
        state.history.loading = true;
        state.history.error = null;
      })
      .addCase(fetchSearchHistory.fulfilled, (state, action) => {
        state.history.loading = false;
        state.history.items = action.payload.items;
        state.history.pagination = action.payload.pagination;
        state.history.total = action.payload.total;
      })
      .addCase(fetchSearchHistory.rejected, (state, action) => {
        state.history.loading = false;
        state.history.error = action.payload;
      })
      .addCase(clearSearchHistory.fulfilled, (state) => {
        state.history.items = [];
        state.history.pagination = null;
        state.history.total = 0;
      })
      .addCase(clearSearch.fulfilled, (state) => {
        state.query = '';
        state.results = [];
        state.totalResults = 0;
        state.filters = {};
        state.pagination = null;
        state.error = null;
      })
      .addCase(updateSearchFilters.fulfilled, (state, action) => {
        state.filters = action.payload;
      })
      .addCase(addToRecentSearches.fulfilled, (state, action) => {
        const query = action.payload;
        state.recentSearches = [
          query,
          ...state.recentSearches.filter((q) => q !== query),
        ].slice(0, 10);
      });
  },
});

export const { setQuery, setFilters, clearResults } = searchSlice.actions;
export default searchSlice.reducer;
