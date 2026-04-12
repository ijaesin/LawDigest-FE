import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ErrorState } from '@/app/common/components/ErrorState/ErrorState';

describe('ErrorState', () => {
  it('renders error message', () => {
    render(<ErrorState message="네트워크 오류가 발생했습니다" />);
    expect(screen.getByText('네트워크 오류가 발생했습니다')).toBeInTheDocument();
  });

  it('renders retry button and calls onRetry', async () => {
    const onRetry = vi.fn();
    render(<ErrorState message="오류" onRetry={onRetry} />);
    await userEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
