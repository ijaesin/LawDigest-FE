import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GlassSkeleton } from '@/app/common/components/GlassSkeleton/GlassSkeleton';

describe('GlassSkeleton', () => {
  it('renders a single skeleton line by default', () => {
    const { container } = render(<GlassSkeleton />);
    expect(container.querySelectorAll('[data-skeleton]')).toHaveLength(1);
  });

  it('renders multiple lines', () => {
    const { container } = render(<GlassSkeleton lines={3} />);
    expect(container.querySelectorAll('[data-skeleton]')).toHaveLength(3);
  });

  it('applies glass-subtle class', () => {
    const { container } = render(<GlassSkeleton />);
    const skeleton = container.querySelector('[data-skeleton]');
    expect(skeleton).toHaveClass('glass-subtle');
  });

  it('renders card variant with action bar', () => {
    const { container } = render(<GlassSkeleton variant="card" />);
    expect(container.querySelector('[data-skeleton-actions]')).toBeInTheDocument();
  });
});
