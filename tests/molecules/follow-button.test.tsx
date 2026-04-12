import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FollowButton } from '@/app/common/components/molecules/FollowButton';

describe('FollowButton', () => {
  it('renders "팔로우" when not following', () => {
    render(<FollowButton isFollowing={false} onToggle={vi.fn()} />);
    expect(screen.getByRole('button', { name: /팔로우/ })).toBeInTheDocument();
    expect(screen.queryByText(/팔로잉/)).not.toBeInTheDocument();
  });

  it('renders "팔로잉 ✓" when following', () => {
    render(<FollowButton isFollowing onToggle={vi.fn()} />);
    expect(screen.getByText(/팔로잉 ✓/)).toBeInTheDocument();
  });

  it('calls onToggle when clicked', async () => {
    const onToggle = vi.fn();
    render(<FollowButton isFollowing={false} onToggle={onToggle} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('shows count when provided', () => {
    render(<FollowButton isFollowing={false} onToggle={vi.fn()} count={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });
});
