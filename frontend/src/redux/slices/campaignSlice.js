import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../lib/apiClient';

// Async thunk to fetch active campaigns (public)
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

// Async thunk to fetch all campaigns (admin)
export const fetchCampaigns = createAsyncThunk(
    'campaign/fetchCampaigns',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/admin/campaigns');
            return response.data?.data || response.data || [];
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch campaigns');
        }
    }
);

// Create campaign
export const createCampaign = createAsyncThunk(
    'campaign/createCampaign',
    async (campaignData, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/admin/campaigns', campaignData);
            return response.data?.data || response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create campaign');
        }
    }
);

// Update campaign
export const updateCampaign = createAsyncThunk(
    'campaign/updateCampaign',
    async ({ id, campaignData }, { rejectWithValue }) => {
        try {
            const response = await apiClient.put(`/admin/campaigns/${id}`, campaignData);
            return response.data?.data || response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update campaign');
        }
    }
);

// Delete campaign
export const deleteCampaign = createAsyncThunk(
    'campaign/deleteCampaign',
    async (campaignId, { rejectWithValue }) => {
        try {
            await apiClient.delete(`/admin/campaigns/${campaignId}`);
            return campaignId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete campaign');
        }
    }
);

const initialState = {
    campaigns: [],
    activeCampaigns: [],
    isLoading: false,
    error: null,
    saving: false,
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
                state.activeCampaigns = action.payload?.data || action.payload || [];
            })
            .addCase(getActiveCampaigns.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch all campaigns
            .addCase(fetchCampaigns.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCampaigns.fulfilled, (state, action) => {
                state.isLoading = false;
                state.campaigns = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchCampaigns.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Create campaign
            .addCase(createCampaign.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(createCampaign.fulfilled, (state, action) => {
                state.saving = false;
                if (action.payload) {
                    state.campaigns.push(action.payload);
                }
            })
            .addCase(createCampaign.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            })
            // Update campaign
            .addCase(updateCampaign.fulfilled, (state, action) => {
                state.campaigns = state.campaigns.map((campaign) =>
                    campaign._id === action.payload._id ? action.payload : campaign
                );
            })
            .addCase(updateCampaign.rejected, (state, action) => {
                state.error = action.payload;
            })
            // Delete campaign
            .addCase(deleteCampaign.fulfilled, (state, action) => {
                state.campaigns = state.campaigns.filter((campaign) => campaign._id !== action.payload);
            })
            .addCase(deleteCampaign.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { clearCampaignError } = campaignSlice.actions;
export default campaignSlice.reducer;

