'use client';

import React, { Children } from 'react';
import { Loader2 } from 'lucide-react';
import { useIntersect } from '@/app/common/hooks';
import { usePullToRefresh } from '@/app/common/hooks/usePullToRefresh';
import { GlassSkeleton } from '@/app/common/components/atoms';
import { EmptyState, ErrorState } from '@/app/common/components/molecules';
import { cn } from '@/app/common/lib/utils';

export interface FeedListProps {
  children: React.ReactNode;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onRefresh?: () => Promise<void>;
  emptyMessage?: string;
}

export function FeedList({
  children,
  onLoadMore,
  hasMore,
  isLoading,
  isError,
  onRetry,
  onRefresh,
  emptyMessage = '콘텐츠가 없습니다',
}: FeedListProps) {
  const fetchRef = useIntersect(() => {
    if (hasMore && !isLoading) onLoadMore();
  });

  const { pulling, refreshing, pullDistance, handlers } = usePullToRefresh({
    onRefresh: onRefresh ?? (() => {}),
  });

  const isEmpty = !isLoading && !isError && !Children.count(children);

  if (isError && onRetry) {
    return <ErrorState message="데이터를 불러오지 못했습니다" onRetry={onRetry} />;
  }

  if (isEmpty) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div {...(onRefresh ? handlers : {})} className="relative">
      {/* Pull-to-refresh indicator */}
      {pulling && (
        <div className="flex justify-center py-2" style={{ height: `${pullDistance}px` }}>
          <Loader2 className={cn('h-5 w-5 text-primary', refreshing && 'animate-spin')} />
        </div>
      )}

      {/* Feed items with stagger animation */}
      <div className="flex flex-col gap-3">
        {Children.map(children, (child, index) => (
          <div className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
            {child}
          </div>
        ))}
      </div>

      {/* Loading more */}
      {isLoading && (
        <div className="mt-4 space-y-3">
          <GlassSkeleton variant="card" />
          <GlassSkeleton variant="card" />
        </div>
      )}

      {/* Intersection observer trigger */}
      {hasMore && <div ref={fetchRef} className="h-1" />}
    </div>
  );
}
