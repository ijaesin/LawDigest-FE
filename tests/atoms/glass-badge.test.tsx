import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GlassBadge } from '@/app/common/components/atoms';

describe('GlassBadge', () => {
  it('renders children', () => {
    render(<GlassBadge>New</GlassBadge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('applies primary variant by default', () => {
    render(<GlassBadge>Primary</GlassBadge>);
    const badge = screen.getByText('Primary');
    expect(badge).toHaveClass('bg-primary-subtle');
    expect(badge).toHaveClass('text-primary');
  });

  it('applies warning variant', () => {
    render(<GlassBadge variant="warning">Warning</GlassBadge>);
    const badge = screen.getByText('Warning');
    expect(badge).toHaveClass('text-warning');
  });

  it('applies danger variant', () => {
    render(<GlassBadge variant="danger">Danger</GlassBadge>);
    const badge = screen.getByText('Danger');
    expect(badge).toHaveClass('text-danger');
  });

  it('applies glass variant', () => {
    render(<GlassBadge variant="glass">Glass</GlassBadge>);
    const badge = screen.getByText('Glass');
    expect(badge).toHaveClass('glass-subtle');
    expect(badge).toHaveClass('text-foreground');
  });

  it('merges custom className', () => {
    render(<GlassBadge className="mt-4">Custom</GlassBadge>);
    const badge = screen.getByText('Custom');
    expect(badge).toHaveClass('mt-4');
    expect(badge).toHaveClass('bg-primary-subtle');
  });
});
