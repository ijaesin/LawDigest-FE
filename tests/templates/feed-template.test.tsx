import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FeedTemplate } from '@/app/common/components/templates';

vi.mock('next/navigation', () => ({ usePathname: () => '/' }));
vi.mock('next-themes', () => ({ useTheme: () => ({ theme: 'light', setTheme: vi.fn() }) }));

describe('FeedTemplate', () => {
  it('renders children', () => {
    render(<FeedTemplate>Feed content</FeedTemplate>);
    expect(screen.getByText('Feed content')).toBeInTheDocument();
  });

  it('renders TabBar when tabs provided', () => {
    const tabs = [
      { label: 'All', value: 'all' },
      { label: 'Following', value: 'following' },
    ];
    render(
      <FeedTemplate tabs={tabs} activeTab="all" onTabChange={vi.fn()}>
        Content
      </FeedTemplate>,
    );
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Following')).toBeInTheDocument();
  });

  it('does not render TabBar when tabs not provided', () => {
    const { container } = render(<FeedTemplate>Content</FeedTemplate>);
    expect(container.querySelector('[role="tablist"]')).not.toBeInTheDocument();
  });
});
