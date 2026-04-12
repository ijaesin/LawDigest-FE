import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Home } from 'lucide-react';
import { NavItem } from '@/app/common/components/molecules/NavItem';

describe('NavItem', () => {
  it('renders label text', () => {
    render(<NavItem icon={Home} label="Dashboard" href="/" />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders icon as svg', () => {
    const { container } = render(<NavItem icon={Home} label="Dashboard" href="/" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies active styles (bg-primary)', () => {
    render(<NavItem icon={Home} label="Dashboard" href="/" active />);
    const link = screen.getByRole('link');
    expect(link).toHaveClass('bg-primary');
  });

  it('hides label text in compact mode', () => {
    render(<NavItem icon={Home} label="Dashboard" href="/" compact />);
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('renders button (not link) when onClick is provided', async () => {
    const handleClick = vi.fn();
    render(<NavItem icon={Home} label="Dashboard" onClick={handleClick} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    await userEvent.click(button);
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
