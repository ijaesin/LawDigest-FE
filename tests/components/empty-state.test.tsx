import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { EmptyState } from '@/app/common/components/EmptyState/EmptyState';

describe('EmptyState', () => {
  it('renders message', () => {
    render(<EmptyState message="아직 법안이 없습니다" />);
    expect(screen.getByText('아직 법안이 없습니다')).toBeInTheDocument();
  });

  it('renders CTA when provided', () => {
    render(<EmptyState message="비었습니다" ctaText="법안 보기" ctaHref="/bills" />);
    expect(screen.getByRole('link', { name: '법안 보기' })).toHaveAttribute('href', '/bills');
  });

  it('does not render CTA when not provided', () => {
    render(<EmptyState message="비었습니다" />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
