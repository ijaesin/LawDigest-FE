import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GlassSeparator } from '@/app/common/components/atoms/Separator';

describe('GlassSeparator', () => {
  it('renders horizontal by default', () => {
    const { container } = render(<GlassSeparator />);
    const separator = container.firstChild as HTMLElement;
    expect(separator).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('renders vertical orientation', () => {
    const { container } = render(<GlassSeparator orientation="vertical" />);
    const separator = container.firstChild as HTMLElement;
    expect(separator).toHaveAttribute('data-orientation', 'vertical');
  });

  it('has bg-border class', () => {
    const { container } = render(<GlassSeparator />);
    const separator = container.firstChild as HTMLElement;
    expect(separator).toHaveClass('bg-border');
  });
});
