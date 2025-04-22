import api from "../utils/api";

// Login user
const login = async (email, password) => {
    const response = await api.post('/auth/login', {email, password});
    if(response.data.token){
        localStorage.setItem("token", response.data.token);
        if(response.data.refreshToken) {
            localStorage.setItem("refreshToken", response.data.refreshToken);
        }
    }
    return response.data;
};

// Register user
const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    if(response.data.token){
        localStorage.setItem("token", response.data.token);
        if(response.data.refreshToken) {
            localStorage.setItem("refreshToken", response.data.refreshToken);
        }
    }
    return response.data;
};

// Get user profile
const getProfile = async () => {
    const response = await api.get('/auth/profile');
    return response.data;
};

// Logout user
const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
};

// Refresh token
const refreshToken = async (refreshTokenValue) => {
    const response = await api.post('/auth/refresh-token', { refreshToken: refreshTokenValue });
    return response.data;
};
const getAllUsers = async () => {
    const response = await api.get('/admin/users');
    return response.data;
  };
// Create a single authService object with all methods
const authService = {
    login,
    register,
    getProfile,
    logoutUser,
    refreshToken,
    getAllUsers
};

export default authService;
