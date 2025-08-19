import {
  DocumentsResponse,
  StatsResponse,
  RAGQueryRequest,
  RAGQueryResponse,
  TopicsResponse,
  SourcesResponse,
  DocumentsFilters,
  APIError
} from '../types/api';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8001/api';

// API Client with network resilience - retry logic and timeout handling

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries: number = 3
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;

    for (let attempt = 0; attempt <= retries; attempt++) {
      // Create timeout controller for each attempt
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
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
          const error: APIError = await response.json().catch(() => ({
            error: 'Network error',
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
        const isLastAttempt = attempt === retries;
        
        if (isRetriableError && !isLastAttempt) {
          console.warn(`Network error on attempt ${attempt + 1}, retrying...`, error.message);
          // Exponential backoff: wait 1s, then 2s, then 4s
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          continue;
        }
        
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('An unexpected error occurred');
      }
    }
    
    throw new Error('Max retries exceeded');
  }

  async getDocuments(filters: DocumentsFilters = {}): Promise<DocumentsResponse> {
    const params = new URLSearchParams();
    
    if (filters.topic && filters.topic !== 'all') {
      params.append('topic', filters.topic);
    }
    if (filters.source && filters.source !== 'all') {
      params.append('source', filters.source);
    }
    if (filters.doc_type && filters.doc_type !== 'all') {
      params.append('doc_type', filters.doc_type);
    }
    if (filters.days) {
      params.append('days', filters.days.toString());
    }
    if (filters.search) {
      params.append('search', filters.search);
    }
    if (filters.limit) {
      params.append('limit', filters.limit.toString());
    }
    if (filters.offset) {
      params.append('offset', filters.offset.toString());
    }

    const query = params.toString();
    const endpoint = `/documents${query ? `?${query}` : ''}`;
    
    return this.request<DocumentsResponse>(endpoint);
  }

  async getStats(): Promise<StatsResponse> {
    return this.request<StatsResponse>('/stats');
  }

  async queryRAG(request: RAGQueryRequest): Promise<RAGQueryResponse> {
    return this.request<RAGQueryResponse>('/rag/query', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getTopics(): Promise<TopicsResponse> {
    return this.request<TopicsResponse>('/topics');
  }

  async getSources(): Promise<SourcesResponse> {
    return this.request<SourcesResponse>('/sources');
  }
}

export const apiClient = new ApiClient();
export default apiClient;