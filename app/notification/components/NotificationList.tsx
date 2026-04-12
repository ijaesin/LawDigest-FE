'use client';

import { Fragment, useMemo } from 'react';
import { getDateStatus } from '@/app/common/utils';
import { Separator } from '@/app/common/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/common/components/ui/dropdown-menu';
import { Button } from '@/app/common/components/ui/button';
import { IconKebab } from '@/public/svgs';
import { useSnackbarStore } from '@/app/common/store';
import { SNACKBAR_TYPE } from '@/app/common/constants';
import {
  useGetNotificationCount,
  useGetNotification,
  usePutNotificationRead,
  usePutNotificationReadAll,
  useDeleteNotification,
  useDeleteNotificationAll,
} from '@/app/notification/hooks';
import NotificationItem from './NotificationItem';

const DATE_SECTIONS = ['지난 한 주', '지난 한 달', '지난 알림'] as const;

export default function NotificationList() {
  const { data: notificationCount } = useGetNotificationCount();
  const { data: notifications } = useGetNotification();
  const setSnackbar = useSnackbarStore((s) => s.setSnackbar);
  const mutateRead = usePutNotificationRead();
  const mutateDelete = useDeleteNotification();
  const mutateReadAll = usePutNotificationReadAll();
  const mutateDeleteAll = useDeleteNotificationAll();

  const groupedNotifications = useMemo(
    () => DATE_SECTIONS.map((label) => (notifications ?? []).filter((n) => getDateStatus(n.created_date) === label)),
    [notifications],
  );

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

  const handleReadAll = () => {
    mutateReadAll.mutate();
    setSnackbar({
      show: true,
      type: SNACKBAR_TYPE.SUCCESS,
      message: '알림을 모두 읽었습니다.',
      duration: 3000,
    });
  };

  const handleDeleteAll = () => {
    mutateDeleteAll.mutate();
    setSnackbar({
      show: true,
      type: SNACKBAR_TYPE.CANCEL,
      message: '알림을 모두 삭제했습니다.',
      duration: 3000,
    });
  };

  return (
    <section className="flex flex-col px-5 mt-6 mb-10">
      <div className="mb-[18px] ml-3">
        <div className="flex justify-between items-center">
          {notificationCount?.notification_count === 0 ? (
            <p className="text-sm md:text-base text-muted-foreground">알림이 없습니다.</p>
          ) : (
            <p className="text-sm md:text-base text-muted-foreground">
              <span className="text-foreground">{notificationCount?.notification_count}개</span>의 읽지 않은 알림이
              있습니다.
            </p>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <IconKebab isPassed />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleReadAll}>모두 읽음 표시</DropdownMenuItem>
              <DropdownMenuItem onClick={handleDeleteAll}>모두 삭제</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <section className="flex flex-col gap-[14px]">
        {DATE_SECTIONS.map((label, idx) => (
          <Fragment key={label}>
            {idx > 0 && <Separator className="my-6" />}
            <h2 className="text-xl font-semibold">{label}</h2>
            <div className="flex flex-col gap-3 md:gap-4">
              {notifications &&
                (groupedNotifications[idx].length === 0 ? (
                  <p className="text-sm md:text-base text-muted-foreground">{label} 알림이 없습니다.</p>
                ) : (
                  groupedNotifications[idx].map((notification) => (
                    <NotificationItem
                      key={notification.notification_id}
                      {...notification}
                      onRead={handleRead}
                      onNavigateRead={handleNavigateRead}
                      onDelete={handleDelete}
                    />
                  ))
                ))}
            </div>
          </Fragment>
        ))}
      </section>
    </section>
  );
}
