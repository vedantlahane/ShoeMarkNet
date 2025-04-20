// Import the Redux Toolkit function to configure the store.
import { configureStore } from "@reduxjs/toolkit";
// Import our cart slice reducer.
import CartSlice from "./CartSlice.jsx";
// Import our filter slice reducer (for additional functionality).
import FilterSlice from "./FilterSlice.jsx";  // Import FilterSlice

// Create a Redux store with two slices: cart and filter.
// This store holds the entire application state.
const Store = configureStore({
    reducer: {
        cart: CartSlice,       // All cart-related state and actions will live here.
        filter: FilterSlice    // All filter-related state and actions will live here.
    }
});

export default Store;
