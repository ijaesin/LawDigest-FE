import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { KeywordChip } from '@/app/common/components/molecules/KeywordChip';

describe('KeywordChip', () => {
  const defaultProps = {
    keyword: '국민연금',
    onClick: vi.fn(),
    onRemove: vi.fn(),
  };

  it('renders keyword text', () => {
    render(<KeywordChip {...defaultProps} />);
    expect(screen.getByText('국민연금')).toBeInTheDocument();
  });

  it('calls onClick when chip is clicked', async () => {
    const onClick = vi.fn();
    render(<KeywordChip {...defaultProps} onClick={onClick} />);
    await userEvent.click(screen.getByText('국민연금'));
    expect(onClick).toHaveBeenCalledWith('국민연금');
  });

  it('calls onRemove on X button click and stops propagation', async () => {
    const onClick = vi.fn();
    const onRemove = vi.fn();
    render(<KeywordChip keyword="국민연금" onClick={onClick} onRemove={onRemove} />);
    await userEvent.click(screen.getByRole('button', { name: '국민연금 삭제' }));
    expect(onRemove).toHaveBeenCalledWith('국민연금');
    expect(onClick).not.toHaveBeenCalled();
  });
});
