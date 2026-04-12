import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusDot } from '@/app/common/components/atoms/StatusDot';

describe('StatusDot', () => {
  it('is invisible when not active (opacity-0)', () => {
    const { container } = render(<StatusDot />);
    const dot = container.firstChild as HTMLElement;
    expect(dot).toHaveClass('opacity-0');
  });

  it('is visible with bg-primary when active', () => {
    const { container } = render(<StatusDot active />);
    const dot = container.firstChild as HTMLElement;
    expect(dot).toHaveClass('bg-primary');
    expect(dot).not.toHaveClass('opacity-0');
  });

  it('applies sm size by default (h-1.5 w-1.5)', () => {
    const { container } = render(<StatusDot />);
    const dot = container.firstChild as HTMLElement;
    expect(dot).toHaveClass('h-1.5', 'w-1.5');
  });

  it('applies md size (h-2 w-2)', () => {
    const { container } = render(<StatusDot size="md" />);
    const dot = container.firstChild as HTMLElement;
    expect(dot).toHaveClass('h-2', 'w-2');
  });
});
