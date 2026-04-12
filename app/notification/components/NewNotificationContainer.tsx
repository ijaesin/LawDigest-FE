'use client';

import { AppLayout } from '@/app/common/components/templates';
import { NotificationList } from '@/app/common/components/organisms';
import { useSnackbarStore } from '@/app/common/store';
import { SNACKBAR_TYPE } from '@/app/common/constants';
import {
  useGetNotification,
  useGetNotificationCount,
  usePutNotificationRead,
  useDeleteNotification,
} from '@/app/notification/hooks';

export default function NewNotificationContainer() {
  const { data: notifications } = useGetNotification();
  const { data: notificationCount } = useGetNotificationCount();
  const setSnackbar = useSnackbarStore((s) => s.setSnackbar);
  const mutateRead = usePutNotificationRead();
  const mutateDelete = useDeleteNotification();

  const handleRead = (notificationId: number) => {
    mutateRead.mutate(notificationId);
    setSnackbar({
      show: true,
      type: SNACKBAR_TYPE.SUCCESS,
      message: '해당 알림을 읽었습니다.',
      duration: 3000,
    });
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

  return (
    <AppLayout>
      <section className="mt-6 px-5">
        {notificationCount?.notification_count != null && notificationCount.notification_count > 0 && (
          <p className="mb-4 text-sm text-muted-foreground md:text-base">
            <span className="text-foreground">{notificationCount.notification_count}개</span>의 읽지 않은 알림이
            있습니다.
          </p>
        )}
        <NotificationList notifications={notifications ?? []} onRead={handleRead} onDelete={handleDelete} />
      </section>
    </AppLayout>
  );
}
