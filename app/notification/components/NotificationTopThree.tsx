'use client';

import Link from 'next/link';
import { Button } from '@/app/common/components/ui/button';
import { Separator } from '@/app/common/components/ui/separator';
import { useSnackbarStore } from '@/app/common/store';
import { SNACKBAR_TYPE } from '@/app/common/constants';
import {
  useGetNotificationTopThree,
  usePutNotificationRead,
  useDeleteNotification,
  useGetNotificationCount,
} from '@/app/notification/hooks';
import NotificationItem from './NotificationItem';

export default function NotificationTopThree() {
  const { data: notifications, isLoading } = useGetNotificationTopThree();
  const { data: notificationCount } = useGetNotificationCount();
  const setSnackbar = useSnackbarStore((s) => s.setSnackbar);

  const mutateRead = usePutNotificationRead({
    onError: () => {
      setSnackbar({
        show: true,
        type: SNACKBAR_TYPE.ERROR,
        message: '알림 읽기에 실패했습니다.',
        duration: 3000,
      });
    },
  });

  const mutateDelete = useDeleteNotification({
    onError: () => {
      setSnackbar({
        show: true,
        type: SNACKBAR_TYPE.ERROR,
        message: '알림 삭제에 실패했습니다.',
        duration: 3000,
      });
    },
  });

  const handleRead = (notificationId: number) => {
    mutateRead.mutate(notificationId);
    setSnackbar({
      show: true,
      type: SNACKBAR_TYPE.SUCCESS,
      message: '해당 알림을 읽었습니다.',
      duration: 3000,
    });
  };

  const handleNavigateRead = (notificationId: number) => {
    mutateRead.mutate(notificationId);
  };

  const handleDelete = (notificationId: number) => {
    mutateDelete.mutate(notificationId);
    setSnackbar({
      show: true,
      type: SNACKBAR_TYPE.CANCEL,
      message: '해당 알림을 삭제했습니다.',
      duration: 3000,
    });
  };

  if (isLoading) return <p className="text-sm text-center text-muted-foreground">불러오는 중...</p>;

  return (
    <section className="flex flex-col gap-4 px-3 py-2 mx-5 mt-6 mb-10 rounded-3xl border shadow-2xl backdrop-blur-md bg-white/20 border-white/60 shadow-black/20">
      <h2 className="text-xl font-semibold">최근 알림</h2>
      <Separator />

      {notifications && notifications.length > 0 ? (
        <div className="flex flex-col gap-3 md:gap-4">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.notification_id}
              {...notification}
              onRead={handleRead}
              onNavigateRead={handleNavigateRead}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm md:text-base text-muted-foreground">최근 알림이 없습니다.</p>
      )}

      <div className="flex justify-between items-center">
        {notificationCount && (
          <p className="text-xs md:text-sm text-muted-foreground">
            <span className="text-foreground">{notificationCount.notification_count}개</span>의 읽지 않은 알림이
            있습니다.
          </p>
        )}
        <Button asChild variant="link" size="sm" className="text-xs md:text-sm">
          <Link href="/notification">알림 더 보기</Link>
        </Button>
      </div>
    </section>
  );
}
