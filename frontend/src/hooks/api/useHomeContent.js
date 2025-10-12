import { useQuery } from '@tanstack/react-query';
import apiClient, { extractData } from '../../lib/apiClient';

const HOME_OVERVIEW_QUERY_KEY = ['home', 'overview'];

const normaliseResponse = (payload) => {
  if (!payload) return {};
  if (payload?.data) return payload.data;
  return payload;
};

const fetchHomeOverview = async () => {
  const response = await apiClient.get('/home/overview');
  return normaliseResponse(extractData(response));
};

const useHomeContent = (options = {}) =>
  useQuery({
    queryKey: HOME_OVERVIEW_QUERY_KEY,
    queryFn: fetchHomeOverview,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export default useHomeContent;
