// src/services/wishlistService.js
import api from '../utils/api';

const getWishlist = async () => {
  const response = await api.get('/wishlist');
  // Check if response.data has an items property that is an array
  if (response.data && response.data.items && Array.isArray(response.data.items)) {
    return response.data.items;
  }
  // If response.data itself is an array, return it
  if (Array.isArray(response.data)) {
    return response.data;
  }
  // Default to empty array if neither condition is met
  return [];
};

const addToWishlist = async (productId) => {
  const response = await api.post('/wishlist', { productId });
  // Handle the same response structure possibilities
  if (response.data && response.data.items && Array.isArray(response.data.items)) {
    return response.data.items;
  }
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return [];
};

const removeFromWishlist = async (productId) => {
  const response = await api.delete(`/wishlist/${productId}`);
  // Handle the same response structure possibilities
  if (response.data && response.data.items && Array.isArray(response.data.items)) {
    return response.data.items;
  }
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return [];
};

const wishlistService = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};

export default wishlistService;
