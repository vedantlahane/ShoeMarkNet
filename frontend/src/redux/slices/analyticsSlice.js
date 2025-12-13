import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks
export const trackFooterInteraction = createAsyncThunk(
  'analytics/trackFooterInteraction',
  async (interaction, { rejectWithValue }) => {
    try {
      // This would normally send analytics data
      return interaction;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    events: [],
    isTracking: true,
    error: null
  },
  reducers: {
    enableTracking: (state) => {
      state.isTracking = true;
    },
    disableTracking: (state) => {
      state.isTracking = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(trackFooterInteraction.fulfilled, (state, action) => {
        state.events.push(action.payload);
      })
      .addCase(trackFooterInteraction.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const { enableTracking, disableTracking } = analyticsSlice.actions;
export default analyticsSlice.reducer;
