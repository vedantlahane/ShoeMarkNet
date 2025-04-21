import api from "../utils/api";

export const login = async (email, password) => {
    const response = api.post('/auth/login', {email, password});
    if(response.data.token){
        localStorage.setItem("token", response.data.token);
    }
    return response.data;
};

export const register = async (uiserData) => {
    const response = api.post('auth/register',uiserData);
    if(response.data.token){
        localStorage.setItem("token", response.data.token);
    }
    return response.data;
}

export const getPropile = async () => {
    const response = api.get('auth/profile');
    return response.data;
}

export const logout = () => {
    localStorage.removeItem("token");
}

