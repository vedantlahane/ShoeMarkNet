import { useQuery } from '@tanstack/react-query';
import apiClient, { extractData } from '../../lib/apiClient';

const FEATURED_PRODUCTS_QUERY_KEY = ['products', 'featured'];

const normaliseProducts = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const fetchFeaturedProducts = async () => {
  const response = await apiClient.get('/products/featured');
  return normaliseProducts(extractData(response));
};

export const useFeaturedProducts = (options = {}) => {
  return useQuery({
    queryKey: FEATURED_PRODUCTS_QUERY_KEY,
    queryFn: fetchFeaturedProducts,
    placeholderData: options.placeholderData ?? [],
    select: (data) => normaliseProducts(data),
    ...options,
  });
};

export default useFeaturedProducts;
