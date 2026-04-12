import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FeedList } from '@/app/common/components/organisms/FeedList';

// Mock hooks that require browser APIs
vi.mock('@/app/common/hooks/useIntersect', () => ({
  useIntersect: () => React.createRef(),
}));

vi.mock('@/app/common/hooks/usePullToRefresh', () => ({
  usePullToRefresh: () => ({
    pulling: false,
    refreshing: false,
    pullDistance: 0,
    handlers: {},
  }),
}));

describe('FeedList', () => {
  const defaultProps = {
    onLoadMore: vi.fn(),
    hasMore: false,
    isLoading: false,
  };

  it('renders children', () => {
    render(
      <FeedList {...defaultProps}>
        <div>Item 1</div>
        <div>Item 2</div>
      </FeedList>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('shows loading skeletons when isLoading is true', () => {
    render(
      <FeedList {...defaultProps} isLoading>
        <div>Item</div>
      </FeedList>,
    );
    const skeletons = document.querySelectorAll('[data-skeleton]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows empty state when no children', () => {
    render(<FeedList {...defaultProps}>{null}</FeedList>);
    expect(screen.getByText('콘텐츠가 없습니다')).toBeInTheDocument();
  });

  it('shows error state with retry', () => {
    const onRetry = vi.fn();
    render(
      <FeedList {...defaultProps} isError onRetry={onRetry}>
        {null}
      </FeedList>,
    );
    expect(screen.getByText('데이터를 불러오지 못했습니다')).toBeInTheDocument();
    expect(screen.getByText('다시 시도')).toBeInTheDocument();
  });
});
