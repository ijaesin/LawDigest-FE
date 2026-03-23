'use client';

import { GlassCard, GlassAvatar } from '@/app/common/components/atoms';
import { FollowButton, StatCard } from '@/app/common/components/molecules';
import type { CongressmanDetail } from '@/app/congressman/validation';

export interface CongressmanCardProps {
  congressman: CongressmanDetail;
  onFollow: (id: string) => void;
  variant?: 'full' | 'compact';
}

export function CongressmanCard({ congressman, onFollow, variant = 'full' }: CongressmanCardProps) {
  const { congressman_id, congressman_name, party_name, congressman_image_url, like_checked, follow_count } =
    congressman;

  if (variant === 'compact') {
    return (
      <GlassCard level="subtle" hover className="flex items-center gap-3">
        <GlassAvatar size="md" partyName={party_name} src={congressman_image_url} fallback={congressman_name?.[0]} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{congressman_name}</p>
          <p className="text-xs text-muted-foreground">{party_name}</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard level="medium" className="flex flex-col items-center gap-4 text-center">
      <GlassAvatar size="xl" partyName={party_name} src={congressman_image_url} fallback={congressman_name?.[0]} />
      <div>
        <h3 className="text-lg font-bold">{congressman_name}</h3>
        <p className="text-sm text-muted-foreground">{party_name}</p>
      </div>
      <div className="flex gap-4">
        <StatCard label="대표발의" value={congressman.represent_count} />
        <StatCard label="공동발의" value={congressman.public_count} />
      </div>
      <FollowButton isFollowing={like_checked} onToggle={() => onFollow(congressman_id)} count={follow_count} />
    </GlassCard>
  );
}
