'use client';

import Link from 'next/link';
import { IconNotification } from '@/public/svgs';
import { useGetNotificationCount } from '@/app/notification/hooks';
import { getCookie } from 'cookies-next';
import { ACCESS_TOKEN, SNACKBAR_TYPE } from '@/app/common/constants';
import { useSnackbarStore } from '@/app/common/store';
import { Button } from '@/app/common/components/ui/button';

export default function NotificationButton() {
  const accessToken = getCookie(ACCESS_TOKEN);
  const setSnackbar = useSnackbarStore((s) => s.setSnackbar);
  const { data: notificationCount } = useGetNotificationCount({
    enabled: !!accessToken,
  });

  if (!accessToken) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() =>
          setSnackbar({
            show: true,
            type: SNACKBAR_TYPE.ERROR,
            message: '로그인이 필요한 서비스입니다.',
            action: { label: '로그인 하기', href: '/auth/login' },
            duration: 3000,
          })
        }>
        <IconNotification />
      </Button>
    );
  }

  const hasNotification = notificationCount && notificationCount.notification_count > 0;

  return (
    <Link href="/notification">
      <div className="relative">
        <IconNotification />
        {hasNotification && <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />}
      </div>
    </Link>
  );
}
