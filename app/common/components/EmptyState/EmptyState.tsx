import Link from 'next/link';
import { Inbox } from 'lucide-react';
import { GlassCard } from '@/app/common/components/ui/glass-card';
import { cn } from '@/app/common/lib/utils';

interface EmptyStateProps {
  message: string;
  ctaText?: string;
  ctaHref?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({ message, ctaText, ctaHref, icon, className }: EmptyStateProps) {
  return (
    <GlassCard className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="mb-4 text-muted-foreground">{icon ?? <Inbox className="h-12 w-12" />}</div>
      <p className="text-muted-foreground">{message}</p>
      {ctaText && ctaHref && (
        <Link
          href={ctaHref}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover">
          {ctaText}
        </Link>
      )}
    </GlassCard>
  );
}
