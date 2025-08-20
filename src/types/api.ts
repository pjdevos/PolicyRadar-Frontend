export interface PolicyDocument {
  source: string;
  doc_type: string;
  id: string;
  title: string;
  summary: string;
  language: string;
  url: string;
  published: string;
  topics: string[];
  extra: Record<string, any>;
}

export interface DocumentsResponse {
  documents: PolicyDocument[];
  total: number;
}

export interface StatsResponse {
  total_documents: number;
  active_procedures: number;
  this_week: number;
  sources: Array<{
    name: string;
    count: number;
  }>;
  document_types: Array<{
    type: string;
    count: number;
  }>;
}

export interface RAGQueryRequest {
  query: string;
  context_documents?: string[];
}

export interface RAGQueryResponse {
  response: string;
  sources: Array<{
    id: string;
    title: string;
    relevance_score: number;
  }>;
}

export interface TopicsResponse {
  topics: Array<{
    name: string;
    count: number;
  }>;
}

export interface SourcesResponse {
  sources: Array<{
    name: string;
    count: number;
  }>;
}

export interface DocumentsFilters {
  topic?: string;
  source?: string;
  doc_type?: string;
  days?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface APIError {
  error: string;
  message?: string;
  details?: Record<string, any>;
}