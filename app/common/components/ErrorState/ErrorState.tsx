import { AlertTriangle } from 'lucide-react';
import { GlassCard } from '@/app/common/components/ui/glass-card';
import { cn } from '@/app/common/lib/utils';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  return (
    <GlassCard className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <AlertTriangle className="mb-4 h-12 w-12 text-danger" />
      <p className="text-foreground">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover">
          다시 시도
        </button>
      )}
    </GlassCard>
  );
}
