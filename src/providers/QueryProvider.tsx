/**
 * TanStack Query provider setup with optimized defaults
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { features } from '../config';

// Create QueryClient with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time - how long data is considered fresh
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Cache time - how long to keep unused data in cache
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime in v4)
      
      // Retry configuration
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if ((error as any)?.message?.includes('400') || 
            (error as any)?.message?.includes('404') ||
            (error as any)?.message?.includes('401') ||
            (error as any)?.message?.includes('403')) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      
      // Retry delay with exponential backoff
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch configuration
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
      
      // Background refetch when data becomes stale
      refetchInterval: false, // Disable by default, enable per-query as needed
      
      // Better error boundary control
    },
    mutations: {
      // Mutation retry configuration
      retry: 1, // Only retry mutations once
      retryDelay: 1000,
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show devtools in development */}
      {features.debugMode && (
        <ReactQueryDevtools 
          initialIsOpen={false}
        />
      )}
    </QueryClientProvider>
  );
};

// Export QueryClient for imperative usage if needed
export { queryClient };

export default QueryProvider;