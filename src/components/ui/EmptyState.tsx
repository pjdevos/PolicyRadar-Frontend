/**
 * Empty state components for better UX when no data is available
 */

import React from 'react';
import { Search, FileText, Database, AlertCircle, Wifi, RefreshCw } from 'lucide-react';
import './EmptyState.css';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  children?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  children,
  className = ''
}) => {
  return (
    <div className={`empty-state ${className}`}>
      {icon && (
        <div className="empty-state__icon">
          {icon}
        </div>
      )}
      
      <div className="empty-state__content">
        <h3 className="empty-state__title">{title}</h3>
        
        {description && (
          <p className="empty-state__description">{description}</p>
        )}
        
        {children && (
          <div className="empty-state__extra">
            {children}
          </div>
        )}
        
        {action && (
          <button
            onClick={action.onClick}
            className={`empty-state__action empty-state__action--${action.variant || 'primary'}`}
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};

// Specific empty state components

// No documents found
export const NoDocumentsFound: React.FC<{
  hasFilters?: boolean;
  onClearFilters?: () => void;
  onRefresh?: () => void;
}> = ({ hasFilters = false, onClearFilters, onRefresh }) => (
  <EmptyState
    icon={<FileText size={48} />}
    title={hasFilters ? "No documents match your filters" : "No documents found"}
    description={
      hasFilters
        ? "Try adjusting your search criteria or clearing filters to see more results."
        : "We couldn't find any policy documents at the moment. This might be temporary."
    }
    action={
      hasFilters && onClearFilters
        ? { label: "Clear Filters", onClick: onClearFilters, variant: "primary" }
        : onRefresh
        ? { label: "Refresh", onClick: onRefresh, variant: "secondary" }
        : undefined
    }
  />
);

// No search results
export const NoSearchResults: React.FC<{
  searchQuery: string;
  onClearSearch: () => void;
  suggestions?: string[];
}> = ({ searchQuery, onClearSearch, suggestions = [] }) => (
  <EmptyState
    icon={<Search size={48} />}
    title={`No results for "${searchQuery}"`}
    description="We couldn't find any documents matching your search. Try different keywords or check your spelling."
    action={{ label: "Clear Search", onClick: onClearSearch, variant: "primary" }}
  >
    {suggestions.length > 0 && (
      <div className="search-suggestions">
        <p className="search-suggestions__title">Try searching for:</p>
        <div className="search-suggestions__list">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="search-suggestions__item"
              onClick={() => {
                // You would implement this to update the search
                console.log('Search for:', suggestion);
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    )}
  </EmptyState>
);

// Connection error
export const ConnectionError: React.FC<{
  onRetry: () => void;
  isRetrying?: boolean;
}> = ({ onRetry, isRetrying = false }) => (
  <EmptyState
    icon={<Wifi size={48} />}
    title="Connection Error"
    description="Unable to connect to the server. Please check your internet connection and try again."
    action={{
      label: isRetrying ? "Retrying..." : "Retry",
      onClick: onRetry,
      variant: "primary"
    }}
  />
);

// Server error
export const ServerError: React.FC<{
  onRetry: () => void;
  error?: string;
}> = ({ onRetry, error }) => (
  <EmptyState
    icon={<AlertCircle size={48} />}
    title="Something went wrong"
    description={error || "We're experiencing technical difficulties. Please try again in a few moments."}
    action={{ label: "Try Again", onClick: onRetry, variant: "primary" }}
  />
);

// Loading failed
export const LoadingFailed: React.FC<{
  onRetry: () => void;
  resource?: string;
}> = ({ onRetry, resource = "data" }) => (
  <EmptyState
    icon={<RefreshCw size={48} />}
    title={`Failed to load ${resource}`}
    description="Something went wrong while loading. This is usually temporary."
    action={{ label: "Reload", onClick: onRetry, variant: "primary" }}
  />
);

// No data available
export const NoDataAvailable: React.FC<{
  resource?: string;
  onRefresh?: () => void;
}> = ({ resource = "data", onRefresh }) => (
  <EmptyState
    icon={<Database size={48} />}
    title={`No ${resource} available`}
    description={`There is currently no ${resource} to display. This might be because the data is still being processed or updated.`}
    action={
      onRefresh
        ? { label: "Refresh", onClick: onRefresh, variant: "secondary" }
        : undefined
    }
  />
);

// RAG chat empty state
export const RAGChatEmpty: React.FC = () => (
  <EmptyState
    icon={<Search size={48} />}
    title="Ask about EU policy documents"
    description="Use natural language to search and ask questions about policy documents. Try asking about specific topics, timelines, or document types."
  >
    <div className="rag-examples">
      <p className="rag-examples__title">Example questions:</p>
      <ul className="rag-examples__list">
        <li>"What are the latest EU climate policies?"</li>
        <li>"Show me regulations about digital markets"</li>
        <li>"What trade policies were published this month?"</li>
      </ul>
    </div>
  </EmptyState>
);

// Feature not available
export const FeatureNotAvailable: React.FC<{
  featureName: string;
  reason?: string;
}> = ({ featureName, reason }) => (
  <EmptyState
    icon={<AlertCircle size={48} />}
    title={`${featureName} not available`}
    description={reason || "This feature is currently unavailable. Please try again later."}
  />
);

export default EmptyState;