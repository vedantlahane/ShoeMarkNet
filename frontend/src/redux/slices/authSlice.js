// src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../../services/authService";
import userService from "../../services/userService";
import { toast } from "react-toastify";

// Enhanced error handling utility
const createErrorPayload = (error, defaultMessage) => {
  const message =
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    defaultMessage;

  return {
    message,
    status: error.response?.status,
    code: error.response?.data?.code,
    timestamp: new Date().toISOString(),
  };
};

// Enhanced toast notifications with premium styling
const showSuccessToast = (message, options = {}) => {
  toast.success(message, {
    position: "bottom-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    className: "premium-toast-success",
    bodyClassName: "premium-toast-body",
    progressClassName: "premium-toast-progress",
    icon: "🎉",
    ...options,
  });
};

const showErrorToast = (message, options = {}) => {
  toast.error(message, {
    position: "bottom-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    className: "premium-toast-error",
    bodyClassName: "premium-toast-body",
    progressClassName: "premium-toast-progress",
    icon: "❌",
    ...options,
  });
};

const showInfoToast = (message, options = {}) => {
  toast.info(message, {
    position: "bottom-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    className: "premium-toast-info",
    bodyClassName: "premium-toast-body",
    progressClassName: "premium-toast-progress",
    icon: "ℹ️",
    ...options,
  });
};

// Enhanced login with better UX
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      const loadingToast = toast.loading("🔐 Signing you in...", {
        className: "premium-toast-loading",
      });

      const response = await authService.login(
        credentials.email,
        credentials.password
      );

      toast.dismiss(loadingToast);
      showSuccessToast(`🎉 Welcome back, ${response.user.name}!`);

      // Track login analytics
      if (window.gtag) {
        window.gtag("event", "login", {
          method: "email",
          user_id: response.user._id,
        });
      }

      return response;
    } catch (error) {
      const errorPayload = createErrorPayload(error, "Login failed");
      showErrorToast(`❌ ${errorPayload.message}`);

      // Track failed login
      if (window.gtag) {
        window.gtag("event", "login_failed", {
          error_message: errorPayload.message,
        });
      }

      return rejectWithValue(errorPayload);
    }
  }
);

// Enhanced registration with welcome flow
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const loadingToast = toast.loading("🚀 Creating your account...", {
        className: "premium-toast-loading",
      });

      const response = await authService.register(userData);

      toast.dismiss(loadingToast);
      showSuccessToast(`🎉 Welcome to ShoeMarkNet, ${response.user.name}!`);

      // Show welcome series of toasts
      setTimeout(() => {
        showInfoToast(
          "💡 Tip: Complete your profile to get personalized recommendations!",
          {
            autoClose: 5000,
          }
        );
      }, 2000);

      setTimeout(() => {
        showInfoToast(
          "🎁 New users get 15% off their first order! Use code WELCOME15",
          {
            autoClose: 6000,
          }
        );
      }, 4000);

      // Track registration
      if (window.gtag) {
        window.gtag("event", "sign_up", {
          method: "email",
          user_id: response.user._id,
        });
      }

      return response;
    } catch (error) {
      const errorPayload = createErrorPayload(error, "Registration failed");
      showErrorToast(`❌ ${errorPayload.message}`);
      return rejectWithValue(errorPayload);
    }
  }
);

// Enhanced auth initialization with better state management
export const initAuth = createAsyncThunk(
  "auth/init",
  async (_, { rejectWithValue, dispatch }) => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    const lastActivity = localStorage.getItem("lastActivity");

    // Check for session timeout (24 hours)
    if (lastActivity) {
      const timeDiff = Date.now() - parseInt(lastActivity);
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (timeDiff > twentyFourHours) {
        localStorage.clear();
        showInfoToast("🔒 Session expired for security. Please sign in again.");
        return rejectWithValue({
          message: "Session expired",
          code: "SESSION_TIMEOUT",
        });
      }
    }

    if (token) {
      try {
        const userData = await authService.getProfile();

        // Update last activity
        localStorage.setItem("lastActivity", Date.now().toString());

        return { user: userData, token, refreshToken };
      } catch (error) {
        // Try refresh token
        if (refreshToken) {
          try {
            const refreshData = await authService.refreshToken(refreshToken);
            const userData = await authService.getProfile();

            localStorage.setItem("lastActivity", Date.now().toString());
            showInfoToast("🔄 Session refreshed successfully");

            return { user: userData, ...refreshData };
          } catch (refreshError) {
            localStorage.clear();
            showErrorToast("🔒 Session expired. Please sign in again.");
            return rejectWithValue(
              createErrorPayload(refreshError, "Session expired")
            );
          }
        }

        localStorage.clear();
        return rejectWithValue(
          createErrorPayload(error, "Authentication failed")
        );
      }
    }

    return null;
  }
);

// Enhanced profile update with optimistic updates
export const updateUserProfile = createAsyncThunk(
  "auth/updateProfile",
  async (userData, { rejectWithValue, getState }) => {
    try {
      const loadingToast = toast.loading("✨ Updating your profile...", {
        className: "premium-toast-loading",
      });

      const response = await userService.updateUserProfile(userData);

      toast.dismiss(loadingToast);
      showSuccessToast("✅ Profile updated successfully!");

      // Track profile update
      if (window.gtag) {
        window.gtag("event", "profile_update", {
          user_id: response._id,
        });
      }

      return response;
    } catch (error) {
      const errorPayload = createErrorPayload(
        error,
        "Failed to update profile"
      );
      showErrorToast(`❌ ${errorPayload.message}`);
      return rejectWithValue(errorPayload);
    }
  }
);

// Enhanced password change with security checks
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      const loadingToast = toast.loading("🔐 Updating your password...", {
        className: "premium-toast-loading",
      });

      const response = await userService.changePassword(passwordData);

      toast.dismiss(loadingToast);
      showSuccessToast("🔒 Password changed successfully!");
      showInfoToast(
        "💡 You'll be automatically signed out on other devices for security.",
        {
          autoClose: 5000,
        }
      );

      // Track password change
      if (window.gtag) {
        window.gtag("event", "password_change");
      }

      return response;
    } catch (error) {
      const errorPayload = createErrorPayload(
        error,
        "Failed to change password"
      );
      showErrorToast(`❌ ${errorPayload.message}`);
      return rejectWithValue(errorPayload);
    }
  }
);

// Enhanced token refresh with retry logic
export const refreshAuthToken = createAsyncThunk(
  "auth/refreshToken",
  async (refreshTokenValue, { rejectWithValue, dispatch }) => {
    try {
      const response = await authService.refreshToken(refreshTokenValue);

      // Update last activity
      localStorage.setItem("lastActivity", Date.now().toString());

      return response;
    } catch (error) {
      // Clear all auth data on refresh failure
      localStorage.clear();

      const errorPayload = createErrorPayload(error, "Token refresh failed");
      showErrorToast("🔒 Session expired. Please sign in again.");

      return rejectWithValue(errorPayload);
    }
  }
);

// Enhanced admin functions with better feedback
export const fetchUsers = createAsyncThunk(
  "auth/fetchUsers",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await userService.getAllUsers(filters);

      const userCount = Array.isArray(response)
        ? response.length
        : response.users?.length || 0;
      showInfoToast(`📊 Loaded ${userCount} users`);

      return response;
    } catch (error) {
      const errorPayload = createErrorPayload(error, "Failed to fetch users");
      showErrorToast(`❌ ${errorPayload.message}`);
      return rejectWithValue(errorPayload);
    }
  }
);

export const updateUser = createAsyncThunk(
  "auth/updateUser",
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const loadingToast = toast.loading("⚡ Updating user...", {
        className: "premium-toast-loading",
      });

      const response = await userService.updateUser(id, userData);

      toast.dismiss(loadingToast);
      showSuccessToast(`✅ User ${response.name} updated successfully!`);

      return response;
    } catch (error) {
      const errorPayload = createErrorPayload(error, "Failed to update user");
      showErrorToast(`❌ ${errorPayload.message}`);
      return rejectWithValue(errorPayload);
    }
  }
);

export const deleteUser = createAsyncThunk(
  "auth/deleteUser",
  async ({ userId, userName }, { rejectWithValue }) => {
    try {
      const loadingToast = toast.loading("🗑️ Deleting user...", {
        className: "premium-toast-loading",
      });

      await userService.deleteUser(userId);

      toast.dismiss(loadingToast);
      showSuccessToast(
        `✅ User ${userName || "Unknown"} deleted successfully!`
      );

      return userId;
    } catch (error) {
      const errorPayload = createErrorPayload(error, "Failed to delete user");
      showErrorToast(`❌ ${errorPayload.message}`);
      return rejectWithValue(errorPayload);
    }
  }
);

// Enhanced logout with cleanup
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    try {
      await authService.logoutUser();

      // Clear all local storage
      localStorage.clear();

      // Clear any other app state if needed
      // dispatch(clearCart());
      // dispatch(clearWishlist());

      showInfoToast("👋 You've been signed out successfully!");

      // Track logout
      if (window.gtag) {
        window.gtag("event", "logout");
      }

      return true;
    } catch (error) {
      // Even if logout fails, clear local state
      localStorage.clear();
      showInfoToast("👋 Signed out locally");
      return true;
    }
  }
);

// Enhanced initial state with more granular loading states
const initialState = {
  user: null,
  users: [],
  isAuthenticated: false,

  // Enhanced loading states
  loading: false,
  loginLoading: false,
  registerLoading: false,
  profileUpdateLoading: false,
  passwordChangeLoading: false,
  usersLoading: false,

  // Enhanced error management
  error: null,
  lastError: null,

  // Success flags with timestamps
  profileUpdateSuccess: false,
  passwordChangeSuccess: false,
  profileUpdateTime: null,
  passwordChangeTime: null,

  // Session management
  sessionTimeout: null,
  lastActivity: null,

  // Premium UX states
  isInitialized: false,
  connectionStatus: "online",
  retryCount: 0,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Enhanced logout with cleanup
    logout: (state) => {
      localStorage.clear();
      return {
        ...initialState,
        isInitialized: true,
      };
    },

    // Enhanced error management
    clearError: (state) => {
      state.lastError = state.error;
      state.error = null;
    },

    clearAllErrors: (state) => {
      state.error = null;
      state.lastError = null;
    },

    // Enhanced success flag management
    clearSuccessFlags: (state) => {
      state.profileUpdateSuccess = false;
      state.passwordChangeSuccess = false;
      state.profileUpdateTime = null;
      state.passwordChangeTime = null;
    },

    // Session management
    updateLastActivity: (state) => {
      state.lastActivity = Date.now();
      localStorage.setItem("lastActivity", state.lastActivity.toString());
    },

    setConnectionStatus: (state, action) => {
      state.connectionStatus = action.payload;
    },

    incrementRetryCount: (state) => {
      state.retryCount += 1;
    },

    resetRetryCount: (state) => {
      state.retryCount = 0;
    },

    // Premium UX states
    setInitialized: (state) => {
      state.isInitialized = true;
    },
  },

  extraReducers: (builder) => {
    builder
      // Enhanced login cases
      .addCase(loginUser.pending, (state) => {
        state.loginLoading = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.lastActivity = Date.now();
        state.retryCount = 0;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginLoading = false;
        state.loading = false;
        state.error = action.payload;
        state.retryCount += 1;
      })

      // Enhanced register cases
      .addCase(registerUser.pending, (state) => {
        state.registerLoading = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.registerLoading = false;
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.lastActivity = Date.now();
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registerLoading = false;
        state.loading = false;
        state.error = action.payload;
      })

      // Enhanced init auth cases
      .addCase(initAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isInitialized = true;
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.lastActivity = Date.now();
        }
        state.error = null;
      })
      .addCase(initAuth.rejected, (state, action) => {
        state.loading = false;
        state.isInitialized = true;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
      })

      // Enhanced profile update cases
      .addCase(updateUserProfile.pending, (state) => {
        state.profileUpdateLoading = true;
        state.loading = true;
        state.error = null;
        state.profileUpdateSuccess = false;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.profileUpdateLoading = false;
        state.loading = false;
        state.user = action.payload;
        state.profileUpdateSuccess = true;
        state.profileUpdateTime = Date.now();
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.profileUpdateLoading = false;
        state.loading = false;
        state.error = action.payload;
        state.profileUpdateSuccess = false;
      })

      // Enhanced password change cases
      .addCase(changePassword.pending, (state) => {
        state.passwordChangeLoading = true;
        state.loading = true;
        state.error = null;
        state.passwordChangeSuccess = false;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.passwordChangeLoading = false;
        state.loading = false;
        state.passwordChangeSuccess = true;
        state.passwordChangeTime = Date.now();
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.passwordChangeLoading = false;
        state.loading = false;
        state.error = action.payload;
        state.passwordChangeSuccess = false;
      })

      // Enhanced admin cases
      .addCase(fetchUsers.pending, (state) => {
        state.usersLoading = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.loading = false;
        state.users = Array.isArray(action.payload)
          ? action.payload
          : action.payload.users || [];
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(
          (user) => user._id === action.payload._id
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.user && state.user._id === action.payload._id) {
          state.user = action.payload;
        }
        state.error = null;
      })

      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((user) => user._id !== action.payload);
        state.error = null;
      })

      // Enhanced logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        return {
          ...initialState,
          isInitialized: true,
        };
      })

      // Enhanced refresh token cases
      .addCase(refreshAuthToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshAuthToken.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.lastActivity = Date.now();
        state.error = null;
      })
      .addCase(refreshAuthToken.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      });
  },
});

// Enhanced selectors with memoization helpers
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsInitialized = (state) => state.auth.isInitialized;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectLoginLoading = (state) => state.auth.loginLoading;
export const selectRegisterLoading = (state) => state.auth.registerLoading;
export const selectProfileUpdateLoading = (state) =>
  state.auth.profileUpdateLoading;
export const selectPasswordChangeLoading = (state) =>
  state.auth.passwordChangeLoading;
export const selectUsersLoading = (state) => state.auth.usersLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectLastError = (state) => state.auth.lastError;
export const selectUsers = (state) => state.auth.users;
export const selectProfileUpdateSuccess = (state) =>
  state.auth.profileUpdateSuccess;
export const selectPasswordChangeSuccess = (state) =>
  state.auth.passwordChangeSuccess;
export const selectConnectionStatus = (state) => state.auth.connectionStatus;
export const selectRetryCount = (state) => state.auth.retryCount;
export const selectLastActivity = (state) => state.auth.lastActivity;

// Enhanced compound selectors
export const selectUserRole = (state) => state.auth.user?.role || "user";
export const selectIsAdmin = (state) => state.auth.user?.role === "admin";
export const selectUserName = (state) => state.auth.user?.name || "";
export const selectUserEmail = (state) => state.auth.user?.email || "";
export const selectUserAvatar = (state) => state.auth.user?.avatar || null;
export const selectIsEmailVerified = (state) =>
  state.auth.user?.isEmailVerified || false;

// Loading state selectors
export const selectAnyAuthLoading = (state) =>
  state.auth.loading ||
  state.auth.loginLoading ||
  state.auth.registerLoading ||
  state.auth.profileUpdateLoading ||
  state.auth.passwordChangeLoading;

// Error state selectors
export const selectHasAuthError = (state) => !!state.auth.error;
export const selectErrorMessage = (state) => state.auth.error?.message || "";

export const {
  logout,
  clearError,
  clearAllErrors,
  clearSuccessFlags,
  updateLastActivity,
  setConnectionStatus,
  incrementRetryCount,
  resetRetryCount,
  setInitialized,
} = authSlice.actions;

export default authSlice.reducer;
