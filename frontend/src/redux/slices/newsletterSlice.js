import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks
export const subscribeNewsletter = createAsyncThunk(
  'newsletter/subscribe',
  async (email, { rejectWithValue }) => {
    try {
      // This would normally make an API call
      return { email, status: 'subscribed' };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const newsletterSlice = createSlice({
  name: 'newsletter',
  initialState: {
    isSubscribed: false,
    email: '',
    isLoading: false,
    error: null,
    message: ''
  },
  reducers: {
    clearMessage: (state) => {
      state.message = '';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(subscribeNewsletter.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(subscribeNewsletter.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSubscribed = true;
        state.email = action.payload.email;
        state.message = 'Successfully subscribed to newsletter!';
      })
      .addCase(subscribeNewsletter.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearMessage } = newsletterSlice.actions;
export default newsletterSlice.reducer;
