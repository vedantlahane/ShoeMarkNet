import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../lib/apiClient';

// Async thunk to fetch active campaigns
export const getActiveCampaigns = createAsyncThunk(
    'campaign/getActiveCampaigns',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/campaigns/active');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch campaigns');
        }
    }
);

const initialState = {
    activeCampaigns: [],
    isLoading: false,
    error: null,
};

const campaignSlice = createSlice({
    name: 'campaign',
    initialState,
    reducers: {
        clearCampaignError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getActiveCampaigns.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getActiveCampaigns.fulfilled, (state, action) => {
                state.isLoading = false;
                state.activeCampaigns = action.payload.data.data;
            })
            .addCase(getActiveCampaigns.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearCampaignError } = campaignSlice.actions;
export default campaignSlice.reducer;
