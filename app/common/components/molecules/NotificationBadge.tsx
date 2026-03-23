import { Bell } from 'lucide-react';
import { cn } from '@/app/common/lib/utils';

export interface NotificationBadgeProps {
  count: number;
  icon?: React.ReactNode;
  className?: string;
}

export function NotificationBadge({ count, icon, className }: NotificationBadgeProps) {
  const displayCount = count > 99 ? '99+' : count;
  return (
    <div className={cn('relative inline-flex', className)}>
      {icon ?? <Bell className="h-5 w-5 text-muted-foreground" />}
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
          {displayCount}
        </span>
      )}
    </div>
  );
}
