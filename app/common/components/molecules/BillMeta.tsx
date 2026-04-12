import { GlassBadge } from '@/app/common/components/atoms';
import { getTimeRemaining } from '@/app/common/utils';

const stageVariantMap: Record<string, 'primary' | 'accent' | 'warning' | 'danger'> = {
  접수: 'primary',
  '위원회 심사': 'warning',
  '본회의 심의': 'warning',
  공포: 'accent',
  가결: 'accent',
  부결: 'danger',
  폐기: 'danger',
};

export interface BillMetaProps {
  stage: string;
  proposeDate: string;
}

export function BillMeta({ stage, proposeDate }: BillMetaProps) {
  const variant = stageVariantMap[stage] ?? 'glass';
  return (
    <div className="flex items-center justify-between">
      <GlassBadge variant={variant}>{stage}</GlassBadge>
      <span className="text-xs text-muted-foreground">{getTimeRemaining(proposeDate)}</span>
    </div>
  );
}
