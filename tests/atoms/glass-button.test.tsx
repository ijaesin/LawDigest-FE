import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { GlassButton } from '@/app/common/components/atoms';

describe('GlassButton', () => {
  it('renders children', () => {
    render(<GlassButton>Click me</GlassButton>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('applies primary variant by default', () => {
    render(<GlassButton>Primary</GlassButton>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary');
  });

  it('applies glass variant', () => {
    render(<GlassButton variant="glass">Glass</GlassButton>);
    expect(screen.getByRole('button')).toHaveClass('glass-subtle');
  });

  it('applies danger variant', () => {
    render(<GlassButton variant="danger">Delete</GlassButton>);
    expect(screen.getByRole('button')).toHaveClass('bg-danger');
  });

  it('handles click events', async () => {
    const onClick = vi.fn();
    render(<GlassButton onClick={onClick}>Click</GlassButton>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('supports disabled state', () => {
    render(<GlassButton disabled>Disabled</GlassButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('supports asChild with Slot', () => {
    render(
      <GlassButton asChild>
        <a href="/test">Link Button</a>
      </GlassButton>,
    );
    expect(screen.getByRole('link', { name: 'Link Button' })).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<GlassButton ref={ref}>Ref</GlassButton>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('applies size variants', () => {
    const { rerender } = render(<GlassButton size="sm">Small</GlassButton>);
    expect(screen.getByRole('button')).toHaveClass('h-8');
    rerender(<GlassButton size="lg">Large</GlassButton>);
    expect(screen.getByRole('button')).toHaveClass('h-10');
  });
});
