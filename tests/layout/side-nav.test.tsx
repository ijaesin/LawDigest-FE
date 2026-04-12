import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SideNav } from '@/app/common/components/Layout/SideNav/SideNav';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light', setTheme: vi.fn() }),
}));

describe('SideNav', () => {
  it('renders navigation items', () => {
    render(<SideNav />);
    expect(screen.getByText('피드')).toBeInTheDocument();
    expect(screen.getByText('타임라인')).toBeInTheDocument();
    expect(screen.getByText('팔로잉')).toBeInTheDocument();
    expect(screen.getByText('마이페이지')).toBeInTheDocument();
  });

  it('renders logo', () => {
    render(<SideNav />);
    const logos = screen.getAllByAltText(/모두의입법/i);
    expect(logos.length).toBeGreaterThan(0);
  });

  it('renders theme toggle button', () => {
    render(<SideNav />);
    expect(screen.getByRole('button', { name: /테마/i })).toBeInTheDocument();
  });

  it('highlights active nav item', () => {
    render(<SideNav />);
    const homeLink = screen.getByText('피드').closest('a');
    expect(homeLink).toHaveAttribute('aria-current', 'page');
  });

  it('renders compact mode for tablet', () => {
    const { container } = render(<SideNav compact />);
    expect(container.querySelector('[data-compact]')).toBeInTheDocument();
  });
});
