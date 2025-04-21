// src/hooks/useAuth.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  registerUser, 
  loginUser, 
  fetchUserProfile, 
  logout, 
  clearError 
} from '../redux/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error, token } = useSelector(
    (state) => state.auth
  );

  // Fetch user profile on mount if authenticated
  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(fetchUserProfile());
    }
  }, [isAuthenticated, user, dispatch]);

  const register = (userData) => {
    return dispatch(registerUser(userData));
  };

  const login = (email, password) => {
    return dispatch(loginUser({ email, password }));
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    token,
    register,
    login,
    logout: logoutUser,
    clearError: clearAuthError,
  };
};
