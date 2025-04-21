// src/services/wishlistService.js
import api from '../utils/api';

const getWishlist = async () => {
  const response = await api.get('/wishlist');
  return response.data;
};

const addToWishlist = async (productId) => {
  const response = await api.post('/wishlist', { productId });
  return response.data;
};

const removeFromWishlist = async (productId) => {
  const response = await api.delete(`/wishlist/${productId}`);
  return response.data;
};

const wishlistService = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};

export default wishlistService;
