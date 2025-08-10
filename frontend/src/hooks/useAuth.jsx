import { useState, useEffect, createContext, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { login, logout, register, updateProfile, refreshAuthToken } from '../redux/slices/authSlice';
import userService from '../services/userService';
import authService from '../services/authService';

// Create a context for profile version management
export const ProfileContext = createContext({
  profileVersion: 0,
  refreshProfile: () => {}
});

export const ProfileProvider = ({ children }) => {
  const [profileVersion, setProfileVersion] = useState(0);
  
  const refreshProfile = () => {
    setProfileVersion(currentVersion => currentVersion + 1);
  };
  
  return (
    <ProfileContext.Provider value={{ profileVersion, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

// Enhanced useAuth hook with Redux integration
export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading, error } = useSelector((state) => state.auth);
  const [localError, setLocalError] = useState(null);

  // Login function
  const loginUser = async (credentials) => {
    try {
      setLocalError(null);
      const result = await dispatch(login(credentials)).unwrap();
      return result;
    } catch (error) {
      setLocalError(error.message || 'Login failed');
      throw error;
    }
  };

  // Register function
  const registerUser = async (userData) => {
    try {
      setLocalError(null);
      const result = await dispatch(register(userData)).unwrap();
      return result;
    } catch (error) {
      setLocalError(error.message || 'Registration failed');
      throw error;
    }
  };

  // Logout function
  const logoutUser = () => {
    try {
      dispatch(logout());
      setLocalError(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Update user profile
  const updateUserProfile = async (userData) => {
    try {
      setLocalError(null);
      const result = await dispatch(updateProfile(userData)).unwrap();
      return result;
    } catch (error) {
      setLocalError(error.message || 'Profile update failed');
      throw error;
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      setLocalError(null);
      const response = await userService.changePassword(passwordData);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password change failed';
      setLocalError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Request password reset
  const requestPasswordReset = async (email) => {
    try {
      setLocalError(null);
      const response = await authService.requestPasswordReset(email);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password reset request failed';
      setLocalError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Reset password
  const resetPassword = async (token, password) => {
    try {
      setLocalError(null);
      const response = await authService.resetPassword(token, password);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password reset failed';
      setLocalError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Verify email
  const verifyEmail = async (token) => {
    try {
      setLocalError(null);
      const response = await authService.verifyEmail(token);
      // Refresh user data after email verification
      if (isAuthenticated) {
        dispatch(updateProfile({})); // This will refetch user data
      }
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Email verification failed';
      setLocalError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Refresh token
  const refreshToken = async () => {
    try {
      setLocalError(null);
      const result = await dispatch(refreshAuthToken()).unwrap();
      return result;
    } catch (error) {
      setLocalError(error.message || 'Token refresh failed');
      throw error;
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission);
  };

  // Clear local error
  const clearError = () => {
    setLocalError(null);
  };

  return {
    // User data
    user,
    isAuthenticated,
    isLoading,
    error: error || localError,

    // Auth actions
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
    updateUserProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
    refreshToken,

    // Utility functions
    hasRole,
    hasAnyRole,
    hasPermission,
    clearError,

    // User status checks
    isAdmin: hasRole('admin'),
    isModerator: hasRole('moderator'),
    isUser: hasRole('user'),
    isEmailVerified: user?.isEmailVerified || false,
  };
};

// Hook for using profile context
export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfileContext must be used within a ProfileProvider');
  }
  return context;
};

// Custom hook for address management
export const useUserAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch addresses
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getUserAddresses();
      setAddresses(response.addresses || response);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch addresses');
    } finally {
      setLoading(false);
    }
  };

  // Add address
  const addAddress = async (addressData) => {
    try {
      setError(null);
      const response = await userService.addUserAddress(addressData);
      await fetchAddresses(); // Refresh addresses
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add address';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Update address
  const updateAddress = async (addressId, addressData) => {
    try {
      setError(null);
      const response = await userService.updateUserAddress(addressId, addressData);
      await fetchAddresses(); // Refresh addresses
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update address';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Delete address
  const deleteAddress = async (addressId) => {
    try {
      setError(null);
      const response = await userService.deleteUserAddress(addressId);
      await fetchAddresses(); // Refresh addresses
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete address';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  return {
    addresses,
    loading,
    error,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    clearError: () => setError(null),
  };
};

export default useAuth;
