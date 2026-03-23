import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { BottomNav } from '@/app/common/components/organisms';

const mockOpen = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

vi.mock('@/app/common/store/search-modal', () => ({
  useSearchModalStore: (selector: (s: { open: () => void }) => unknown) => selector({ open: mockOpen }),
}));

describe('BottomNav', () => {
  it('renders nav items from siteConfig', () => {
    render(<BottomNav />);
    expect(screen.getByText('피드')).toBeInTheDocument();
    expect(screen.getByText('타임라인')).toBeInTheDocument();
    expect(screen.getByText('팔로잉')).toBeInTheDocument();
    expect(screen.getByText('마이페이지')).toBeInTheDocument();
  });

  it('renders search button', () => {
    render(<BottomNav />);
    expect(screen.getByRole('button', { name: /검색/ })).toBeInTheDocument();
  });

  it('calls openSearch when search button is clicked', async () => {
    render(<BottomNav />);
    await userEvent.click(screen.getByRole('button', { name: /검색/ }));
    expect(mockOpen).toHaveBeenCalled();
  });

  it('renders sliding indicator for active item', () => {
    const { container } = render(<BottomNav />);
    const indicator = container.querySelector('.glass-subtle');
    expect(indicator).toBeInTheDocument();
  });
});
