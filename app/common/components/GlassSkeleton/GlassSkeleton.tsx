import { cn } from '@/app/common/lib/utils';

interface GlassSkeletonProps {
  lines?: number;
  variant?: 'line' | 'card';
  className?: string;
}

function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      data-skeleton
      className={cn('glass-subtle rounded-sm h-4 animate-[skeleton-pulse_1.5s_ease-in-out_infinite]', className)}
    />
  );
}

export function GlassSkeleton({ lines = 1, variant = 'line', className }: GlassSkeletonProps) {
  if (variant === 'card') {
    return (
      <div className={cn('glass-subtle rounded-md p-4 md:p-6 space-y-3', className)}>
        <SkeletonLine className="h-5 w-3/4" />
        <SkeletonLine className="h-4 w-full" />
        <SkeletonLine className="h-4 w-5/6" />
        <div data-skeleton-actions className="flex gap-2 pt-2">
          <SkeletonLine className="h-8 w-16 rounded-md" />
          <SkeletonLine className="h-8 w-16 rounded-md" />
          <SkeletonLine className="h-8 w-16 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <SkeletonLine key={i} className={i === lines - 1 ? 'w-3/4' : 'w-full'} />
      ))}
    </div>
  );
}
