import { QueryClient } from '@tanstack/react-query';

const defaultQueryOptions = {
  queries: {
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 3;
    },
    meta: {
      errorMessage: 'Something went wrong. Please try again.',
    },
  },
  mutations: {
    retry: 0,
  },
};

let queryClient;

export const getQueryClient = () => {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: defaultQueryOptions,
    });
  }
  return queryClient;
};

export default getQueryClient;
