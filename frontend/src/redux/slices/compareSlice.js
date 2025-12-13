import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  maxItems: 4,
  preferences: {
    selectedAttributes: ['price', 'rating', 'brand', 'features'],
    showDifferencesOnly: false,
    compactView: false
  }
};

const compareSlice = createSlice({
  name: 'compare',
  initialState,
  reducers: {
    addToCompare: (state, action) => {
      const product = action.payload;
      const existingIndex = state.items.findIndex(item => item.id === product.id);
      
      if (existingIndex === -1 && state.items.length < state.maxItems) {
        state.items.push(product);
      }
    },
    
    removeFromCompare: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item.id !== productId);
    },
    
    clearCompare: (state) => {
      state.items = [];
    },
    
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    
    reorderCompareItems: (state, action) => {
      const { fromIndex, toIndex } = action.payload;
      const [movedItem] = state.items.splice(fromIndex, 1);
      state.items.splice(toIndex, 0, movedItem);
    }
  }
});

export const {
  addToCompare,
  removeFromCompare,
  clearCompare,
  updatePreferences,
  reorderCompareItems
} = compareSlice.actions;

export default compareSlice.reducer;
