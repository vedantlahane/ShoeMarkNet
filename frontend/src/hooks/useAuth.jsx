// src/hooks/useAuth.js
import { useState, useEffect, createContext } from 'react';
import api from '../utils/api';

// Create a context for profile version (keep this for components that need it)
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

// Global version counter for profile refreshes
let globalProfileVersion = 0;
const refreshGlobalProfile = () => {
  globalProfileVersion++;
  return globalProfileVersion;
};

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileVersion, setProfileVersion] = useState(globalProfileVersion);
  
  // Function to refresh profile that doesn't depend on context
  const refreshProfile = () => {
    const newVersion = refreshGlobalProfile();
    setProfileVersion(newVersion);
  };
  
  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }
        
        const response = await api.get('/auth/profile');
        setUser(response.data);
        setError(null);
      } catch (err) {
        setError(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [profileVersion]); // Re-fetch when profile version changes
  
  // Update user profile
  const updateUserProfile = async ({ id, userData }) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (err) {
      throw err;
    }
  };
  
  return {
    user,
    loading,
    error,
    updateUserProfile,
    refreshProfile
  };
};
