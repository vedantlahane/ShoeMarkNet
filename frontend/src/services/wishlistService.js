// src/services/wishlistService.js
import api from '../utils/api';

const flattenWishlistItems = (items = []) => (
  items
    .map((entry) => {
      if (!entry) return null;

      // When the API returns { product, addedAt }
      if (entry.product && typeof entry.product === 'object') {
        return {
          ...entry.product,
          wishlistAddedAt: entry.addedAt ?? entry.product?.wishlistAddedAt ?? null,
        };
      }

      // Already flattened product shape
      return {
        ...entry,
        wishlistAddedAt: entry.wishlistAddedAt ?? entry.addedAt ?? null,
      };
    })
    .filter(Boolean)
);

const normalizeWishlistResponse = (data) => {
  if (!data) {
    return {
      products: [],
      pagination: null,
      productCount: 0,
      message: undefined,
    };
  }

  const rawItems = Array.isArray(data.products)
    ? data.products
    : Array.isArray(data.items)
      ? data.items
      : [];

  const products = flattenWishlistItems(rawItems);

  return {
    products,
    pagination: data.pagination ?? null,
    productCount: data.productCount ?? products.length,
    message: data.message,
  };
};

const buildQueryString = (page, limit, sort) => {
  const searchParams = new URLSearchParams();
  if (page) searchParams.set('page', page.toString());
  if (limit) searchParams.set('limit', limit.toString());
  if (sort) searchParams.set('sort', sort);
  return searchParams.toString();
};

const getWishlist = async (page = 1, limit = 20, sort = '-createdAt') => {
  try {
    const queryString = buildQueryString(page, limit, sort);
    const { data } = await api.get(queryString ? `/wishlist?${queryString}` : '/wishlist');
    return normalizeWishlistResponse(data);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }
};

const addToWishlist = async (productId) => {
  try {
    const { data } = await api.post('/wishlist', { productId });
    return normalizeWishlistResponse(data);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

const removeFromWishlist = async (productId) => {
  try {
    const { data } = await api.delete(`/wishlist/${productId}`);
    return normalizeWishlistResponse(data);
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};

const clearWishlist = async () => {
  try {
    const { data } = await api.delete('/wishlist');
    return data;
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    throw error;
  }
};

const checkProductInWishlist = async (productId) => {
  try {
    const { data } = await api.get(`/wishlist/check/${productId}`);
    return Boolean(data?.inWishlist);
  } catch (error) {
    console.error('Error checking product in wishlist:', error);
    throw error;
  }
};

const toggleWishlistItem = async (productId) => {
  try {
    const isInWishlist = await checkProductInWishlist(productId);
    return isInWishlist ? removeFromWishlist(productId) : addToWishlist(productId);
  } catch (error) {
    console.error('Error toggling wishlist item:', error);
    throw error;
  }
};

const getWishlistCount = async () => {
  try {
    const response = await getWishlist(1, 1);
    return response.productCount ?? (response.pagination?.total ?? 0);
  } catch (error) {
    console.error('Error getting wishlist count:', error);
    return 0;
  }
};

const wishlistService = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkProductInWishlist,
  toggleWishlistItem,
  getWishlistCount,
};

export default wishlistService;
