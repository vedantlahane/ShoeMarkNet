// src/hooks/useAuth.js
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser, refreshToken, logout, clearError } from '../redux/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector(state => state.auth);

  const login = async (credentials) => {
    try {
      await dispatch(loginUser(credentials)).unwrap();
      return true;
    } catch (err) {
      return false;
    }
  };

  const register = async (userData) => {
    try {
      await dispatch(registerUser(userData)).unwrap();
      return true;
    } catch (err) {
      return false;
    }
  };

  const refresh = async (refreshTokenValue) => {
    try {
      await dispatch(refreshToken(refreshTokenValue)).unwrap();
      return true;
    } catch (err) {
      return false;
    }
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
    login,
    register,
    refresh,
    logout: logoutUser,
    clearError: clearAuthError
  };
};
