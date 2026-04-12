import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TabBar } from '@/app/common/components/molecules/TabBar';

const tabs = [
  { label: 'All', value: 'all' },
  { label: 'Popular', value: 'popular' },
];

describe('TabBar', () => {
  it('renders all tab labels', () => {
    render(<TabBar tabs={tabs} activeValue="all" onChange={vi.fn()} />);
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Popular')).toBeInTheDocument();
  });

  it('marks active tab with aria-selected=true', () => {
    render(<TabBar tabs={tabs} activeValue="popular" onChange={vi.fn()} />);
    const popularTab = screen.getByText('Popular').closest('[role="tab"]');
    const allTab = screen.getByText('All').closest('[role="tab"]');
    expect(popularTab).toHaveAttribute('aria-selected', 'true');
    expect(allTab).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onChange with tab value on click', async () => {
    const handleChange = vi.fn();
    render(<TabBar tabs={tabs} activeValue="all" onChange={handleChange} />);
    await userEvent.click(screen.getByText('Popular'));
    expect(handleChange).toHaveBeenCalledWith('popular');
  });

  it('applies pill variant styles on active tab', () => {
    render(<TabBar tabs={tabs} activeValue="all" onChange={vi.fn()} variant="pill" />);
    const activeTab = screen.getByText('All').closest('[role="tab"]');
    expect(activeTab).toHaveClass('bg-primary');
  });

  it('applies underline variant styles on active tab', () => {
    render(<TabBar tabs={tabs} activeValue="all" onChange={vi.fn()} variant="underline" />);
    const activeTab = screen.getByText('All').closest('[role="tab"]');
    expect(activeTab).toHaveClass('border-b-2', 'border-primary');
  });
});
