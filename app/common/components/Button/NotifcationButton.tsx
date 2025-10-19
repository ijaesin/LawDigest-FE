'use client';

import Link from 'next/link';
import { IconNotification } from '@/public/svgs';
import { useGetNotificationCount } from '@/app/notification/hooks';
import { getCookie } from 'cookies-next';
import { ACCESS_TOKEN, SNACKBAR_TYPE } from '@/app/common/constants';
import { useSnackbarStore } from '@/app/common/store';

export default function NotificationButton() {
  const accessToken = getCookie(ACCESS_TOKEN);
  const setSnackbar = useSnackbarStore((s) => s.setSnackbar);

  if (!accessToken) {
    return (
      // eslint-disable-next-line jsx-a11y/anchor-is-valid
      <Link
        href="#"
        onClick={() =>
          setSnackbar({
            show: true,
            type: SNACKBAR_TYPE.ERROR,
            message: '로그인이 필요한 서비스입니다.',
            duration: 3000,
          })
        }>
        <IconNotification />
      </Link>
    );
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data: notificationCount } = useGetNotificationCount();

  if (notificationCount && notificationCount.notification_count === 0) {
    return (
      <Link href="/notification">
        <IconNotification />
      </Link>
    );
  }

  return (
    <Link href="/notification">
      <div className="relative">
        <IconNotification />
        <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
      </div>
    </Link>
  );
}
