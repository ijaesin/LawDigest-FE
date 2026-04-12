import { GlassCard } from '@/app/common/components/atoms';
import { cn } from '@/app/common/lib/utils';

const sizeClasses = {
  sm: { value: 'text-lg font-semibold', label: 'text-xs' },
  md: { value: 'text-2xl font-bold', label: 'text-sm' },
  lg: { value: 'text-[32px] font-bold', label: 'text-base' },
} as const;

export interface StatCardProps {
  value: number | string;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatCard({ value, label, size = 'md', className }: StatCardProps) {
  const s = sizeClasses[size];
  return (
    <GlassCard className={cn('text-center', className)}>
      <div className={s.value}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div className={cn(s.label, 'text-muted-foreground mt-1')}>{label}</div>
    </GlassCard>
  );
}
