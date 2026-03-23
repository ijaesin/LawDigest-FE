'use client';

import { Fragment, useMemo } from 'react';
import { Bell } from 'lucide-react';
import { getDateStatus } from '@/app/common/utils';
import { GlassCard, StatusDot, GlassSeparator } from '@/app/common/components/atoms';
import { EmptyState } from '@/app/common/components/molecules';
import { cn } from '@/app/common/lib/utils';
import type { Notification } from '@/app/notification/validation';

const DATE_SECTIONS = ['지난 한 주', '지난 한 달', '지난 알림'] as const;

export interface NotificationListProps {
  notifications: Notification[];
  onRead: (id: number) => void;
  onDelete: (id: number) => void;
}

export function NotificationList({ notifications, onRead, onDelete }: NotificationListProps) {
  const groupedNotifications = useMemo(
    () => DATE_SECTIONS.map((label) => notifications.filter((n) => getDateStatus(n.created_date) === label)),
    [notifications],
  );

  if (notifications.length === 0) {
    return <EmptyState message="알림이 없습니다" icon={<Bell className="h-12 w-12" />} />;
  }

  return (
    <div className="flex flex-col gap-4">
      {DATE_SECTIONS.map((label, idx) => {
        const items = groupedNotifications[idx];
        if (items.length === 0) return null;

        return (
          <Fragment key={label}>
            {idx > 0 && <GlassSeparator className="my-2" />}
            <section>
              <h2 className="mb-3 text-lg font-semibold">{label}</h2>
              <div className="flex flex-col gap-3">
                {items.map((notification) => (
                  <GlassCard
                    key={notification.notification_id}
                    level="subtle"
                    hover
                    className={cn('flex items-start gap-3', !notification.read && 'border-l-2 border-l-primary')}>
                    <StatusDot active={!notification.read} size="md" className="mt-2 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold md:text-base">{notification.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground md:text-sm">{notification.content}</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => onRead(notification.notification_id)}
                        className="text-xs text-muted-foreground hover:text-foreground">
                        읽음
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(notification.notification_id)}
                        className="text-xs text-danger hover:text-danger/80">
                        삭제
                      </button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </section>
          </Fragment>
        );
      })}
    </div>
  );
}
