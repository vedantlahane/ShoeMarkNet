// src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../../services/authService";
import userService from "../../services/userService";
import { toast } from 'react-toastify'; // Assuming you use react-toastify

// Create the loginUser async thunk
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      return await authService.login(credentials.email, credentials.password);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

// Initialize authentication state
export const initAuth = createAsyncThunk(
  "auth/init",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    
    if (token) {
      try {
        // Get the user profile with the stored token
        const userData = await authService.getProfile();
        return { user: userData, token, refreshToken };
      } catch (error) {
        // If token is invalid, try refresh token
        if (refreshToken) {
          try {
            const refreshData = await authService.refreshToken(refreshToken);
            // Get user profile with new token
            const userData = await authService.getProfile();
            return { user: userData, ...refreshData };
          } catch (refreshError) {
            // If refresh fails, clear tokens
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            return rejectWithValue(refreshError.response?.data?.message || "Session expired");
          }
        }
        // If no refresh token or refresh failed
        localStorage.removeItem("token");
        return rejectWithValue(error.response?.data?.message || "Authentication failed");
      }
    }
    return null;
  }
);

// Update user profile
export const updateUserProfile = createAsyncThunk(
  "auth/updateProfile",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await userService.updateUserProfile(userData);
      toast.success("Profile updated successfully");
      return response;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
      return rejectWithValue(error.response?.data?.message || "Failed to update profile");
    }
  }
);

// Change user password
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await userService.changePassword(passwordData);
      toast.success("Password changed successfully");
      return response;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
      return rejectWithValue(error.response?.data?.message || "Failed to change password");
    }
  }
);

// Register new user
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      return await authService.register(userData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Registration failed");
    }
  }
);

// Refresh authentication token
export const refreshAuthToken = createAsyncThunk(
  "auth/refreshToken",
  async (refreshTokenValue, { rejectWithValue }) => {
    try {
      return await authService.refreshToken(refreshTokenValue);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Token refresh failed");
    }
  }
);

// Admin: Fetch all users
export const fetchUsers = createAsyncThunk(
  "auth/fetchUsers",
  async (filters = {}, { rejectWithValue }) => {
    try {
      return await userService.getAllUsers(filters);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch users");
    }
  }
);

// Admin: Update user
export const updateUser = createAsyncThunk(
  "auth/updateUser",
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await userService.updateUser(id, userData);
      toast.success("User updated successfully");
      return response;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user");
      return rejectWithValue(error.response?.data?.message || "Failed to update user");
    }
  }
);

// Admin: Delete user
export const deleteUser = createAsyncThunk(
  "auth/deleteUser",
  async (userId, { rejectWithValue }) => {
    try {
      await userService.deleteUser(userId);
      toast.success("User deleted successfully");
      return userId;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
      return rejectWithValue(error.response?.data?.message || "Failed to delete user");
    }
  }
);

const initialState = {
  user: null,
  users: [],
  isAuthenticated: false,
  loading: false,
  error: null,
  profileUpdateSuccess: false,
  passwordChangeSuccess: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      authService.logoutUser();
      state.user = null;
      state.isAuthenticated = false;
      state.users = [];
      state.profileUpdateSuccess = false;
      state.passwordChangeSuccess = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessFlags: (state) => {
      state.profileUpdateSuccess = false;
      state.passwordChangeSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Init auth cases
      .addCase(initAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initAuth.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
        }
      })
      .addCase(initAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      
      // Update profile cases
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.profileUpdateSuccess = false;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.profileUpdateSuccess = true;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.profileUpdateSuccess = false;
      })
      
      // Change password cases
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.passwordChangeSuccess = false;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.passwordChangeSuccess = true;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.passwordChangeSuccess = false;
      })
      
      // Fetch users cases
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete user cases
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((user) => user._id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update user cases
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        // Update in users array
        const index = state.users.findIndex(
          (user) => user._id === action.payload._id
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        // Update current user if it's the same
        if (state.user && state.user._id === action.payload._id) {
          state.user = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Refresh token cases
      .addCase(refreshAuthToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshAuthToken.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = true;
      })
      .addCase(refreshAuthToken.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      });
  },
});

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectUsers = (state) => state.auth.users;
export const selectProfileUpdateSuccess = (state) => state.auth.profileUpdateSuccess;
export const selectPasswordChangeSuccess = (state) => state.auth.passwordChangeSuccess;

export const { logout, clearError, clearSuccessFlags } = authSlice.actions;
export default authSlice.reducer;


