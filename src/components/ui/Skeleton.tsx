/**
 * Loading skeleton components for better UX during data fetching
 */

import React from 'react';
import './Skeleton.css';

export interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  variant = 'text',
  animation = 'pulse'
}) => {
  const style: React.CSSProperties = {
    width,
    height,
  };

  const classes = [
    'skeleton',
    `skeleton--${variant}`,
    `skeleton--${animation}`,
    className
  ].filter(Boolean).join(' ');

  return <div className={classes} style={style} />;
};

// Document card skeleton
export const DocumentCardSkeleton: React.FC = () => (
  <div className="document-card-skeleton">
    <div className="document-card-header">
      <Skeleton variant="text" width="60%" height="1.2em" />
      <Skeleton variant="text" width="30%" height="0.9em" />
    </div>
    <div className="document-card-content">
      <Skeleton variant="text" width="100%" height="0.9em" />
      <Skeleton variant="text" width="85%" height="0.9em" />
      <Skeleton variant="text" width="70%" height="0.9em" />
    </div>
    <div className="document-card-footer">
      <Skeleton variant="rectangular" width="60px" height="20px" />
      <Skeleton variant="rectangular" width="80px" height="20px" />
      <Skeleton variant="text" width="40%" height="0.8em" />
    </div>
  </div>
);

// Stats card skeleton
export const StatsCardSkeleton: React.FC = () => (
  <div className="stats-card-skeleton">
    <Skeleton variant="text" width="40%" height="1em" />
    <Skeleton variant="text" width="80%" height="2em" />
    <Skeleton variant="text" width="60%" height="0.9em" />
  </div>
);

// Filter dropdown skeleton
export const FilterSkeleton: React.FC = () => (
  <div className="filter-skeleton">
    <Skeleton variant="rectangular" width="120px" height="36px" />
  </div>
);

// Search input skeleton
export const SearchSkeleton: React.FC = () => (
  <div className="search-skeleton">
    <Skeleton variant="rectangular" width="300px" height="40px" />
  </div>
);

// RAG chat skeleton
export const RAGChatSkeleton: React.FC = () => (
  <div className="rag-chat-skeleton">
    <div className="rag-input-skeleton">
      <Skeleton variant="rectangular" width="100%" height="100px" />
      <Skeleton variant="rectangular" width="80px" height="36px" />
    </div>
    <div className="rag-response-skeleton">
      <Skeleton variant="text" width="100%" height="1em" />
      <Skeleton variant="text" width="95%" height="1em" />
      <Skeleton variant="text" width="88%" height="1em" />
      <Skeleton variant="text" width="92%" height="1em" />
    </div>
  </div>
);

// Table skeleton
export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ 
  rows = 5, 
  cols = 4 
}) => (
  <div className="table-skeleton">
    <div className="table-header-skeleton">
      {Array.from({ length: cols }).map((_, index) => (
        <Skeleton key={index} variant="text" width="100%" height="1.2em" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="table-row-skeleton">
        {Array.from({ length: cols }).map((_, colIndex) => (
          <Skeleton key={colIndex} variant="text" width="100%" height="1em" />
        ))}
      </div>
    ))}
  </div>
);

// Page skeleton for full page loading
export const PageSkeleton: React.FC = () => (
  <div className="page-skeleton">
    <div className="page-header-skeleton">
      <Skeleton variant="text" width="300px" height="2em" />
      <div className="page-actions-skeleton">
        <FilterSkeleton />
        <FilterSkeleton />
        <SearchSkeleton />
      </div>
    </div>
    <div className="page-content-skeleton">
      <div className="sidebar-skeleton">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>
      <div className="main-content-skeleton">
        {Array.from({ length: 6 }).map((_, index) => (
          <DocumentCardSkeleton key={index} />
        ))}
      </div>
    </div>
  </div>
);

export default Skeleton;