import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppLayout } from '@/app/common/components/Layout/AppLayout/AppLayout';

vi.mock('next/navigation', () => ({ usePathname: () => '/' }));
vi.mock('next-themes', () => ({ useTheme: () => ({ theme: 'light', setTheme: vi.fn() }) }));

describe('AppLayout', () => {
  it('renders main content', () => {
    render(<AppLayout>Main content</AppLayout>);
    expect(screen.getByText('Main content')).toBeInTheDocument();
  });

  it('renders SideNav', () => {
    render(<AppLayout>Content</AppLayout>);
    expect(screen.getAllByText('피드').length).toBeGreaterThanOrEqual(1);
  });

  it('renders right sidebar when provided', () => {
    render(<AppLayout rightSidebar={<div>Right sidebar</div>}>Content</AppLayout>);
    expect(screen.getByText('Right sidebar')).toBeInTheDocument();
  });

  it('renders mobile bottom nav', () => {
    render(<AppLayout>Content</AppLayout>);
    expect(document.querySelector('nav')).toBeInTheDocument();
  });
});
