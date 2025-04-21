import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    headers:{
        "Content-Type" : "application/json",
    }
});
// Set the base URL for all API requests.

//Request Interceptors: Runs before every API request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if(token){
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)// Forward any request errors
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if(error.response){
            console.error("API Error:", error.response.data.message || error.message);
        }else{
            console.error("Network Error:", error.message);
        }
        return Promise.reject(error);
    }
);

export default api;

// This code sets up an Axios instance for making API requests in a React application.
// It includes request and response interceptors for handling authentication tokens and logging errors.
// The base URL for the API is determined by environment variables, defaulting to localhost if not set.
// The request interceptor adds an authorization token to the headers if it exists in local storage.
// The response interceptor logs errors from the API or network errors.
