import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AuthTemplate } from '@/app/common/components/templates';

describe('AuthTemplate', () => {
  it('renders children centered', () => {
    render(
      <AuthTemplate>
        <div>Login form</div>
      </AuthTemplate>,
    );
    expect(screen.getByText('Login form')).toBeInTheDocument();
  });

  it('has centered layout classes', () => {
    const { container } = render(
      <AuthTemplate>
        <div>Content</div>
      </AuthTemplate>,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toContain('items-center');
    expect(wrapper.className).toContain('justify-center');
    expect(wrapper.className).toContain('min-h-screen');
  });
});
