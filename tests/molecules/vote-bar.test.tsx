import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { VoteBar } from '@/app/common/components/molecules/VoteBar';

describe('VoteBar', () => {
  it('renders bar element', () => {
    const { container } = render(<VoteBar approvalCount={70} totalCount={100} />);
    const bar = container.querySelector('.bg-primary');
    expect(bar).toBeInTheDocument();
  });

  it('sets correct width percentage', () => {
    const { container } = render(<VoteBar approvalCount={70} totalCount={100} />);
    const bar = container.querySelector('.bg-primary') as HTMLElement;
    expect(bar.style.width).toBe('70%');
  });

  it('renders label when showLabel is true', () => {
    render(<VoteBar approvalCount={70} totalCount={100} showLabel />);
    expect(screen.getByText('70/100 (70%)')).toBeInTheDocument();
  });
});
