import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ActionBar } from '@/app/common/components/molecules/ActionBar';

describe('ActionBar', () => {
  const defaultProps = {
    likeCount: 42,
    isBookmarked: false,
    onBookmark: vi.fn(),
    onShare: vi.fn(),
  };

  it('renders like count', () => {
    render(<ActionBar {...defaultProps} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders view count when provided', () => {
    render(<ActionBar {...defaultProps} viewCount={128} />);
    expect(screen.getByText('128')).toBeInTheDocument();
  });

  it('bookmark icon has fill-primary when bookmarked', () => {
    const { container } = render(<ActionBar {...defaultProps} isBookmarked />);
    const bookmarkSvg = container.querySelector('button[aria-label="북마크 해제"] svg');
    expect(bookmarkSvg).toHaveClass('fill-primary');
  });

  it('calls onBookmark on click', async () => {
    const onBookmark = vi.fn();
    render(<ActionBar {...defaultProps} onBookmark={onBookmark} />);
    await userEvent.click(screen.getByRole('button', { name: '북마크' }));
    expect(onBookmark).toHaveBeenCalledTimes(1);
  });

  it('calls onShare on click', async () => {
    const onShare = vi.fn();
    render(<ActionBar {...defaultProps} onShare={onShare} />);
    await userEvent.click(screen.getByRole('button', { name: '공유' }));
    expect(onShare).toHaveBeenCalledTimes(1);
  });
});
