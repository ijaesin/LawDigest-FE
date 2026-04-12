import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { SearchModal } from '@/app/common/components/organisms';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('cookies-next', () => ({
  getCookie: () => null,
}));

vi.mock('@/app/common/store/search-modal', () => ({
  useSearchModalStore: (selector: (s: { show: boolean; close: () => void }) => unknown) =>
    selector({ show: true, close: vi.fn() }),
}));

vi.mock('@/app/search/services/queries', () => ({
  useGetRecentKeywords: () => ({ data: undefined }),
  useDeleteRecentKeyword: () => ({ mutate: vi.fn() }),
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('SearchModal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders when open', () => {
    renderWithProviders(<SearchModal />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders search bar', () => {
    renderWithProviders(<SearchModal />);
    expect(screen.getByRole('search')).toBeInTheDocument();
  });

  it('renders recent keywords section', () => {
    renderWithProviders(<SearchModal />);
    expect(screen.getByText('최근 검색어')).toBeInTheDocument();
  });

  it('renders empty state when no keywords', () => {
    renderWithProviders(<SearchModal />);
    expect(screen.getByText('최근 검색어가 존재하지 않습니다.')).toBeInTheDocument();
  });

  it('renders keyword chips from localStorage', () => {
    localStorage.setItem('recentKeywords', JSON.stringify(['국민건강보험법', '교육기본법']));
    renderWithProviders(<SearchModal />);
    expect(screen.getByText('국민건강보험법')).toBeInTheDocument();
    expect(screen.getByText('교육기본법')).toBeInTheDocument();
  });
});
