import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BillMeta } from '@/app/common/components/molecules/BillMeta';

describe('BillMeta', () => {
  it('renders stage badge text', () => {
    render(<BillMeta stage="접수" proposeDate="2026-03-20T00:00:00" />);
    expect(screen.getByText('접수')).toBeInTheDocument();
  });

  it('renders time text', () => {
    render(<BillMeta stage="접수" proposeDate="2026-03-20T00:00:00" />);
    expect(screen.getByText(/전$/)).toBeInTheDocument();
  });

  it('maps "접수" to primary variant (bg-primary-subtle class)', () => {
    render(<BillMeta stage="접수" proposeDate="2026-03-20T00:00:00" />);
    const badge = screen.getByText('접수');
    expect(badge).toHaveClass('bg-primary-subtle');
  });
});
