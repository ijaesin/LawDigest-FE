import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FollowBoard from '@/app/congressman/components/FollowBoard';

vi.mock('@/app/auth/hooks', () => ({
  useAuthGuard: () => ({ requireLogin: () => true }),
}));

vi.mock('@/app/common/store', () => ({
  useSnackbarStore: () => vi.fn(),
}));

vi.mock('@/public/svgs', () => ({
  IconCheck: () => <span data-testid="icon-check" />,
  IconPlus: () => <span data-testid="icon-plus" />,
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('FollowBoard', () => {
  const defaultProps = {
    id: '1',
    likeChecked: false,
    follow_count: 100,
    represent_count: 5,
    public_count: 10,
  };

  it('팔로우 클릭 시 UI가 즉시 갱신된다', () => {
    render(<FollowBoard {...defaultProps} />, { wrapper: createWrapper() });

    const button = screen.getByRole('button', { name: /팔로우 하기/i });
    expect(button).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('101')).toBeInTheDocument();
  });

  it('시맨틱 마크업이 적용된다', () => {
    render(<FollowBoard {...defaultProps} />, { wrapper: createWrapper() });

    expect(screen.getByText('팔로워')).toBeInTheDocument();
    expect(screen.getByText('대표발의법안')).toBeInTheDocument();
    expect(screen.getByText('공동발의법안')).toBeInTheDocument();
  });

  it('초기 팔로우 상태가 true일 때 올바르게 렌더된다', () => {
    render(<FollowBoard {...defaultProps} likeChecked={true} />, { wrapper: createWrapper() });

    const button = screen.getByRole('button', { name: /팔로우 취소/i });
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('팔로우 취소 시 카운트가 감소한다', () => {
    render(<FollowBoard {...defaultProps} likeChecked={true} />, { wrapper: createWrapper() });

    const button = screen.getByRole('button', { name: /팔로우 취소/i });
    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('99')).toBeInTheDocument();
  });
});
