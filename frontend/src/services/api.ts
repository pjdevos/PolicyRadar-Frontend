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

const BASE_URL = '/api';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error: APIError = await response.json().catch(() => ({
          error: 'Network error',
          message: `HTTP ${response.status}: ${response.statusText}`
        }));
        throw new Error(error.message || error.error);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
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