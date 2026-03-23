'use client';

import { GlassCard, GlassAvatar } from '@/app/common/components/atoms';
import { FollowButton, StatCard } from '@/app/common/components/molecules';
import type { PartyDetail } from '@/app/party/validation';

export interface PartyCardProps {
  party: PartyDetail;
  onFollow: (id: number) => void;
  variant?: 'full' | 'compact';
}

export function PartyCard({ party, onFollow, variant = 'full' }: PartyCardProps) {
  const { party_id, party_name, party_img_url, followed, follow_count } = party;

  if (variant === 'compact') {
    return (
      <GlassCard level="subtle" hover className="flex items-center gap-3">
        <GlassAvatar size="md" partyName={party_name} src={party_img_url} fallback={party_name?.[0]} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{party_name}</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard level="medium" className="flex flex-col items-center gap-4 text-center">
      <GlassAvatar size="xl" partyName={party_name} src={party_img_url} fallback={party_name?.[0]} />
      <h3 className="text-lg font-bold">{party_name}</h3>
      <div className="flex gap-4">
        <StatCard label="소속 의원" value={party.total_congressman_count} />
        <StatCard label="대표발의" value={party.representative_bill_count} />
        <StatCard label="공동발의" value={party.public_bill_count} />
      </div>
      <FollowButton isFollowing={followed} onToggle={() => onFollow(party_id)} count={follow_count} />
    </GlassCard>
  );
}
