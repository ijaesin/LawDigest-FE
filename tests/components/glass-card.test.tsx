import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GlassCard } from '@/app/common/components/ui/glass-card';

describe('GlassCard', () => {
  it('renders children', () => {
    render(<GlassCard>Hello</GlassCard>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('applies subtle glass level by default', () => {
    const { container } = render(<GlassCard>Content</GlassCard>);
    expect(container.firstChild).toHaveClass('glass-subtle');
  });

  it('applies medium glass level', () => {
    const { container } = render(<GlassCard level="medium">Content</GlassCard>);
    expect(container.firstChild).toHaveClass('glass-medium');
  });

  it('applies heavy glass level', () => {
    const { container } = render(<GlassCard level="heavy">Content</GlassCard>);
    expect(container.firstChild).toHaveClass('glass-heavy');
  });

  it('supports hover effect', () => {
    const { container } = render(<GlassCard hover>Content</GlassCard>);
    expect(container.firstChild).toHaveClass('cursor-pointer');
  });

  it('merges custom className', () => {
    const { container } = render(<GlassCard className="custom">Content</GlassCard>);
    expect(container.firstChild).toHaveClass('custom');
    expect(container.firstChild).toHaveClass('glass-subtle');
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<GlassCard ref={ref}>Content</GlassCard>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});
