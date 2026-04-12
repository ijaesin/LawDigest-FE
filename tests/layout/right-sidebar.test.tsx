import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RightSidebar } from '@/app/common/components/Layout/RightSidebar/RightSidebar';

describe('RightSidebar', () => {
  it('renders children', () => {
    render(<RightSidebar>Sidebar content</RightSidebar>);
    expect(screen.getByText('Sidebar content')).toBeInTheDocument();
  });

  it('is sticky', () => {
    const { container } = render(<RightSidebar>Content</RightSidebar>);
    expect(container.firstChild).toHaveClass('sticky');
  });
});
