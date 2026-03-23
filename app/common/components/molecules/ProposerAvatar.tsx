import Link from 'next/link';
import { GlassAvatar } from '@/app/common/components/atoms';
import { cn } from '@/app/common/lib/utils';

export interface ProposerAvatarProps {
  name: string;
  imageUrl: string;
  partyName: string;
  congressmanId?: string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function ProposerAvatar({
  name,
  imageUrl,
  partyName,
  congressmanId,
  size = 'md',
  showLabel = true,
}: ProposerAvatarProps) {
  const avatar = (
    <div className={cn('flex items-center', showLabel ? 'gap-2' : '')}>
      <GlassAvatar size={size} src={imageUrl} fallback={name[0]} partyName={partyName} />
      {showLabel && (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">{name}</span>
          <span className="text-xs text-muted-foreground">{partyName}</span>
        </div>
      )}
    </div>
  );

  if (congressmanId) {
    return <Link href={`/congressman/${congressmanId}`}>{avatar}</Link>;
  }
  return avatar;
}
