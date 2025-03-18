import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  filterState: false,
  filters: {
    search: "",
    minPrice: "",
    maxPrice: "",
    size: "",
    color: "",
    category: "",
    rating: "",
  }
};

const FilterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    setOpenFilter: (state, action) => {
      state.filterState = action.payload.filterState;//setOpenFilter action sets the filterState to true
    },
    setCloseFilter: (state, action) => {
      state.filterState = action.payload.filterState;//setCloseFilter action sets the filterState to false
    },
    setFilters: (state, action) => {
      state.filters = action.payload;//setFilters action sets the filters to the payload
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;//clearFilters action sets the filters to the initialState.filters
    },
  },
});

export const {
  setOpenFilter,
  setCloseFilter,
  setFilters,
  clearFilters,
} = FilterSlice.actions;

export const selectFilterState = (state) => state.filter.filterState;
export const selectFilters = (state) => state.filter.filters;

export default FilterSlice.reducer;