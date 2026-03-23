'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useSnackbarStore } from '@/app/common/store';
import { cn } from '@/app/common/lib/utils';

const typeStyles: Record<string, string> = {
  success: 'bg-accent/95 text-accent-foreground',
  error: 'bg-danger/95 text-danger-foreground',
  warning: 'bg-warning/95 text-warning-foreground',
  info: 'bg-primary/95 text-primary-foreground',
  cancel: 'glass-medium text-muted-foreground',
  default: 'glass-medium text-foreground',
};

export function Snackbar() {
  const show = useSnackbarStore((s) => s.show);
  const type = useSnackbarStore((s) => s.type);
  const message = useSnackbarStore((s) => s.message);
  const duration = useSnackbarStore((s) => s.duration);
  const action = useSnackbarStore((s) => s.action);
  const resetSnackbar = useSnackbarStore((s) => s.resetSnackbar);

  useEffect(() => {
    if (show && duration) {
      const timer = setTimeout(resetSnackbar, duration);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [show, duration, resetSnackbar]);

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-1/2 z-toast -translate-x-1/2 pointer-events-auto md:bottom-8" role="alert">
      <div
        className={cn(
          'flex items-center gap-3 rounded-md px-4 py-3 shadow-lg',
          typeStyles[type ?? 'default'] ?? typeStyles.default,
        )}>
        <span className="text-sm font-medium">{message}</span>
        {action && (
          <a href={action.href} className="text-sm font-semibold underline">
            {action.label}
          </a>
        )}
        <button type="button" onClick={resetSnackbar} className="ml-2" aria-label="닫기">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
