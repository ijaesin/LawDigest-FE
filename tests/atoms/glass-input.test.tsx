import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { GlassInput } from '@/app/common/components/atoms';

describe('GlassInput', () => {
  it('renders input', () => {
    render(<GlassInput placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('has glass-subtle on wrapper', () => {
    const { container } = render(<GlassInput />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('glass-subtle');
  });

  it('renders icon', () => {
    render(<GlassInput icon={<span data-testid="icon">Icon</span>} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('handles onChange', async () => {
    const onChange = vi.fn();
    render(<GlassInput onChange={onChange} placeholder="Type here" />);
    await userEvent.type(screen.getByPlaceholderText('Type here'), 'hello');
    expect(onChange).toHaveBeenCalledTimes(5);
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<GlassInput ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
