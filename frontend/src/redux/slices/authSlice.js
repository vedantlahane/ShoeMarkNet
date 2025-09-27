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

// Enhanced toast notifications
const showSuccessToast = (message, options = {}) => {
  toast.success(message, {
    position: "bottom-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
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
    ...options,
  });
};

const normalizeUser = (user, fallbackUser = {}) => {
  const base = { ...(fallbackUser || {}) };

  if (user && typeof user === "object") {
    Object.assign(base, user);
  }

  if (Object.keys(base).length === 0) {
    return null;
  }

  if (base._id && !base.id) {
    base.id = base._id;
  } else if (base.id && !base._id) {
    base._id = base.id;
  }

  return base;
};

const persistLastActivity = () => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("lastActivity", Date.now().toString());
    }
  } catch (error) {
    console.warn("Unable to persist lastActivity", error);
  }
};

// Enhanced login thunk
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    const loadingToast = toast.loading("🔐 Signing you in...");

    try {
      const response = await authService.login(
        credentials.email,
        credentials.password
      );

      let profileData = null;
      try {
        profileData = await authService.getProfile();
      } catch (profileError) {
        console.warn("Failed to fetch profile after login:", profileError);
      }

      const normalizedUser = normalizeUser(
        profileData?.user || profileData,
        response.user
      );

      persistLastActivity();

      showSuccessToast(
        `🎉 Welcome back, ${normalizedUser?.name || response.user?.name || "there"}!`
      );

      // Track login analytics
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "login", {
          method: "email",
          user_id: normalizedUser?._id || normalizedUser?.id,
        });
      }

      return {
        ...response,
        user: normalizedUser,
      };
    } catch (error) {
      const errorPayload = createErrorPayload(error, "Login failed");
      showErrorToast(`❌ ${errorPayload.message}`);

      // Track failed login
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "login_failed", {
          error_message: errorPayload.message,
        });
      }

      return rejectWithValue(errorPayload);
    } finally {
      toast.dismiss(loadingToast);
    }
  }
);

// Enhanced registration thunk
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    const loadingToast = toast.loading("🚀 Creating your account...");

    try {
      const response = await authService.register(userData);

      let profileData = null;
      try {
        profileData = await authService.getProfile();
      } catch (profileError) {
        console.warn("Failed to fetch profile after registration:", profileError);
      }

      const normalizedUser = normalizeUser(
        profileData?.user || profileData,
        response.user
      );

      persistLastActivity();

      showSuccessToast(
        `🎉 Welcome to ShoeMarkNet, ${normalizedUser?.name || response.user?.name || "there"}!`
      );

      // Show welcome series of toasts
      setTimeout(() => {
        showInfoToast(
          "💡 Tip: Complete your profile to get personalized recommendations!",
          { autoClose: 5000 }
        );
      }, 2000);

      // Track registration
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "sign_up", {
          method: "email",
          user_id: normalizedUser?._id || normalizedUser?.id,
        });
      }

      return {
        ...response,
        user: normalizedUser,
      };
    } catch (error) {
      const errorPayload = createErrorPayload(error, "Registration failed");
      showErrorToast(`❌ ${errorPayload.message}`);
      return rejectWithValue(errorPayload);
    } finally {
      toast.dismiss(loadingToast);
    }
  }
);

// Enhanced auth initialization
export const initAuth = createAsyncThunk(
  "auth/init",
  async (_, { rejectWithValue }) => {
    try {
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
          
          return { user: userData.user || userData, token, refreshToken };
        } catch (error) {
          // Try refresh token
          if (refreshToken) {
            try {
              const refreshData = await authService.refreshToken(refreshToken);
              const userData = await authService.getProfile();
              
              localStorage.setItem("lastActivity", Date.now().toString());
              showInfoToast("🔄 Session refreshed successfully");
              
              return { user: userData.user || userData, ...refreshData };
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
    } catch (error) {
      return rejectWithValue(
        createErrorPayload(error, "Initialization failed")
      );
    }
  }
);

// Enhanced profile update
export const updateUserProfile = createAsyncThunk(
  "auth/updateProfile",
  async (userData, { rejectWithValue }) => {
    try {
      const loadingToast = toast.loading("✨ Updating your profile...");

      const response = await userService.updateUserProfile(userData);

      toast.dismiss(loadingToast);
      showSuccessToast("✅ Profile updated successfully!");

      // Track profile update
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag("event", "profile_update", {
          user_id: response._id || response.user?._id,
        });
      }

      return response.user || response;
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

// Enhanced password change
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      const loadingToast = toast.loading("🔐 Updating your password...");

      const response = await userService.changePassword(passwordData);

      toast.dismiss(loadingToast);
      showSuccessToast("🔒 Password changed successfully!");
      showInfoToast(
        "💡 You'll be automatically signed out on other devices for security.",
        { autoClose: 5000 }
      );

      // Track password change
      if (typeof window !== 'undefined' && window.gtag) {
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

// Enhanced token refresh
export const refreshAuthToken = createAsyncThunk(
  "auth/refreshToken",
  async (refreshTokenValue, { rejectWithValue }) => {
    try {
      const token = refreshTokenValue || localStorage.getItem("refreshToken");
      if (!token) {
        throw new Error("No refresh token available");
      }

      const response = await authService.refreshToken(token);

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

// Admin functions
export const fetchUsers = createAsyncThunk(
  "auth/fetchUsers",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await userService.getAllUsers(filters);

      const userCount = Array.isArray(response)
        ? response.length
        : response.users?.length || 0;
      showInfoToast(`📊 Loaded ${userCount} users`);

      return Array.isArray(response) ? response : response.users || [];
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
      const loadingToast = toast.loading("⚡ Updating user...");

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
      const loadingToast = toast.loading("🗑️ Deleting user...");

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

export const bulkUpdateUsers = createAsyncThunk(
  "auth/bulkUpdateUsers",
  async ({ userIds, updates }, { rejectWithValue }) => {
    try {
      const loadingToast = toast.loading("🔄 Updating users...");

      const response = await userService.bulkUpdateUsers({ userIds, updates });

      toast.dismiss(loadingToast);
      showSuccessToast(
        `✅ ${response.modifiedCount} user(s) updated successfully!`
      );

      return response;
    } catch (error) {
      const errorPayload = createErrorPayload(error, "Failed to bulk update users");
      showErrorToast(`❌ ${errorPayload.message}`);
      return rejectWithValue(errorPayload);
    }
  }
);

export const exportUsers = createAsyncThunk(
  "auth/exportUsers",
  async ({ users, format = 'csv' }, { rejectWithValue }) => {
    try {
      const loadingToast = toast.loading("📊 Exporting users...");

      const exportData = await userService.exportUsers(users, format);

      toast.dismiss(loadingToast);
      showSuccessToast(`✅ Users exported successfully!`);

      return { data: exportData, format };
    } catch (error) {
      const errorPayload = createErrorPayload(error, "Failed to export users");
      showErrorToast(`❌ ${errorPayload.message}`);
      return rejectWithValue(errorPayload);
    }
  }
);

// Enhanced logout
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    try {
      await authService.logoutUser();
      
      // Clear all local storage
      localStorage.clear();
      
      showInfoToast("👋 You've been signed out successfully!");

      // Track logout
      if (typeof window !== 'undefined' && window.gtag) {
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

// Initial state
const initialState = {
  user: null,
  users: [],
  isAuthenticated: false,
  isLoading: false,
  
  // Specific loading states
  loginLoading: false,
  registerLoading: false,
  profileUpdateLoading: false,
  passwordChangeLoading: false,
  usersLoading: false,
  
  // Error management
  error: null,
  lastError: null,
  
  // Success flags
  profileUpdateSuccess: false,
  passwordChangeSuccess: false,
  profileUpdateTime: null,
  passwordChangeTime: null,
  
  // Session management
  sessionTimeout: null,
  lastActivity: null,
  
  // App state
  isInitialized: false,
  connectionStatus: "online",
  retryCount: 0,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.clear();
      return {
        ...initialState,
        isInitialized: true,
      };
    },
    
    clearError: (state) => {
      state.lastError = state.error;
      state.error = null;
    },
    
    clearAllErrors: (state) => {
      state.error = null;
      state.lastError = null;
    },
    
    clearSuccessFlags: (state) => {
      state.profileUpdateSuccess = false;
      state.passwordChangeSuccess = false;
      state.profileUpdateTime = null;
      state.passwordChangeTime = null;
    },
    
    updateLastActivity: (state) => {
      state.lastActivity = Date.now();
      if (typeof window !== 'undefined') {
        localStorage.setItem("lastActivity", state.lastActivity.toString());
      }
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
    
    setInitialized: (state) => {
      state.isInitialized = true;
    },
  },

  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loginLoading = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user || null;
        state.lastActivity = Date.now();
        state.retryCount = 0;
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginLoading = false;
        state.isLoading = false;
        state.error = action.payload;
        state.retryCount += 1;
      })

      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.registerLoading = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.registerLoading = false;
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user || null;
        state.lastActivity = Date.now();
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registerLoading = false;
        state.isLoading = false;
        state.error = action.payload;
      })

      // Init auth cases
      .addCase(initAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.lastActivity = Date.now();
        } else {
          state.isAuthenticated = false;
          state.user = null;
        }
        state.error = null;
      })
      .addCase(initAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
      })

      // Profile update cases
      .addCase(updateUserProfile.pending, (state) => {
        state.profileUpdateLoading = true;
        state.error = null;
        state.profileUpdateSuccess = false;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.profileUpdateLoading = false;
        state.user = action.payload;
        state.profileUpdateSuccess = true;
        state.profileUpdateTime = Date.now();
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.profileUpdateLoading = false;
        state.error = action.payload;
        state.profileUpdateSuccess = false;
      })

      // Password change cases
      .addCase(changePassword.pending, (state) => {
        state.passwordChangeLoading = true;
        state.error = null;
        state.passwordChangeSuccess = false;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.passwordChangeLoading = false;
        state.passwordChangeSuccess = true;
        state.passwordChangeTime = Date.now();
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.passwordChangeLoading = false;
        state.error = action.payload;
        state.passwordChangeSuccess = false;
      })

      // Admin user management cases
      .addCase(fetchUsers.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload;
      })

      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
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
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = state.users.filter((user) => user._id !== action.payload);
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(bulkUpdateUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(bulkUpdateUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        // Note: We don't update the local state here as the bulk update
        // might affect users not currently loaded. A refetch would be needed
        // to get the updated data, but we'll just clear error state.
        state.error = null;
      })
      .addCase(bulkUpdateUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(exportUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(exportUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(exportUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        return {
          ...initialState,
          isInitialized: true,
        };
      })

      // Refresh token cases
      .addCase(refreshAuthToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshAuthToken.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.lastActivity = Date.now();
        state.error = null;
      })
      .addCase(refreshAuthToken.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      });
  },
});

// Enhanced selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsInitialized = (state) => state.auth.isInitialized;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectLoginLoading = (state) => state.auth.loginLoading;
export const selectRegisterLoading = (state) => state.auth.registerLoading;
export const selectProfileUpdateLoading = (state) => state.auth.profileUpdateLoading;
export const selectPasswordChangeLoading = (state) => state.auth.passwordChangeLoading;
export const selectUsersLoading = (state) => state.auth.usersLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectUsers = (state) => state.auth.users;
export const selectUserRole = (state) => state.auth.user?.role || "user";
export const selectIsAdmin = (state) => state.auth.user?.role === "admin";

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
