// Import necessary modules and components.
import React from "react";
import { useDispatch, useSelector } from "react-redux";
// Import Redux selectors and actions from the FilterSlice.
import {
  selectFilterState,
  selectFilters,
  setCloseFilter,
  setFilters,
  clearFilters,
} from "../app/FilterSlice";
// Import icons for UI elements.
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ChevronDoubleLeftIcon } from '@heroicons/react/24/solid';

/* 
  FilterCount Component:
  -----------------------
  This small component renders the header of the filter panel. It includes:
  - A back button (ChevronDoubleLeftIcon) that calls onFilterToggle to close the filter panel.
  - A label "Filters".
  - A clear filters button (XMarkIcon) that calls onClearFilters to remove all current filters.
*/
const FilterCount = ({ onFilterToggle, onClearFilters }) => {
  return (
    <div className="bg-white h-11 flex items-center justify-between px-3 sticky top-0 left-0 right-0 w-full">
      {/* Left Section: Back button and "Filters" label */}
      <div className="flex items-center gap-3">
        <div
          className="grid items-center cursor-pointer"
          onClick={onFilterToggle} // Clicking this toggles the filter panel.
        >
          <ChevronDoubleLeftIcon className='w-5 h-5 text-slate-900 hover:text-orange-500 stroke-[2]' />
        </div>
        <div className="grid items-center">
          <h1 className="text-base font-medium text-slate-900">Filters</h1>
        </div>
      </div>
      {/* Right Section: Clear Filters Button */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={onClearFilters} // Clicking clears all filters.
          className="rounded bg-theme-cart active:scale-90 p-0.5"
        >
          <XMarkIcon className="w-5 h-5 text-white stroke-[2]" />
        </button>
      </div>
    </div>
  );
};

/*
  Filter Component:
  -----------------
  This is the main component responsible for displaying all filter options.
  It uses Redux to obtain and update filter values and controls the visibility of the filter panel.
*/
const Filter = () => {
  // Initialize Redux's dispatch function.
  const dispatch = useDispatch();
  // Retrieve the current state of the filter panel (open or closed).
  const ifFilterState = useSelector(selectFilterState);
  // Retrieve the current filter values.
  const filters = useSelector(selectFilters);

  // onFilterToggle closes the filter panel by dispatching setCloseFilter with filterState set to false.
  const onFilterToggle = () => {
    dispatch(
      setCloseFilter({
        filterState: false,
      })
    );
  };

  // onClearFilters dispatches the clearFilters action to reset all filter values to their initial defaults.
  const onClearFilters = () => {
    dispatch(clearFilters());
  };

  // handleFilterChange updates the Redux filters state when any input changes.
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    // Dispatch setFilters with the updated filter object.
    dispatch(
      setFilters({
        ...filters,  // spread the current filters.
        //what does this do? ...filters means that all the filters are copied and then the specific filter that changed is updated.
        [name]: value,  // update the specific filter that changed.
      })
    );
  };

  return (
    <>
      {/* Main filter overlay container, which is conditionally visible based on ifFilterState. */}
      <div
        className={`fixed top-[9vh] left-0 right-0 bottom-5 blur-effect-theme duration-500 w-full h-[93vh] opacity-100 z-[350] ${
          ifFilterState
            ? "opacity-100 visible translate-x-0"   // When open, fully visible and translated into view.
            : "opacity-0 invisible -translate-x-8"  // When closed, hidden and moved off-screen.
        }`}
      >
        {/* Inner container with maximum width and transition effects */}
        <div
          className={`blur-effect-theme duration-500 h-[90vh] max-w-xl w-full absolute left-0 ${
            ifFilterState
              ? "opacity-100 visible translate-x-0"
              : "opacity-0 invisible -translate-x-8"
          }`}
        >
          {/* Render the FilterCount header, passing toggle and clear actions as props */}
          <FilterCount
            onFilterToggle={onFilterToggle}
            onClearFilters={onClearFilters}
          />

          {/* Filter options container: This scrollable section contains all the individual filter fields. */}
          <div className="flex items-start justify-start flex-col gap-y-7 lg:gap-y-5 overflow-y-scroll h-[81vh] scroll-smooth scroll-hidden py-3 px-5">
            {/* --- Search Input Field --- */}
            <div className="w-full">
              <label className="text-base font-medium text-slate-900">
                Search
              </label>
              <input
                type="text"
                name="search"
                value={filters.search}  // Bound to Redux filter value.
                onChange={handleFilterChange} // Update Redux state on change.
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Search shoes..."
              />
            </div>

            {/* --- Price Range Input Fields --- */}
            <div className="w-full">
              <label className="text-base font-medium text-slate-900">
                Price Range
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="Min"
                  className="w-1/2 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="Max"
                  className="w-1/2 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* --- Size Filter Dropdown --- */}
            <div className="w-full">
              <label className="text-base font-medium text-slate-900">
                Size
              </label>
              <select
                name="size"
                value={filters.size}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Sizes</option>
                {["7", "8", "9", "10", "11"].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* --- Color Filter Dropdown --- */}
            <div className="w-full">
              <label className="text-base font-medium text-slate-900">
                Color
              </label>
              <select
                name="color"
                value={filters.color}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Colors</option>
                {["Black/White", "White/Black", "Red/Black", "Blue/White"].map(
                  (color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* --- Category Filter Dropdown --- */}
            <div className="w-full">
              <label className="text-base font-medium text-slate-900">
                Category
              </label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {["Running", "Casual", "Basketball", "Training"].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* --- Rating Filter Dropdown --- */}
            <div className="w-full">
              <label className="text-base font-medium text-slate-900">
                Rating
              </label>
              <select
                name="rating"
                value={filters.rating}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Ratings</option>
                <option value="4">4★ & above</option>
                <option value="3">3★ & above</option>
                <option value="2">2★ & above</option>
                <option value="1">1★ & above</option>
              </select>
            </div>
          </div>

          {/* --- Apply Filters Button --- */}
          {/* This button is fixed at the bottom of the filter panel */}
          <div className="absolute bottom-0 bg-white w-full px-5 py-2 grid items-center">
            <button
              type="button"
              onClick={() => {
                // Dispatch the current filters to update Redux state.
                dispatch(setFilters({ ...filters }));//
                // Then close the filter panel.
                onFilterToggle();
              }}
              className="button-theme bg-theme-cart text-white"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Filter;
