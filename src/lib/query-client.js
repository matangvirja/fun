import { QueryClient } from '@tanstack/react-query';

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't refetch when the user switches tabs — the data is fresh enough
      refetchOnWindowFocus: false,
      // Retry once on failure; avoids hammering Supabase on transient errors
      retry: 1,
      // Consider data fresh for 60 seconds — reduces redundant network requests
      staleTime: 60_000,
      // Keep unused (garbage-collected) cache entries for 5 minutes
      gcTime: 5 * 60_000,
    },
    mutations: {
      // Retry mutations once on failure (idempotent creates/updates are safe)
      retry: 0,
    },
  },
});