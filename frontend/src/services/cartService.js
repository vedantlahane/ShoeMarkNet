// src/services/cartService.js
import api from '../utils/api';

const getCart = async () => {
  const response = await api.get('/cart');
  return response.data;
};

const addToCart = async (productId, quantity) => {
  const response = await api.post('/cart', { productId, quantity });
  return response.data;
};

const updateCartItem = async (itemId, quantity) => {
  const response = await api.put(`/cart/${itemId}`, { quantity });
  return response.data;
};

const removeFromCart = async (itemId) => {
  const response = await api.delete(`/cart/${itemId}`);
  return response.data;
};

const cartService = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
};

export default cartService;
