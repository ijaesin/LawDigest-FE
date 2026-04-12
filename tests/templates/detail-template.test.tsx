import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DetailTemplate } from '@/app/common/components/templates';

vi.mock('next/navigation', () => ({ usePathname: () => '/' }));
vi.mock('next-themes', () => ({ useTheme: () => ({ theme: 'light', setTheme: vi.fn() }) }));

describe('DetailTemplate', () => {
  it('renders hero', () => {
    render(
      <DetailTemplate hero={<div>Hero section</div>}>
        <div>Detail content</div>
      </DetailTemplate>,
    );
    expect(screen.getByText('Hero section')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <DetailTemplate hero={<div>Hero</div>}>
        <div>Detail content</div>
      </DetailTemplate>,
    );
    expect(screen.getByText('Detail content')).toBeInTheDocument();
  });

  it('renders separator between hero and children', () => {
    const { container } = render(
      <DetailTemplate hero={<div>Hero</div>}>
        <div>Content</div>
      </DetailTemplate>,
    );
    const separator = container.querySelector('[data-orientation="horizontal"]');
    expect(separator).toBeInTheDocument();
  });
});
