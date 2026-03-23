'use client';

import { GlassButton } from '@/app/common/components/atoms';

export interface FollowButtonProps {
  isFollowing: boolean;
  onToggle: () => void;
  count?: number;
  size?: 'sm' | 'md';
}

export function FollowButton({ isFollowing, onToggle, count, size = 'md' }: FollowButtonProps) {
  return (
    <GlassButton variant={isFollowing ? 'outline' : 'primary'} size={size} onClick={onToggle} className="rounded-full">
      {isFollowing ? '팔로잉 ✓' : '팔로우'}
      {count !== undefined && <span className="ml-1 text-muted-foreground">{count}</span>}
    </GlassButton>
  );
}
