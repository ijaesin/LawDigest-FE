import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Mail } from 'lucide-react';
import { NotificationBadge } from '@/app/common/components/molecules/NotificationBadge';

describe('NotificationBadge', () => {
  it('renders default Bell icon', () => {
    const { container } = render(<NotificationBadge count={0} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders custom icon when provided', () => {
    render(<NotificationBadge count={0} icon={<Mail data-testid="custom-icon" />} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('shows count badge when count > 0', () => {
    render(<NotificationBadge count={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('hides badge when count is 0', () => {
    const { container } = render(<NotificationBadge count={0} />);
    expect(container.querySelector('span')).not.toBeInTheDocument();
  });

  it('shows 99+ for count greater than 99', () => {
    render(<NotificationBadge count={150} />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });
});
