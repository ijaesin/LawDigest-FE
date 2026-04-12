import { cn } from '@/app/common/lib/utils';

const sizeMap = { sm: 'h-1.5 w-1.5', md: 'h-2 w-2' } as const;

export interface StatusDotProps {
  active?: boolean;
  size?: keyof typeof sizeMap;
  className?: string;
}

export function StatusDot({ active = false, size = 'sm', className }: StatusDotProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-full bg-primary transition-opacity',
        sizeMap[size],
        !active && 'opacity-0',
        className,
      )}
      aria-hidden="true"
    />
  );
}
StatusDot.displayName = 'StatusDot';
