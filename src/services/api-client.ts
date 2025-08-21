/**
 * Type-safe API client using TanStack Query
 * Generated from OpenAPI schema with full TypeScript support
 */

import { api as apiConfig, configUtils } from '../config';
import type { paths } from '../types/api-generated';

// Extract types from generated schema
export type ApiPaths = paths;

// Document operations types
export type GetDocumentsParams = paths['/api/documents']['get']['parameters']['query'];

// Define response types manually since OpenAPI schema doesn't include them
export interface Document {
  doc_id: string;
  title: string;
  summary: string;
  content?: string;
  source: string;
  doc_type: string;
  published: string;
  url: string;
  topics: string[];
  language: string;
  extra?: Record<string, any>;
}

export interface GetDocumentsResponse {
  documents: Document[];
  total: number;
  filters_applied: {
    topic: string | null;
    source: string | null;
    doc_type: string | null;
    days: number;
    search: string | null;
    limit: number;
  };
  timestamp: string;
}

// Stats operations types  
export type GetStatsResponse = paths['/api/stats']['get']['responses']['200']['content']['application/json'];

// RAG operations types
export type RAGQueryRequest = paths['/api/rag/query']['post']['requestBody']['content']['application/json'];
export type RAGQueryResponse = paths['/api/rag/query']['post']['responses']['200']['content']['application/json'];

// Topics and Sources types
export interface GetTopicsResponse {
  topics: Array<{
    name: string;
    count: number;
  }>;
}

export interface GetSourcesResponse {
  sources: Array<{
    name: string;
    count: number;
  }>;
}

// Health check types
export type HealthResponse = paths['/api/health']['get']['responses']['200']['content']['application/json'];

// Ingest operations types (if needed)
export type IngestRequest = paths['/api/ingest']['post']['requestBody']['content']['application/json'];

// Error types
export interface ApiError {
  error: string;
  message?: string;
  details?: Record<string, any>;
}

// Generic fetch function with type safety
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retries?: number
): Promise<T> {
  const url = configUtils.getApiUrl(endpoint);
  const maxRetries = retries ?? apiConfig.retryAttempts;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeout);
    
    try {
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
        ...options,
      };
      
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // Handle specific error cases with user-friendly messages
        if (response.status === 502) {
          throw new Error(
            'Backend service is temporarily unavailable. This could be due to:\n' +
            '• Backend deployment in progress\n' + 
            '• Service maintenance\n' +
            '• Network connectivity issues\n\n' +
            'Please try again in a few moments.'
          );
        }
        
        if (response.status === 503 || response.status === 504) {
          throw new Error(
            'Backend service is currently overloaded or timing out. Please try again in a moment.'
          );
        }
        
        if (response.status >= 500) {
          throw new Error(
            'Backend server error occurred. The development team has been notified. Please try again later.'
          );
        }
        
        const error: ApiError = await response.json().catch(() => ({
          error: 'API request failed',
          message: `HTTP ${response.status}: ${response.statusText}`
        }));
        throw new Error(error.message || error.error);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      const isNetworkError = error instanceof TypeError && error.message.includes('fetch');
      const isAbortError = error instanceof Error && error.name === 'AbortError';
      const isRetriableError = isNetworkError || isAbortError;
      const isLastAttempt = attempt === maxRetries;
      
      if (isRetriableError && !isLastAttempt) {
        console.warn(`Network error on attempt ${attempt + 1}, retrying...`, (error as Error).message);
        await new Promise(resolve => setTimeout(resolve, apiConfig.retryDelay * Math.pow(2, attempt)));
        continue;
      }
      
      // Provide user-friendly error messages for network issues
      if (isNetworkError) {
        throw new Error(
          'Cannot connect to the backend service. This could be due to:\n' +
          '• No internet connection\n' +
          '• Backend service is offline\n' +
          '• Incorrect API URL configuration\n' +
          `• Firewall blocking access to ${apiConfig.baseUrl}\n\n` +
          'Please check your connection and try again.'
        );
      }
      
      if (isAbortError) {
        throw new Error(
          'Request timed out. The backend service may be slow or unavailable. Please try again.'
        );
      }
      
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while connecting to the backend service.');
    }
  }
  
  throw new Error(
    'All connection attempts failed. The backend service appears to be unavailable. ' +
    'Please try again later or contact support if the issue persists.'
  );
}

// API client functions with full type safety
export const apiClient = {
  // Health check
  health: (): Promise<HealthResponse> => 
    apiRequest<HealthResponse>('/health'),

  // Documents
  getDocuments: (params: GetDocumentsParams = {}): Promise<GetDocumentsResponse> => {
    const searchParams = new URLSearchParams();
    
    // Type-safe parameter building
    if (params.topic !== undefined && params.topic !== null) {
      searchParams.append('topic', params.topic);
    }
    if (params.source !== undefined && params.source !== null) {
      searchParams.append('source', params.source);
    }
    if (params.doc_type !== undefined && params.doc_type !== null) {
      searchParams.append('doc_type', params.doc_type);
    }
    if (params.days !== undefined && params.days !== null) {
      searchParams.append('days', params.days.toString());
    }
    if (params.search !== undefined && params.search !== null) {
      searchParams.append('search', params.search);
    }
    if (params.limit !== undefined && params.limit !== null) {
      searchParams.append('limit', params.limit.toString());
    }

    const query = searchParams.toString();
    const endpoint = `/documents${query ? `?${query}` : ''}`;
    
    return apiRequest<GetDocumentsResponse>(endpoint);
  },

  // Stats
  getStats: (): Promise<GetStatsResponse> =>
    apiRequest<GetStatsResponse>('/stats'),

  // RAG
  queryRAG: (request: RAGQueryRequest): Promise<RAGQueryResponse> =>
    apiRequest<RAGQueryResponse>('/rag/query', {
      method: 'POST',
      body: JSON.stringify(request),
    }),

  // Topics and Sources
  getTopics: (): Promise<GetTopicsResponse> =>
    apiRequest<GetTopicsResponse>('/topics'),
    
  getSources: (): Promise<GetSourcesResponse> =>
    apiRequest<GetSourcesResponse>('/sources'),

  // Ingest (admin operation)
  triggerIngest: (request: IngestRequest): Promise<any> =>
    apiRequest<any>('/ingest', {
      method: 'POST',
      body: JSON.stringify(request),
    }),
};

export default apiClient;