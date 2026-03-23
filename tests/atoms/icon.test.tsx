import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Heart } from 'lucide-react';
import { Icon } from '@/app/common/components/atoms/Icon';

describe('Icon', () => {
  it('renders svg element', () => {
    const { container } = render(<Icon icon={Heart} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies md size by default (h-5 w-5)', () => {
    const { container } = render(<Icon icon={Heart} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('h-5', 'w-5');
  });

  it('applies sm size (h-4 w-4)', () => {
    const { container } = render(<Icon icon={Heart} size="sm" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('h-4', 'w-4');
  });

  it('applies lg size (h-6 w-6)', () => {
    const { container } = render(<Icon icon={Heart} size="lg" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('h-6', 'w-6');
  });

  it('applies custom className', () => {
    const { container } = render(<Icon icon={Heart} className="text-red-500" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('text-red-500');
  });
});
