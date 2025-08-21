/**
 * TanStack Query hooks for type-safe API operations
 * Provides caching, loading states, error handling, and optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api-client';
import type {
  GetDocumentsParams,
  GetDocumentsResponse,
  GetStatsResponse,
  RAGQueryRequest,
  RAGQueryResponse,
  GetTopicsResponse,
  GetSourcesResponse,
  HealthResponse,
  ApiHealthResponse,
} from '../services/api-client';

// Query keys for consistent caching
export const queryKeys = {
  health: ['health'] as const,
  apiHealth: ['api', 'health'] as const,
  documents: (params: GetDocumentsParams = {}) => ['documents', params] as const,
  stats: ['stats'] as const,
  topics: ['topics'] as const,
  sources: ['sources'] as const,
  rag: (query: string) => ['rag', query] as const,
} as const;

// Health check hooks
export const useHealth = () => {
  return useQuery<HealthResponse, Error>({
    queryKey: queryKeys.health,
    queryFn: apiClient.health,
    staleTime: 30000, // 30 seconds
    retry: 2,
  });
};

export const useApiHealth = () => {
  return useQuery<ApiHealthResponse, Error>({
    queryKey: queryKeys.apiHealth,
    queryFn: apiClient.apiHealth,
    staleTime: 30000, // 30 seconds
    retry: 2,
  });
};

// Documents hook with advanced caching
export const useDocuments = (params: GetDocumentsParams = {}) => {
  return useQuery<GetDocumentsResponse, Error>({
    queryKey: queryKeys.documents(params),
    queryFn: () => apiClient.getDocuments(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx)
      if (error.message.includes('400') || error.message.includes('404')) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Stats hook
export const useStats = () => {
  return useQuery<GetStatsResponse, Error>({
    queryKey: queryKeys.stats,
    queryFn: apiClient.getStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Topics hook  
export const useTopics = () => {
  return useQuery<GetTopicsResponse, Error>({
    queryKey: queryKeys.topics,
    queryFn: apiClient.getTopics,
    staleTime: 10 * 60 * 1000, // 10 minutes (topics don't change often)
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
};

// Sources hook
export const useSources = () => {
  return useQuery<GetSourcesResponse, Error>({
    queryKey: queryKeys.sources,
    queryFn: apiClient.getSources,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
};

// RAG mutation hook for chat-like queries
export const useRAGQuery = () => {
  const queryClient = useQueryClient();

  return useMutation<RAGQueryResponse, Error, RAGQueryRequest>({
    mutationFn: apiClient.queryRAG,
    onSuccess: (data, variables) => {
      // Cache the RAG response for potential reuse
      queryClient.setQueryData(queryKeys.rag(variables.query), data);
    },
    onError: (error) => {
      console.error('RAG query failed:', error);
    },
  });
};

// Hook to prefetch documents (useful for optimization)
export const usePrefetchDocuments = () => {
  const queryClient = useQueryClient();

  return (params: GetDocumentsParams = {}) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.documents(params),
      queryFn: () => apiClient.getDocuments(params),
      staleTime: 5 * 60 * 1000,
    });
  };
};

// Hook for invalidating related queries (useful after mutations)
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();

  return {
    invalidateDocuments: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    invalidateStats: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
    invalidateTopics: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.topics });
    },
    invalidateSources: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sources });
    },
    invalidateAll: () => {
      queryClient.invalidateQueries();
    },
  };
};

// Composite hook for dashboard data
export const useDashboardData = (documentParams: GetDocumentsParams = {}) => {
  const documents = useDocuments(documentParams);
  const stats = useStats();
  const topics = useTopics();
  const sources = useSources();

  return {
    documents,
    stats,
    topics,
    sources,
    // Combined loading state
    isLoading: documents.isLoading || stats.isLoading || topics.isLoading || sources.isLoading,
    // Combined error state
    error: documents.error || stats.error || topics.error || sources.error,
    // All data loaded successfully
    isSuccess: documents.isSuccess && stats.isSuccess && topics.isSuccess && sources.isSuccess,
  };
};

// Hook for optimistic document filtering
export const useOptimisticDocuments = (params: GetDocumentsParams) => {
  const queryClient = useQueryClient();
  const query = useDocuments(params);

  const optimisticUpdate = (newParams: GetDocumentsParams) => {
    // Immediately show loading state for new parameters
    queryClient.setQueryData(queryKeys.documents(newParams), undefined);
    
    // Prefetch the new data
    queryClient.prefetchQuery({
      queryKey: queryKeys.documents(newParams),
      queryFn: () => apiClient.getDocuments(newParams),
    });
  };

  return {
    ...query,
    optimisticUpdate,
  };
};

// Error handling utilities
export const getErrorMessage = (error: Error | null): string => {
  if (!error) return '';
  
  // Handle specific API error patterns
  if (error.message.includes('Network error')) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }
  
  if (error.message.includes('404')) {
    return 'The requested resource was not found.';
  }
  
  if (error.message.includes('500')) {
    return 'Server error. Please try again later.';
  }
  
  if (error.message.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }
  
  return error.message || 'An unexpected error occurred';
};

// Loading state utilities
export const isAnyLoading = (...queries: Array<{ isLoading: boolean }>) => {
  return queries.some(query => query.isLoading);
};

export const areAllLoaded = (...queries: Array<{ isSuccess: boolean }>) => {
  return queries.every(query => query.isSuccess);
};